import { Assets, Texture } from "pixi.js";
import { AssetOptions, TextureAsset } from "./TextureAsset";
import { Log } from "./Util";
import { sound, Sound } from "@pixi/sound";

export class ResourceLoader {
    private textureResources: Map<string, TextureAsset> = new Map<string, TextureAsset>();

    // TODO figure this out
    private soundResources: Map<string, Sound> = new Map<string, Sound>();

    constructor() {
    }

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

    async loadSound(name: string, path: string): Promise<Sound> {
        const sound: Sound = await Assets.load({ alias: name, path });
        this.soundResources.set(name, sound);
        Log.info(`Loaded sound '${name}'`);
        return Promise.resolve(sound);
    }

    /**
     * Auto load a directory of assets. Only works if using vite. Will load all images in src/assets.
     * Resource names will be the image names without the extension. e.g. the name for 'image.png' will be 'image'.
     * If the filename ends with _WxH.ext, that will be loaded into the asset options.
     * e.g. image_64x32.png → name 'image', options { tileWidth: 64, tileHeight: 32 }
     */
    async autoLoad(): Promise<void> {
        const promises = [];
        // @ts-ignore This only works with vite, which isn't actually a dependency of the engine.
        const files = import.meta.glob("/src/assets/*", {
            eager: true,
            import: "default",
        });
        console.log("found files", files);
        for (const [path, url] of Object.entries(files)) {
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
}
