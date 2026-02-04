import { Rectangle, Texture, TextureSource } from "pixi.js";
import { Sprite, SpriteConfig } from "./Sprite/Sprite";

export interface AssetOptions {
    tileWidth: number;
    tileHeight: number;
}

export class LTexture extends Texture {

    /**
     * Create a sprite from this texture slice.
     * @param config Sprite config.
     */
    sprite(config?: SpriteConfig): Sprite {
        return new Sprite(this, config);
    }
}

/**
 * Loaded Texture Asset. Can be used to get the full texture or slices for animations or sprite sheets.
 */
export class TextureAsset {
    private readonly cols: number;
    private readonly rows: number;
    private readonly tileWidth: number;
    private readonly tileHeight: number;

    /**
     * @param alias Name for the asset. Used for retrieval.
     * @param texture Texture source to wrap.
     * @param options Options for inner tile dimensions.
     */
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

    /**
     * Return a tile at a requested column and row. 0 indexed.
     * @param column Tile column.
     * @param row Tile row.
     */
    tileAt(column: number, row: number): LTexture {
        return this.fromPoints(column * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight);
    }

    /**
     * Return an arbitrary subtexture.
     * @param x Top left x pixel.
     * @param y Top left y pixel.
     * @param w Texture width.
     * @param h Texture height.
     */
    fromPoints(x: number, y: number, w: number, h: number): LTexture {
        return new LTexture({
            source: this.texture,
            frame: new Rectangle(x, y, w, h),
        });
    }

    /**
     * Return a tile at the requested index. 0 indexed, rows before column.
     * e.g. in a 3 wide, 2 high sprite, index '3' would be the first item in the second row.
     * @param index Tile index.
     */
    tileIdx(index: number): LTexture {
        return this.tileAt(index % this.cols, Math.floor(index / this.rows));
    }

    /**
     * Return a texture slice between the provided index values. Zero indexed, rows before columns.
     * @param firstIdx First requested texture index.
     * @param lastIdx Last texture index of the slice, inclusive.
     */
    tileSlice(firstIdx: number, lastIdx: number): LTexture[] {
        return Array.from({ length: lastIdx - firstIdx + 1 }, (_, i) => this.tileIdx(firstIdx + i));
    }

    /**
     * Return all tiles in the texture, loaded as rows before column order.
     */
    allTiles(): LTexture[] {
        return this.tileSlice(0, this.rows * this.cols);
    }
}
