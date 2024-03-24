/**
 * Map loader for Tiled JSON files.
 */
export class TiledMapLoader
{
    readonly map: TiledMap;

    /**
     * Load a JSON Tiled map. The map should be imported from JSON file straight in.
     *
     * ```
     * import world2 from "./resources/World2.json";
     * new TiledMapLoader(world2);
     * ```
     *
     * @param map The map to load.
     */
    constructor(map: TiledMap)
    {
        this.map = map;
    }

    /**
     * Load a given layer from the map.
     * @param layerName The name of the layer to load.
     * @param fn The function called for every tile loaded. Can be used as an alternative to the function map.
     */
    loadFn(layerName: string, fn: (tileId: number, x: number, y: number) => void): void
    {
        const layer = this.map.layers.find(value => value.name === layerName && value.type === "tilelayer");

        if (layer === undefined) {
            return;
        }

        layer.data.forEach((value, index) => {
            const row = Math.floor(index / layer.width);
            const column = index - layer.width * row;
            fn(value, this.map.tilewidth * column, this.map.tileheight * row);
        });
    }
}


/**
 * Type mappings for Tiled JSON maps.
 */
export interface TiledMap
{
    compressionlevel: number;
    height: number;
    infinite: boolean;
    layers: TiledLayer[];
    nextlayerid: number;
    nextobjectid: number;
    orientation: string;
    renderorder: string;
    tiledversion: string;
    tileheight: number;
    tilesets: { firstgid: number; source: string }[];
    tilewidth: number;
    type: string;
    version: string;
    width: number;
}

/**
 * Type mappings for Tiled JSON layers.
 */
export interface TiledLayer
{
    data: number[];
    height: number;
    id: number;
    name: string;
    opacity: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
}
