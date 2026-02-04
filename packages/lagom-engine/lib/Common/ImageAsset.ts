import { Rectangle, Texture, TextureSource } from "pixi.js";
import { Sprite, SpriteConfig } from "./Sprite/Sprite";

export interface AssetOptions {
    tileWidth: number;
    tileHeight: number;
}

export class LTexture extends Texture {
    sprite(config?: SpriteConfig): Sprite {
        return new Sprite(this, config);
    }
}

export class ImageAsset {
    private readonly cols: number;
    private readonly rows: number;
    private readonly tileWidth: number;
    private readonly tileHeight: number;

    constructor(
        readonly alias: string,
        readonly texture: TextureSource,
        options?: AssetOptions,
    ) {
        this.cols = options?.tileWidth ? texture.width / options.tileWidth : 1;
        this.rows = options?.tileHeight ? texture.height / options.tileHeight : 1;

        // Validate we divide cleanly
        if (!Number.isInteger(this.cols) || !Number.isInteger(this.rows)) {
            throw new Error(`Sprite '${alias} has incorrect tile dimensions.`);
        }

        this.tileWidth = options?.tileWidth ?? texture.width;
        this.tileHeight = options?.tileHeight ?? texture.height;
    }

    tileAt(column: number, row: number): LTexture {
        return this.fromPoints(column * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight);
    }

    fromPoints(x: number, y: number, w: number, h: number): LTexture {
        return new LTexture({
            source: this.texture,
            frame: new Rectangle(x, y, w, h),
        });
    }

    tileIdx(index: number): LTexture {
        return this.tileAt(index % this.cols, Math.floor(index / this.rows));
    }

    tileSlice(firstIdx: number, lastIdx: number): LTexture[] {
        return Array.from({ length: lastIdx - firstIdx + 1 }, (_, i) => this.tileIdx(firstIdx + i));
    }

    allTiles(): LTexture[] {
        return this.tileSlice(0, this.rows * this.cols);
    }
}
