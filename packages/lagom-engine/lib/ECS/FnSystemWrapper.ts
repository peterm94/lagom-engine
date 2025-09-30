import {Component} from "./Component";
import {Entity} from "./Entity";
import {System} from "./System";

/**
 * Wrapper for systems so you can just provide a magic function.
 */
export class FnSystemWrapper<T extends Component[]> extends System<T> {
    types: { [K in keyof T]: CType<T[K]>; };

    runOnEntities(delta: number, entity: Entity, ...args: T): void {
        this.runFn(delta, entity, ...args);
    }

    private readonly runFn: (delta: number, entity: Entity, ...args: T) => void;

    constructor(readonly sysFun: SysFn<T>) {
        super();

        this.types = sysFun[0];
        this.runFn = sysFun[1];
    }
}

/**
 * Component constructor type. You can just provide the class name of a component if a type value is required.
 * e.g. If you are required to provide a `CType<A>`, you can just pass an `A`.
 */
export type CType<T extends Component> = new (...args: any[]) => T;

export type SysFn<T extends Component[]> = [{ [K in keyof T]: CType<T[K]> }, (delta: number, entity: Entity, ...args: T) => void];

/**
 * Create a new functional system.
 *
 * @param classes An array of component types to support.
 * @param func The system update() method. Requires each component type as an added parameter to the function.
 */
export function newSystem<T extends Component[]>(classes: { [K in keyof T]: CType<T[K]> },
                                           func: (delta: number, entity: Entity, ...components: T) => void): SysFn<T> {
    return [classes, func]
}
