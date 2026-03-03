import { FolderApi, Pane } from "tweakpane";
import { Component } from "../ECS/Component";
import { LagomType } from "../ECS/LifecycleObject";
import { GlobalSystem } from "../ECS/GlobalSystem";
import { Entity } from "../ECS/Entity";

/**
 * This is a system that listens to all component events for all instances.
 */
export class DebugSystem extends GlobalSystem<Component[][]> {
    update(delta: number): void {
        this.pane.refresh();
    }

    types: LagomType<Component>[] = [Component];

    pane: Pane;

    constructor() {
        super();
        // const container = document.createElement('div');
        // container.style.width = '500px';
        this.pane = new Pane({ title: "Entities" });
    }

    sceneEntities: Map<number, FolderApi> = new Map();

    protected entityRemoved(entity: Entity) {
        this.sceneEntities.get(entity.id)?.dispose();
        this.sceneEntities.delete(entity.id);
    }

    protected entityAdded(entity: Entity) {
        const folder = this.pane.addFolder({ title: `${entity.name} (${entity.id})` });
        const components: Map<number, any> = new Map();
        this.sceneEntities.set(entity.id, folder);

        entity.componentAddedEvent.register((_, component) => {
            const params = {
                type: component.constructor.name,
            };
            const compFolder = folder.addFolder({ title: `${component.constructor.name} (${component.id})` });
            bindComponentFields(compFolder, component);
            components.set(component.id, compFolder);
        });

        entity.componentRemovedEvent.register((_, data2) => {
            components.get(data2.id)?.dispose();
            components.delete(data2.id);
        });
    }
}

function bindComponentFields(pane: FolderApi, component: any): void {
    for (const key of Object.keys(component)) {
        const value = component[key];
        const valueType = typeof value;

        // Skip functions
        if (valueType === "function") continue;

        // Tweakpane only binds primitives or simple objects
        if (isBindable(value, key)) {
            pane.addBinding(component, key, { readonly: false });
        }
    }
}

// function isBindable(component: any, key: string): boolean {
//     if (component === null || component === undefined) {
//         return false;
//     }
//     const type = typeof component;
//
//     // primitives always bindable
//     if (type === "number" || type === "boolean" || type === "string") {
//         return true;
//     }
//
//     // objects require explicit annotation
//     const proto = Object.getPrototypeOf(component);
//     const bindableSet: Set<string | symbol> | undefined = proto?.[BindableObject];
//
//     if (bindableSet && bindableSet.has(key)) {
//         return true;
//     }
//
//     return false;
// }

function isBindable(component: any, key: string): boolean {
    if (component === null || component === undefined) {
        return false;
    }

    const hiddenSet = getMetaSet(component, HiddenField);
    if (hiddenSet?.has(key)) return false;

    const type = typeof component;

    if (type === "function") return false;

    if (type === "number" || type === "boolean" || type === "string") {
        return true;
    }

    const bindableSet = getMetaSet(component, BindableObject);
    if (bindableSet?.has(key)) return true;

    return false;
}

const BindableObject = Symbol("BindableObject");
const ReadonlyField = Symbol("ReadonlyField");
const HiddenField = Symbol("HiddenField");

export function bindableObject(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        if (!target[BindableObject]) {
            target[BindableObject] = new Set<string | symbol>();
        }
        target[BindableObject].add(propertyKey);
    };
}

export function readonly(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        const proto = target as any;
        (proto[ReadonlyField] ??= new Set()).add(propertyKey);
    };
}


// TODO write these by hand the robot is shit
export function hidden(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        if (!target[HiddenField]) {
            target[HiddenField] = new Set();
        }
        target[HiddenField].add(propertyKey);
    };
}

function getMetaSet(obj: any, symbol: symbol): Set<string | symbol> | undefined {
    const proto = Object.getPrototypeOf(obj);
    return proto?.[symbol];
}
