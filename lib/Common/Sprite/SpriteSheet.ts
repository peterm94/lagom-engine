import {Assets, SCALE_MODES, Texture} from "pixi.js";

/**
 * Convenient way to load multiple sprites from a single Sprite Sheet.
 */
export class SpriteSheet {
    private readonly sheetTexture: Texture;

    /**
     * Create a new SpriteSheet.
     * @param resource The base sprite sheet resource.
     * @param tileWidth The width of the tiles on the sheet.
     * @param tileHeight The height of the tiles on the sheet.
     */
    constructor(resource: string, private readonly tileWidth: number, private readonly tileHeight: number) {
        this.sheetTexture = Texture.from(resource);
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        // Turn off antialiasing. I'm not even making this optional, who would want it on?
        // TODO check this is supposed to be source and not just the texture itself.
        this.sheetTexture._source.scaleMode = SCALE_MODES.NEAREST;
    }

    public async load(): Promise<unknown> {
        // TODO look into this assets thing more
        return await Assets.load(this.sheetTexture);
    }

    /**
     * Get a texture from the SpriteSheet.
     * @param column The column index for the texture.
     * @param row The row index for the texture.
     * @param width Optional override for the texture width.
     * @param height Optional override for the texture height.
     */
    // @ts-ignore
    texture(column: number, row: number, width?: number, height?: number): Texture {
        // @ts-ignore
        const w = width || this.tileWidth;
        // @ts-ignore
        const h = height || this.tileHeight;

        return Texture.from("");
        // return new Texture({
        //     source: this.sheetTexture, trim: new Rectangle(column * this.tileWidth,
        //         row * this.tileHeight, w, h)
        // })
    }

    /**
     * Get a texture from the spritesheet using pixel offsets.
     * @param x X Pixel offset.
     * @param y Y Pixel offset.
     * @param width Width in pixels.
     * @param height Height in pixels.
     */
    // @ts-ignore
    textureFromPoints(x: number, y: number, width: number, height: number): Texture {
        return Texture.from("");
        // return new Texture({source: this.sheetTexture, trim: new Rectangle(x, y, width, height)});
    }

    /**
     * Create a texture by index.
     * @param index Tile index of the texture to load.
     * @returns The loaded texture.
     */
    // @ts-ignore
    textureFromIndex(index: number): Texture {
        return Texture.from("");
        //
        // // TODO is the res correct?
        // const col = index % (this.sheetTexture.pixelWidth / this.tileWidth);
        // const row = Math.floor(index / (this.sheetTexture.pixelHeight / this.tileHeight));
        //
        // return new Texture({
        //     source: this.sheetTexture, trim: new Rectangle(col * this.tileWidth,
        //         row * this.tileHeight,
        //         this.tileWidth, this.tileHeight)
        // });
    }

    /**
     * Get multiple textures from the SpriteSheet.
     * @param frames Desired texture indexes from the SpriteSheet. Supplied as pairs of [column, row].
     * @param width Optional override for the texture width.
     * @param height Optional override for the texture height.
     * @returns The loaded textures.
     */
    textures(frames: [number, number][], width?: number, height?: number): Texture[] {
        const textures = [];
        for (const frame of frames) {
            textures.push(this.texture(frame[0], frame[1], width, height));
        }
        return textures;
    }

    /**
     * Slices a row of textures with. Starting at [start] and ending at [end], inclusively.
     * @param row The row of textures to slice.
     * @param start The start index of the slice. Inclusive.
     * @param end The end index of the slice. Inclusive.
     * @param width Optional override for the texture width.
     * @param height Optional override for the texture height.
     * @returns The loaded texture.
     */
    textureSliceFromRow(row: number, start: number, end: number, width?: number, height?: number): Texture[] {
        const textures = [];

        for (let i = start; i <= end; i++) {
            textures.push(this.texture(i, row, width, height));
        }

        return textures;
    }

    /**
     * Slices all sprites out of the first row of the SpriteSheet.
     * @returns PIXI.Texture[] The loaded textures.
     */
    textureSliceFromSheet(): Texture[] {
        const end = Math.floor(this.sheetTexture.width / this.tileWidth);
        return this.textureSliceFromRow(0, 0, end - 1)
    }
}
