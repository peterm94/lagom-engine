import {Component} from "./Component";
import {LifecycleObject, Updatable} from "./LifecycleObject";
import {Scene} from "./Scene";
import {Entity} from "./Entity";
import {Log} from "../Common/Util";

export class SystemFn<T extends any[]> extends LifecycleObject implements Updatable {
    private readonly runOn: Map<Entity, Component[]> = new Map();

    scene !: Scene;

    private types: { [K in keyof T]: Constructor<T[K]> };
    private runFn: (delta: number, entity: Entity, ...args: T) => void;

    constructor(readonly sysFun: SysFn<T>) {
        super();

        this.types = sysFun[0];
        this.runFn = sysFun[1];
    }

    private onComponentAdded(entity: Entity, component: Component): void {
        // Check if we care about this type at all

        if (this.types.find((val) => component instanceof val) === undefined) {
            return;
        }

        // Compute if we can run on this updated entity
        const entry = this.runOn.get(entity);

        // We already have an entry, nothing to do!
        if (entry !== undefined) return;

        // Check if we are now able to run on this entity
        const ret = this.findComponents(entity);
        if (ret === null) return;

        // Can run, add to update list
        this.runOn.set(entity, ret);
    }

    private findComponents(entity: Entity): Component[] | null {
        const ret: Component[] = [];

        for (const type of this.types) {
            const comp = entity.getComponent(type);
            if (comp == null) return null;
            ret.push(comp);
        }

        return ret;
    }

    private onComponentRemoved(entity: Entity, component: Component): void {
        // Check if we care about this type at all
        if (this.types.find((val) => component instanceof val) === undefined) {
            return;
        }

        const entry = this.runOn.get(entity);

        // Not actually registered, return
        if (entry === undefined) return;

        // Recompute if we can run on this entity, remove if we cannot
        const ret = this.findComponents(entity);
        if (ret === null) {
            // Can't run, remove entry
            this.runOn.delete(entity);
        } else {
            // Can run, update runOn
            this.runOn.set(entity, ret);
        }
    }

    private onEntityAdded(_: Scene, entity: Entity): void {
        // Register for component changes
        entity.componentAddedEvent.register(this.onComponentAdded.bind(this));
        entity.componentRemovedEvent.register(this.onComponentRemoved.bind(this));
    }

    private onEntityRemoved(_: Scene, entity: Entity): void {
        entity.componentAddedEvent.deregister(this.onComponentAdded.bind(this));
        entity.componentRemovedEvent.deregister(this.onComponentRemoved.bind(this));

        // Remove the entity from this System's run pool if it is registered.
        this.runOn.delete(entity);
    }

    addedToScene(scene: Scene): void {
        scene.entityAddedEvent.register(this.onEntityAdded.bind(this));
        scene.entityRemovedEvent.register(this.onEntityRemoved.bind(this));

        // We need to scan everything that already exists
        scene.entities.forEach(entity => {
            // Register listener for entity
            this.onEntityAdded(scene, entity);

            // Check it, add if ready.
            const ret = this.findComponents(entity);
            if (ret !== null) {
                this.runOn.set(entity, ret);
            }
        });
    }

    destroy() {
        super.destroy();

        this.onRemoved();
    }

    onRemoved(): void {
        super.onRemoved();

        const scene = this.getScene();
        scene.systems.delete(this.id);

        scene.entityAddedEvent.deregister(this.onEntityAdded.bind(this));
        scene.entityRemovedEvent.deregister(this.onEntityRemoved.bind(this));
    }

    update(delta: number) {
        this.runOn.forEach((value, key) => {
            Log.warn("calling update")
            // @ts-ignore
            this.runFn(delta, key, ...value)
        })
    }

    fixedUpdate(_: number): void {
        // Default empty implementation.
    }

    /**
     * Return the Scene object that this system belongs to.
     * @returns The parent Scene.
     */
    getScene(): Scene {
        return this.scene;
    }
}

type Constructor<T extends Component> = new (...args: any[]) => T;

export type SysFn<T extends any[]> = [{ [K in keyof T]: Constructor<T[K]> }, (delta: number, entity: Entity, ...args: T) => void];

export function newSystem<T extends any[]>(classes: { [K in keyof T]: Constructor<T[K]> },
                                           handler: (delta: number, entity: Entity, ...components: T) => void): SysFn<T> {
    return [classes, handler]
}
