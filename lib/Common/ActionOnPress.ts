import {Key} from "../Input/Key";
import {System} from "../ECS/System";
import {Entity} from "../ECS/Entity";

/**
 * Run a function on keypress. Key list is configurable.
 */
export class ActionOnPress extends System<[]> {
    types: [] = [];

    constructor(readonly action: () => void, readonly keys: Key[] = [Key.Space, Key.KeyA, Key.KeyD, Key.KeyW, Key.KeyS, Key.KeyZ, Key.KeyX]) {
        super();
    }

    update(delta: number): void {
        super.update(delta);
        if (this.scene.game.keyboard.isKeyPressed(...this.keys)) {
            this.action();
        }
    }

    runOnEntities(_delta: number, _entity: Entity): void {
    }
}
