import {Sprite, SpriteConfig} from "./Sprite";
import {Texture} from "pixi.js";
import {MathUtil} from "../Util";

/**
 * A Sprite type that takes a texture array and randomly assigns one option to the sprite.
 */
export class VariantSprite extends Sprite {
    /**
     * @param textures Possible Sprite textures.
     * @param config Sprite configuration.
     */
    constructor(readonly textures: Texture[], config: SpriteConfig) {
        super(textures[MathUtil.randomRange(0, textures.length)], config);
    }

    /**
     * Reroll the texture. Useful if reusing the component.
     */
    reroll() {
        this.pixiObj.texture = this.textures[MathUtil.randomRange(0, this.textures.length)];
    }
}