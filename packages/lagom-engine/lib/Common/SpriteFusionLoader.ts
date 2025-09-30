import {Log} from "./Util";

/**
 * Map loader for SpriteFusion save files.
 */
export class SpriteFusionLoader {
    readonly map: FusionSave;

    /**
     * Load a SpriteFusion save file. The map should be imported from a saved project, not an exported one.
     *
     * ```
     * import world2 from "./resources/World2.json";
     * new SpriteFusionLoader(world2);
     * ```
     *
     * @param map The map to load.
     */
    constructor(map: FusionSave) {
        this.map = map;
    }

    /**
     * Load a given layer from the map. The tile ID is 0-indexed, starting from the top left tile in the tileset.
     * The x and y values are offset from the top left tile in the layer. Consider putting a marker tile in a consistent
     * spot in the top left corner if using multiple layers.
     * @param layerName The name of the layer to load.
     * @param fn The function called for every tile loaded.
     */
    loadFn(layerName: string, fn: (tileId: number, x: number, y: number) => void): void {
        const layer = this.map.layers.find(value => value.name === layerName);

        Log.trace(`Loading layer ${layerName}`);

        if (layer === undefined) {
            return;
        }

        // Sort the tile set. This is for consistent loading.
        layer.tiles.sort((a, b) => a.y - b.y || a.x - b.x);

        // Find the top leftmost tile in the layer. We will offset all tiles from this position.
        let minx = layer.tiles[0].x;
        let miny = layer.tiles[0].y;

        Log.trace(`Layer offset is ${minx}, ${miny}`);

        layer.tiles.forEach((tile) => {
            fn(Number(tile.id), tile.x - minx, tile.y - miny);
        });
    }
}


/**
 * Type mappings for Tiled JSON maps.
 */
interface FusionSave {
    id: string;
    name: string;
    tileSize: number
    layers: FusionLayer[]
}

/**
 * Type mappings for Tiled JSON layers.
 */
interface FusionLayer {
    id: string;
    name: string;
    tiles: FusionTile[]
}

interface FusionTile {
    id: string;
    x: number
    y: number
}