import { Assets, Texture } from "pixi.js";
import { AssetOptions, TextureAsset } from "./TextureAsset";
import { Log } from "./Util";
import { Sound, sound } from "@pixi/sound";

// Stop pause on tab loss of focus
sound.disableAutoPause = true;

export class ResourceLoader {
    private textureResources: Map<string, TextureAsset> = new Map<string, TextureAsset>();

    private static SOUND_PREFIX = "lagom_sound__";

    constructor() {}

    /**
     * Add a resource to be loaded. Should be done in the resourceLoad method in a Game.
     * @param name Resource key. Used for retrieval.
     * @param path Path to resource. If using vite, import and pass through like this:
     * import muteButtonSpr from "./art/mute_button.png";
     * @param options Asset options for tiling or sprite sheets.
     */
    async loadTexture(name: string, path: string, options?: AssetOptions): Promise<TextureAsset> {
        const texture: Texture = await Assets.load({ alias: name, src: path });
        const asset = new TextureAsset(name, texture.source, options);
        this.textureResources.set(asset.alias, asset);
        Log.info(`Loaded asset '${name}' with config`, options);
        return Promise.resolve(asset);
    }

    async loadSound(name: string, path: string, volume = 1.0): Promise<Sound> {
        const alias = `${ResourceLoader.SOUND_PREFIX}${name}`;
        const sound: Sound = await Assets.load({ alias, src: path });
        sound.volume = volume;

        Log.info(`Loaded sound '${name}' with volume '${volume}'`);
        return Promise.resolve(sound);
    }

    async loadFont(name: string, path: string): Promise<void> {
        await Assets.load({ src: path, data: { family: name } });
        // Assets.add({ name, src: path });
        // await Assets.load({});
        // @ts-ignore
        Log.info(`Loaded font '${name}'`);
        return Promise.resolve();
    }

    /**
     * Autoload a directory of assets. Only works if using vite. Will load all files in `src/assets`.
     * If you want to load resources manually, use a different folder (or don't call this method at all).
     * Resource names will be the file names without the extension. e.g. the name for '`image.png`' will be '`image`'.
     *
     * ## Supported types
     *
     * ### Textures
     *
     * Extensions: `png`,`gif`,`bmp`,`jpg`,`webp`,`avif`,`svg`
     *
     * If the filename ends with `_WxH.ext`, that will be loaded into the asset options.
     * - e.g. `image_64x32.png` → name `'image'`, options `{ tileWidth: 64, tileHeight: 32 }`
     *
     * ### Fonts
     *
     * Extensions: `ttf`,`otf`,`woff`,`woff2`
     *
     * These will be directly usable in TextDisp objects as the font.
     *
     * ### Sounds
     *
     * Extensions: `aiff`,`caf`,`mid`,`mp3`,`mpeg`,`oga`,`ogg`,`opus`,`wav`,`wma`
     *
     * If the filename ends with `_VOLUME.ext`, the sound will be loaded in at the specified volume. The default volume
     * is `1`.
     * - e.g. `sound_0.1.wav` → name `'sound'`, volume `0.1` (10%)
     * - e.g. `sound_2.ogg` → name `'sound'`, volume `2` (200%)
     */
    async autoLoad(): Promise<void> {
        const promises = [];

        // Textures
        // @ts-ignore This only works with vite, which isn't actually a dependency of the engine.
        const textures = import.meta.glob("/src/assets/*.{png,gif,bmp,jpg,webp,avif,svg}", {
            eager: true,
            import: "default",
        });
        for (const [path, url] of Object.entries(textures)) {
            const filename = path.split("/").pop()!;
            const base = filename.replace(/\.[^.]+$/, "");
            const match = base.match(/_(\d+)x(\d+)$/);
            let alias = base;
            let options: AssetOptions | undefined = undefined;
            if (match) {
                const [, w, h] = match;
                options = { tileWidth: Number(w), tileHeight: Number(h) };
                alias = base.replace(/_\d+x\d+$/, "");
            }
            promises.push(this.loadTexture(alias, url as string, options));
        }

        // Fonts
        // @ts-ignore
        const fonts = import.meta.glob("/src/assets/*.{ttf,otf,woff,woff2}", {
            eager: true,
            import: "default",
        });
        for (const [path, url] of Object.entries(fonts)) {
            const filename = path.split("/").pop()!;
            const base = filename.replace(/\.[^.]+$/, "");
            promises.push(this.loadFont(base, url as string));
        }

        // Sounds
        // @ts-ignore
        const sounds = import.meta.glob("/src/assets/*.{aiff,caf,mid,mp3,mpeg,oga,ogg,opus,wav,wma}", {
            eager: true,
            import: "default",
        });
        for (const [path, url] of Object.entries(sounds)) {
            const filename = path.split("/").pop()!;
            const base = filename.replace(/\.[^.]+$/, "");

            // Matching a volume specification
            const match = base.match(/_(\d+(?:\.\d+)?)$/);

            let alias = base;
            let volume = 1;
            if (match) {
                volume = Number(match[1]);
                alias = base.replace(/_\d+(?:\.\d+)?$/, "");
            }
            promises.push(this.loadSound(alias, url as string, volume));
        }
        await Promise.all(promises);
    }

    /**
     * Load a resource.
     * @param name Resource key.
     */
    get(name: string): TextureAsset {
        const resource = this.textureResources.get(name);
        if (resource !== undefined) {
            return resource;
        }
        throw new Error(`Resource ${name} not defined.`);
    }
    getSound(name: string): Sound {
        const alias = `${ResourceLoader.SOUND_PREFIX}${name}`;
        const resource = Assets.get(alias);
        if (resource !== undefined) {
            return resource;
        }
        throw new Error(`Resource ${name} not defined.`);
    }
}
