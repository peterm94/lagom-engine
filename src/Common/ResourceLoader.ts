import {SpriteSheet} from "./Sprite/SpriteSheet";

export class ResourceLoader
{
    private resources: Map<string, SpriteSheet> = new Map<string, SpriteSheet>();

    addResource(name: string, spriteSheet: SpriteSheet): SpriteSheet
    {
        this.resources.set(name, spriteSheet);
        return spriteSheet;
    }

    get(name: string): SpriteSheet
    {
        const resource = this.resources.get(name);
        if (resource !== undefined)
        {
            return resource;
        }
        throw new Error(`Resource ${name} not defined.`);
    }

    loadAll(): Promise<unknown>
    {
        const promises: Promise<unknown>[] = [];

        this.resources.forEach(value => promises.push(value.load()));

        return Promise.all(promises);
    }
}
