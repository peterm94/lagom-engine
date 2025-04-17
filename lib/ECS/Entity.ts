import {Log, Util} from '../Common/Util'
import {Component} from './Component'
import {LagomType, LifecycleObject} from './LifecycleObject'
import {Scene} from './Scene'
import * as PIXI from 'pixi.js'
import {Observable} from "../Common/Observer";

/**
 * Entity base class. Raw entities can be used or subclasses can be defined similarly to prefabs.
 */
export class Entity extends LifecycleObject {
    /**
     * Set the depth of the entity. Used for update and draw order.
     * @param value The depth to set.
     */
    set depth(value: number) {
        this._depth = value
        this.transform.zIndex = value
    }

    /**
     * Event that is fired when a component is added to this entity.
     */
    readonly componentAddedEvent: Observable<Entity, Component> = new Observable()

    /**
     * Event for a component being removed from this entity.
     */
    readonly componentRemovedEvent: Observable<Entity, Component> = new Observable()

    /**
     * Event for a child entity being added.
     */
    readonly childAdded: Observable<Entity, Entity> = new Observable()

    /**
     * Event for a child entity being removed.
     */
    readonly childRemoved: Observable<Entity, Entity> = new Observable()

    /**
     * Entity name. Not unique, can be searched on.
     */
    readonly name: string

    /**
     * Components that this entity manages.
     */
    readonly components: Map<number, Component> = new Map();

    layer = 0

    // @ts-ignore
    private _depth = 0

    /**
     * Scene object that this entity belongs to.
     */
    scene!: Scene

    /**
     * Parent entity. This should only be null for a tree root (i.e. the scene root nodes).
     */
    parent: Entity | null = null

    /**
     * Child entities.
     */
    children: Map<number, Entity> = new Map();

    /**
     * The transform for this entity. All children transforms will be relative to this one.
     */
    transform: PIXI.Container = Util.sortedContainer()

    /**
     * Create a new entity. It must be added to a Game to actually do anything.
     * @param name The name of the entity. Used for lookups.
     * @param x The starting x position.
     * @param y The starting y position.
     * @param depth Entity depth. Used for draw order.
     */
    constructor(name: string, x = 0, y = 0, depth = 0) {
        super()
        this.name = name

        this.transform.x = x
        this.transform.y = y
        this.depth = depth
    }

    /**
     * Add a new component to the entity.
     * @param component The component to add.
     * @returns The added component.
     */
    addComponent<T extends Component>(component: T): T {
        component.parent = this

        // Add to the entity component list
        this.components.set(component.id, component)
        this.componentAddedEvent.trigger(this, component)

        component.onAdded()

        return component
    }

    /**
     * Remove a component from this entity.
     * @param component The component to remove.
     */
    removeComponent(component: Component): void {
        Log.trace('Removing component from entity.', component)

        if (!this.components.delete(component.id)) {
            Log.warn('Attempting to remove Component that does not exist on Entity.', component, this)
        }
        this.componentRemovedEvent.trigger(this, component)

        component.onRemoved()
    }

    /**
     * Get all components of a given type.
     * @param type The type of component to search for.
     * @param checkChildren Set to true if child entities should be checked as well. This will recurse to the bottom
     * of the entity tree.
     * @returns An array of all matching components.
     */
    getComponentsOfType<T extends Component>(type: LagomType<Component>, checkChildren = false): T[] {
        const matches: T[] = [];

        this.components.forEach(component => {
            if (component instanceof type) {
                matches.push(component as T)
            }
        })

        if (checkChildren) {
            // Check all children and add to result set.
            this.children.forEach(child => {
                const childComps = child.getComponentsOfType<T>(type, true)
                matches.push(...childComps)
            })
        }

        return matches
    }

    /**
     * Get the first component of a given type.
     * @param type The type of component to search for.
     * @param creator An optional function that will create a component if it is not present on an entity. This will
     * also add it to the entity. It will not be available until the next game tick.
     * @returns The component if found or created, otherwise null.
     */
    getComponent<T extends Component>(type: LagomType<Component>, creator?: () => Component): T | null {
        for (let component of this.components.values()) {
            if (component instanceof type) {
                return component as T
            }
        }

        // No matches
        if (creator) {
            // TODO this won't be added in time? may cause quirks.
            return this.addComponent(creator()) as T
        } else {
            return null
        }
    }

    onRemoved(): void {
        super.onRemoved()

        Log.trace('Destroying ', this.components)

        this.components.forEach(component => component.destroy())

        // Destroy any observers looking at us
        this.componentAddedEvent.releaseAll()
        this.componentRemovedEvent.releaseAll()
        this.childAdded.releaseAll()
        this.childRemoved.releaseAll()
    }

    destroy(): void {
        super.destroy()

        // Destroy our children
        this.children.forEach(child => child.destroy());

        // Destroy the entity.
        if (this.parent !== null) {
            this.parent.removeChild(this)
        }
    }

    getScene(): Scene {
        return this.scene
    }

    /**
     * Remove a child entity from this entity.
     * @param child The child entity to remove.
     */
    removeChild(child: Entity): void {
        Log.trace('Removing child object.', child.name, child)

        this.children.delete(child.id)

        this.scene.entities.delete(child.id)

        this.childRemoved.trigger(this, child)
        this.scene.entityRemovedEvent.trigger(this.scene, child)

        this.transform.removeChild(child.transform)

        child.onRemoved()
    }

    /**
     * Add a child to the container.
     * @param child The child to add.
     * @returns The added child.
     */
    addChild<T extends Entity>(child: T): T {
        Log.debug('Adding new child object.', child.name, child)
        child.parent = this
        child.scene = this.scene

        this.scene.entities.set(child.id, child)
        this.children.set(child.id, child)
        this.childAdded.trigger(this, child)
        this.scene.entityAddedEvent.trigger(this.scene, child)

        // Add the PIXI container to my node.
        this.transform.addChild(child.transform)

        child.onAdded()

        return child
    }

    /**
     * Find a child entity with the given name. This will traverse down the entity tree.
     * @param name The name of the entity to search for.
     * @returns The first matching entity if found, or null otherwise.
     */
    findChildWithName<T extends Entity>(name: string): T | null {
        // TODO this is stupid, we should index by name if we need to do this.
        const found = [...this.children.values()].find(value => value.name === name)
        if (found !== undefined) {
            return found as T
        }

        // Check children of children
        for (const child of this.children.values()) {
            const inner = child.findChildWithName(name)
            if (inner !== null) {
                return inner as T
            }
        }
        return null
    }
}
