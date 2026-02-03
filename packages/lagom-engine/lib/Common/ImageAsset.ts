import {Assets, Rectangle, Texture, TextureSource} from "pixi.js";

export interface AssetOptions {
    tileWidth: number;
    tileHeight: number;
}

export class ImageAsset {

    constructor(readonly alias: string, readonly texture: TextureSource, readonly options?: AssetOptions) {
    }

    tileAt(column: number, row: number): Texture {
        if (this.options === undefined) {
            throw new Error("Image Asset does not have defined tile settings")
        }

        return new Texture({
            source: this.texture, frame: new Rectangle(column * this.options.tileWidth,
                row * this.options.tileHeight,
                this.options.tileWidth, this.options.tileHeight)
        });
    }


}