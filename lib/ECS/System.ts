import {Entity} from "./Entity";
import {Component} from "./Component";
import {LifecycleObject, Updatable} from "./LifecycleObject";
import {Scene} from "./Scene";
import {CType} from "./FnSystemWrapper";

/**
 * System base class. Systems should be used to run on groups of components.
 * Note that this will only trigger if every component type is represented on an entity. Partial matches will not run.
 */

export abstract class System<T extends Component[]> extends LifecycleObject implements Updatable {
    private readonly runOn: Map<Entity, Component[]> = new Map();

    scene !: Scene;

    /**
     * Provide the types that this system runs on. Due to runtime type system limitations, this needs to be provided as
     * well as the generic types. Make sure the values match, it will not compile if the order is not preserved.
     */
    abstract types: { [K in keyof T]: CType<T[K]> }

    /**
     * A function that will be called with the requested components passed through as parameters. The
     * owning entity will always be the first parameter, followed by each component in the order defined by types().
     * For example, if types() is [Sprite, Collider], the function arguments would look as follows: (entity:
     * Entity, sprite: Sprite, collider: Collider).
     * @param delta Milliseconds since the last function call.
     * @param entity The owning entity that we are processing.
     * @param args Component instances on the given entity, as defined as required.
     */
    abstract runOnEntities(delta: number, entity: Entity, ...args: T): void;

    runOnEntitiesFixed(_delta: number, _entity: Entity, ..._args: T): void {
        // Default empty impl
    };

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

    /**
     * Update will be called every game tick.
     * @param delta The elapsed time since the last update call.
     */
    update(delta: number): void {
        this.runOn.forEach((values: Component[], key: Entity) => {
            this.runOnEntities(delta, key, ...values as T);
        });
    }

    fixedUpdate(delta: number): void {
        this.runOn.forEach((values: Component[], key: Entity) => {
            this.runOnEntitiesFixed(delta, key, ...values as T);
        });
    }

    /**
     * Return the Scene object that this system belongs to.
     * @returns The parent Scene.
     */
    getScene(): Scene {
        return this.scene;
    }
}
