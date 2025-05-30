import {Log, Util} from "../Common/Util";
import {Entity} from "./Entity";
import {Component} from "./Component";
import {LagomType, LifecycleObject, Updatable} from "./LifecycleObject";
import {Scene} from "./Scene";

/**
 * Global system base class. Designed to run on batches of Components. Will be run every update frame.
 */
export abstract class GlobalSystem<T extends Component[][]> extends LifecycleObject implements Updatable
{
    // The key type is technically wrong, but it works because types aren't real
    private readonly runOn: Map<{ new(): Component }, Component[]> = new Map();

    scene !: Scene;

    /**
     * Update will be called every game tick.
     * @param delta The elapsed time since the last update call.
     */
    abstract update(delta: number): void;

    fixedUpdate(_: number): void
    {
        // Fixed update is called with a fixed data.
        // Default implementation provided because it isn't usually required.
    }

    /**
     * An array of types that this GlobalSystem will run on. This should remain static.
     * @returns An array of component types to run on during update().
     */
    abstract types: LagomType<Component>[];

    /**
     * Call this in update() to retrieve the collection of components to run on.
     * @param f A function which accepts a parameter for each type returned by types(). For example, if
     * types() returns [Sprite, Collider], the function will be passed two arrays, (sprites: Sprite[], colliders:
     * Collider[]).
     */
    protected runOnComponents(f: (...components: T) => void): void
    {
        // @ts-ignore
        f(...Array.from(this.runOn.values()));
    }

    /**
     * Call this in update() to retrieve the collection of components to run on. Will pass the system itself as the
     * first parameter to the passed in function.
     * @param f A function which first provides a parameter for this system, and then a parameter for each type
     * returned by types(). For example, if types() returns [Sprite, Collider], the function will be passed the
     * system and t hen two arrays, (system: GlobalSystem, sprites: Sprite[], colliders: Collider[]).
     */
    protected runOnComponentsWithSystem(f: (system: this, ...components: T) => void): void
    {
        // @ts-ignore
        f(this, ...Array.from(this.runOn.values()));
    }

    private onComponentAdded(_: Entity, component: Component): void
    {
        // Check if we care about this type at all
        const type = this.types.find((val) => {
            return component instanceof val;
        });

        if (type === undefined) return;

        let compMap = this.runOn.get(type.prototype);

        if (compMap === undefined)
        {
            Log.warn("Expected component map does not exist on GlobalSystem.", this, type.prototype);
            compMap = [];
            this.runOn.set(type.prototype, compMap);
        }
        compMap.push(component);
    }

    private onComponentRemoved(_: Entity, component: Component): void
    {
        // Check if we care about this type at all
        const type = this.types.find((val) => {
            return component instanceof val;
        });

        if (type === undefined) return;

        const components = this.runOn.get(type.prototype);

        // Nothing registered, return
        if (components === undefined) return;

        // Get it out of the list if it is in it
        Util.remove(components, component);
    }

    private onEntityAdded(_: Scene, entity: Entity): void
    {
        // Register for component changes
        entity.componentAddedEvent.register(this.onComponentAdded.bind(this));
        entity.componentRemovedEvent.register(this.onComponentRemoved.bind(this));
    }

    private onEntityRemoved(_: Scene, entity: Entity): void
    {
        entity.componentAddedEvent.deregister(this.onComponentAdded.bind(this));
        entity.componentRemovedEvent.deregister(this.onComponentRemoved.bind(this));
    }

    addedToScene(scene: Scene): void
    {
        // make each component map
        this.types.forEach(type => {
            this.runOn.set(type.prototype, []);
        });

        scene.entityAddedEvent.register(this.onEntityAdded.bind(this));
        scene.entityRemovedEvent.register(this.onEntityRemoved.bind(this));

        // We need to scan everything that already exists
        scene.entities.forEach((entity: Entity) => {
            // Register listener for entity
            this.onEntityAdded(scene, entity);

            // Add any existing components
            entity.components.forEach((component) => {
                this.onComponentAdded(entity, component);
            });
        });
    }

    destroy() {
        super.destroy();

        this.onRemoved();
    }

    onRemoved(): void
    {
        super.onRemoved();

        const scene = this.getScene();
        scene.globalSystems.delete(this.id);

        scene.entityAddedEvent.deregister(this.onEntityAdded.bind(this));
        scene.entityRemovedEvent.deregister(this.onEntityRemoved.bind(this));
    }

    /**
     * Return the Scene object that this system belongs to.
     * @returns The parent Scene.
     */
    getScene(): Scene
    {
        return this.scene;
    }
}
