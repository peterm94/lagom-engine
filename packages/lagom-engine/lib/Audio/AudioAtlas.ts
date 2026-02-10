import { Sound, sound } from "@pixi/sound";

// Stop pause on tab loss of focus
sound.disableAutoPause = true;

/**
 * Audio loader/atlas.
 */
export class AudioAtlas {
    readonly sounds: Map<string, Sound> = new Map();

    /**
     * Load an audio file for use.
     * If using typescript, use something like: AudioAtlas.load("jump", require("./resources/jump.wav"));
     *
     * @param key The name of the audio resource.
     * @param audioResource The resource to load.
     * @returns A Howl instance for the resource.
     */
    load(key: string, audioResource: string): Sound {
        const resource = sound.add(key, { url: audioResource });

        this.sounds.set(key, resource);

        return resource;
    }

    /**
     * Convenience method to play an audio file.
     *
     * @param key The audio ID that it was loaded with.
     * @returns The Howl instance for the resource if found, otherwise undefined.
     */
    play(key: string): Sound | undefined {
        const sound = this.sounds.get(key);

        if (sound !== undefined) {
            sound.play();
        }

        return sound;
    }

    /**
     * Get an audio resource with a specified key. This allows for advanced usage of the Howl API.
     * @param key The audio ID that resource was loaded with.
     * @returns The Howl instance for the resource if found, otherwise undefined.
     */
    get(key: string): Sound | undefined {
        return this.sounds.get(key);
    }
}
