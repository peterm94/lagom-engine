import { FolderApi, Pane } from "tweakpane";
import { Component } from "../ECS/Component";
import { LagomType } from "../ECS/LifecycleObject";
import { GlobalSystem } from "../ECS/GlobalSystem";
import { Entity } from "../ECS/Entity";
import { ReadonlyField, VisibleField } from "./Decorators";
import { Log } from "../Common/Util";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { ButtonGridApi } from "@tweakpane/plugin-essentials";
import { TpButtonGridEvent } from "@tweakpane/plugin-essentials/dist/types/button-grid/api/tp-button-grid-event";

/**
 * This is a system that listens to all component events for all instances.
 */
export class DebugSystem extends GlobalSystem<Component[][]> {
    update(delta: number): void {
        this.pane.refresh();
    }

    types: LagomType<Component>[] = [Component];

    pane: Pane;
    enityFolder: FolderApi;

    constructor() {
        super();
        // const container = document.createElement('div');
        // container.style.width = '500px';
        this.pane = new Pane({ title: "Debugger" });
        this.pane.registerPlugin(EssentialsPlugin);
        const control = this.pane.addFolder({ title: "Frame Control", expanded: true });
        const buttons: ButtonGridApi = control.addBlade({
            view: "buttongrid",
            size: [2, 1],
            cells: (x: number, y: number) => ({
                title: [["⏸", "▶❘"]][y][x],
            }),
        }) as EssentialsPlugin.ButtonGridApi;
        buttons.cell(1, 0)!.disabled = true;
        buttons.on("click", (ev: TpButtonGridEvent) => {
            // Start/Pause
            if (ev.index[0] === 0) {
                const paused = !this.getScene().game.debug.paused;
                this.getScene().game.debug.paused = paused;
                buttons.cell(1, 0)!.disabled = !paused;
                if (paused) {
                    ev.cell.title = "▶";
                } else {
                    ev.cell.title = "⏸";
                }
            }

            // Step
            if (ev.index[0] === 1) {
                this.getScene().game.debug.step = true;
            }
        });
        console.log(buttons);
        this.enityFolder = this.pane.addFolder({ title: "Scene Entities", expanded: true });
    }

    sceneEntities: Map<number, FolderApi> = new Map();

    addFolderButton(folder: FolderApi, label: string, onClick: () => void, hoverText?: string): void {
        const titleEl = folder.controller.view.titleElement;

        // Outer wrapper (matches Tweakpane's view container)
        const wrapper = document.createElement("div");
        wrapper.classList.add("tp-btnv", "tp-v");
        wrapper.style.marginLeft = "6px";
        wrapper.style.display = "inline-block";

        // Actual button element
        const btn = document.createElement("button");
        btn.classList.add("tp-btnv_b");

        // Text container
        const text = document.createElement("div");
        text.classList.add("tp-btnv_t");
        text.textContent = label;
        text.style.padding = "0 6px";

        btn.appendChild(text);
        if (hoverText) {
            btn.title = hoverText;
        }
        wrapper.appendChild(btn);

        // Prevent folder toggle
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            onClick();
        });

        titleEl.appendChild(wrapper);
    }

    // TODO the top level should be a scene, and the entity tree should be preserved instead of being flat.

    protected entityRemoved(entity: Entity) {
        this.sceneEntities.get(entity.id)?.dispose();
        this.sceneEntities.delete(entity.id);
    }

    protected entityAdded(entity: Entity) {
        const folder = this.enityFolder.addFolder({ title: `${entity.name} (id: ${entity.id})` });
        this.addFolderButton(
            folder,
            "🖳️",
            () => {
                Log.info(entity);
            },
            "Dump Entity to Console",
        );
        const components: Map<number, any> = new Map();
        this.sceneEntities.set(entity.id, folder);

        // Add entity properties
        const entityProps = folder.addFolder({ title: `Entity Properties`, expanded: false });
        // const children = folder.addFolder({ title: `Children`, expanded: false });
        const compsFolder = folder.addFolder({ title: `Components`, expanded: false });
        entityProps.addBinding(entity, "layer", { format: (v) => v.toFixed(0) });
        entityProps.addBinding(entity.transform, "position");
        entityProps.addBinding(entity.transform, "angle");
        entityProps.addBinding(entity.transform, "scale");

        entity.componentAddedEvent.register((_, component) => {
            const params = {
                type: component.constructor.name,
            };
            const compFolder = compsFolder.addFolder({ title: `${component.constructor.name} (sid: ${component.id})`, expanded: false });
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
