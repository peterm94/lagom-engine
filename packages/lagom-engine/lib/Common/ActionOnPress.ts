import { Key } from "../Input/Key";
import { System } from "../ECS/System";
import { Entity } from "../ECS/Entity";
import { Game } from "../ECS/Game";

/**
 * Run a function on keypress. Key list is configurable.
 */
export class ActionOnPress extends System<[]> {
    types: [] = [];

    constructor(
        readonly action: () => void,
        readonly keys: Key[] = [Key.Space, Key.KeyA, Key.KeyD, Key.KeyW, Key.KeyS, Key.KeyZ, Key.KeyX],
    ) {
        super();
    }

    update(delta: number): void {
        super.update(delta);
        if (Game.keyboard.isKeyPressed(...this.keys)) {
            this.action();
        }
    }

    runOnEntities(_delta: number, _entity: Entity): void {}
}
