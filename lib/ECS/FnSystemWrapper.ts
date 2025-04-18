import {Component} from "./Component";
import {Entity} from "./Entity";
import {System} from "./System";
import { LagomType } from "./LifecycleObject";

/**
 * Wrapper for systems so you can just provide a magic function.
 */
export class FnSystemWrapper<T extends any[]> extends System<T> {
    types: LagomType<Component>[];

    private readonly runFn: (delta: number, entity: Entity, ...args: T) => void;

    constructor(readonly sysFun: SysFn<T>) {
        super();

        this.types = sysFun[0];
        this.runFn = sysFun[1];
    }

    update(delta: number) {
        this.runOnEntities((entity, ...components) => {
            this.runFn(delta, entity, ...components);
        })
    }
}

export type Constructor<T extends Component> = new (...args: any[]) => T;

export type SysFn<T extends any[]> = [{ [K in keyof T]: Constructor<T[K]> }, (delta: number, entity: Entity, ...args: T) => void];

/**
 * Create a new functional system.
 *
 * @param classes An array of component types to support.
 * @param func The system update() method. Requires each component type as an added parameter to the function.
 */
export function newSystem<T extends any[]>(classes: { [K in keyof T]: Constructor<T[K]> },
                                           func: (delta: number, entity: Entity, ...components: T) => void): SysFn<T> {
    return [classes, func]
}
