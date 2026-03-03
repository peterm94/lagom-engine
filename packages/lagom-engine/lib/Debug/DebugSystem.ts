import { FolderApi, Pane } from "tweakpane";
import { Component } from "../ECS/Component";
import { LagomType } from "../ECS/LifecycleObject";
import { GlobalSystem } from "../ECS/GlobalSystem";
import { Entity } from "../ECS/Entity";
import { ReadonlyField, VisibleField } from "./Decorators";

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
    if (component == undefined) {
        return;
    }
    const fields = getVisibleFields(component);
    for (const key of fields) {
        const value = component[key];
        const valueType = typeof value;

        // Skip anything unbindable
        if (!doBind(component, key, valueType)) {
            continue;
        }

        const readonly = isReadonly(component, key);
        pane.addBinding(component, key, { readonly });
    }
}

function doBind(component: any, propertyKey: string, valueType: string): boolean {
    if (valueType === "function") return false;

    if (valueType === "number" || valueType === "boolean" || valueType === "string") {
        return true;
    }

    // Objects need some work, but we will allow it for now.
    return true;
}

function getVisibleFields(obj: any): Set<string> {
    const proto = Object.getPrototypeOf(obj);
    const visible: Set<string> = proto?.[VisibleField] ?? new Set();
    const readonly: Set<string> = proto?.[ReadonlyField];
    if (readonly) {
        return visible.union(readonly);
    }
    return visible;
}

function isReadonly(obj: any, field: string): boolean {
    const proto = Object.getPrototypeOf(obj);
    return proto?.[ReadonlyField]?.has(field) ?? false;
}
