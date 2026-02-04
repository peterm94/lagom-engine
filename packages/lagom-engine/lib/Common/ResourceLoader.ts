import { Assets, Texture } from "pixi.js";
import { AssetOptions, ImageAsset } from "./ImageAsset";

export class ResourceLoader {
    private resources: Map<string, ImageAsset> = new Map<string, ImageAsset>();

    async addResource(name: string, path: string, options?: AssetOptions): Promise<ImageAsset> {
        const texture: Texture = await Assets.load({ alias: name, src: path });
        const asset = new ImageAsset(name, texture.source, options);
        this.resources.set(asset.alias, asset);
        console.log("loaded asset ", name);
        return Promise.resolve(asset);
    }

    get(name: string): ImageAsset {
        const resource = this.resources.get(name);
        if (resource !== undefined) {
            return resource;
        }
        throw new Error(`Resource ${name} not defined.`);
    }

    // TODO delete?
    loadAll(): Promise<unknown> {
        return Promise.all([]);
        // const promises: Promise<unknown>[] = [];
        //
        // this.resources.forEach(value => promises.push(value.loader));
        //
        // return Promise.all(promises);
    }
}
