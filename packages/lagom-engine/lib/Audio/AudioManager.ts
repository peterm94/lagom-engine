import { Game } from "../ECS/Game";
import { Log } from "../Common/Util";
import { Sound } from "@pixi/sound";

export class AudioManager {
    muted: boolean = false;
    private musicName: string | undefined;

    stopAllSounds(stopMusic: boolean = true) {
        Game.resourceLoader.allSounds.forEach((value) => {
            if (value !== "music" || stopMusic) {
                this.stop(value);
            }
        });
    }

    toggleMuted() {
        this.muted = !this.muted;

        if (this.muted) {
            this.stopAllSounds();
        } else {
            this.startMusic(this.musicName);
        }
    }

    startMusic(musicName: string | undefined, loop: boolean = true) {
        this.musicName = musicName;
        if (musicName === undefined) return;
        const music = this.play(musicName);
        if (music) {
            music.loop = loop;
        }
    }

    play(soundName: string, restart = false): Sound | undefined {
        if (this.muted) return;
        try {
            const sound = Game.resourceLoader.getSound(soundName);
            console.log(sound);
            if (!sound.isPlaying || restart) {
                sound.play();
            }
            return sound;
        } catch (e) {
            Log.error("Sound missing: ", soundName);
        }
    }

    stop(soundName: string) {
        Game.resourceLoader.getSound(soundName).stop();
    }
}
