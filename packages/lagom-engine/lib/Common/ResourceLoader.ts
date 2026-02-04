import { Assets, Texture } from "pixi.js";
import { AssetOptions, TextureAsset } from "./TextureAsset";

export class ResourceLoader {
    private resources: Map<string, TextureAsset> = new Map<string, TextureAsset>();

    /**
     * Add a resource to be loaded. Should be done in the resourceLoad method in a Game.
     * @param name Resource key. Used for retrieval.
     * @param path Path to resource. If using vite, import and pass through like this:
     * import muteButtonSpr from "./art/mute_button.png";
     * @param options Asset options for tiling or sprite sheets.
     */
    async addResource(name: string, path: string, options?: AssetOptions): Promise<TextureAsset> {
        const texture: Texture = await Assets.load({ alias: name, src: path });
        const asset = new TextureAsset(name, texture.source, options);
        this.resources.set(asset.alias, asset);
        console.log("loaded asset ", name);
        return Promise.resolve(asset);
    }

    /**
     * Load a resource.
     * @param name Resource key.
     */
    get(name: string): TextureAsset {
        const resource = this.resources.get(name);
        if (resource !== undefined) {
            return resource;
        }
        throw new Error(`Resource ${name} not defined.`);
    }
}
