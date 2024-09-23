import {Key} from "../Input/Key.ts";
import {System} from "../ECS/System.ts";

/**
 * Run a function on keypress. Key list is configurable.
 */
export class ActionOnPress extends System<[]> {

    constructor(readonly action: () => void, readonly keys: Key[] = [Key.Space, Key.KeyA, Key.KeyD, Key.KeyW, Key.KeyS, Key.KeyZ, Key.KeyX]) {
        super();
    }

    types = [];

    update(_delta: number): void {

        if (this.scene.game.keyboard.isKeyPressed(...this.keys)) {
            this.action();
        }
    }
}
