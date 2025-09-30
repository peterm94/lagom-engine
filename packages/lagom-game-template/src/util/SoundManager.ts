import {AnimatedSpriteController, Button, Component, CType, Entity, Key, System, Timer} from "lagom-engine";

import {GameTemplate} from "../GameTemplate.ts";

class MuteComp extends Component {
}

class MuteListener extends System<[AnimatedSpriteController, MuteComp]> {
    types: [CType<AnimatedSpriteController>, CType<MuteComp>] = [AnimatedSpriteController, MuteComp];

    runOnEntities(delta: number, e: Entity, spr: AnimatedSpriteController, args_1: MuteComp): void {
        if (this.scene.game.mouse.isButtonPressed(Button.LEFT)) {
            const pos = e.scene.game.renderer.plugins.interaction.mouse.global;

            if (pos.x >= GameTemplate.GAME_WIDTH - 24 && pos.x <= GameTemplate.GAME_WIDTH - 8 && pos.y >= GameTemplate.GAME_HEIGHT - 24 && pos.y <= GameTemplate.GAME_HEIGHT - 8) {
                (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                spr.setAnimation(Number(GameTemplate.muted));
            }
        } else if (this.scene.game.keyboard.isKeyPressed(Key.KeyM)) {
            (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
            spr.setAnimation(Number(GameTemplate.muted));
        }
    }
}

export class SoundManager extends Entity {
    constructor() {
        super("audio", GameTemplate.GAME_WIDTH - 16 - 8, GameTemplate.GAME_HEIGHT - 24, 0);
        this.startMusic();
    }

    onAdded(): void {
        super.onAdded();

        this.addComponent(new MuteComp());
        const spr = this.addComponent(new AnimatedSpriteController(Number(GameTemplate.muted), [
            {
                id: 0,
                textures: [this.scene.game.getResource("mute_button").texture(0, 0, 16, 16)]
            }, {
                id: 1,
                textures: [this.scene.game.getResource("mute_button").texture(1, 0, 16, 16)]
            }]));

        this.addComponent(new Timer(50, spr, false)).onTrigger.register((caller, data) => {
            data.setAnimation(Number(GameTemplate.muted));
        });

        this.scene.addSystem(new MuteListener());
    }

    toggleMute() {
        GameTemplate.muted = !GameTemplate.muted;

        if (GameTemplate.muted) {
            this.stopAllSounds();
        } else {
            this.startMusic();
        }
    }

    startMusic() {
        if (!GameTemplate.muted && !GameTemplate.musicPlaying) {
            GameTemplate.audioAtlas.play("music");
            GameTemplate.musicPlaying = true;
        }
    }

    stopAllSounds(music = true) {
        if (music) {
            GameTemplate.audioAtlas.sounds.forEach((v: any, k: string) => v.stop());
            GameTemplate.musicPlaying = false;
        } else {
            GameTemplate.audioAtlas.sounds.forEach((v: any, k: string) => {
                if (k !== "music") v.stop();
            });
        }
    }

    onRemoved(): void {
        super.onRemoved();
        this.stopAllSounds(false);
    }

    playSound(name: string, restart = false) {
        if (!GameTemplate.muted) {
            if (GameTemplate.audioAtlas.sounds.get(name)?.playing() && !restart) return;
            GameTemplate.audioAtlas.play(name);
        }
    }

    stopSound(name: string) {
        GameTemplate.audioAtlas.sounds.forEach((value, key) => {
            if (key === name) {
                value.stop();
            }
        })
    }
}
