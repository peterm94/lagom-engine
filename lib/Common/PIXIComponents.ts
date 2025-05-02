import {PIXIComponent} from "../ECS/Component";
import {Graphics, Point, Text, TextStyle} from "pixi.js";

/**
 * Text renderer component.
 */
export class TextDisp extends PIXIComponent<Text> {
    /**
     * Creates a new text renderer.
     * @param xOff Positional X offset.
     * @param yOff Positional Y offset.
     * @param text The text to display.
     * @param options Styling options for the text.
     */
    constructor(xOff: number, yOff: number, text: string, options?: Partial<TextStyle>) {
        super(new Text({text, style: new TextStyle(options)}));

        this.pixiObj.x = xOff;
        this.pixiObj.y = yOff;
    }
}

/**
 * Base component for drawing PIXI primitives.
 */
export abstract class PIXIGraphicsComponent extends PIXIComponent<Graphics> {
    static readonly defaultLine = 0xFF3300;
    static readonly defaultFill = null;

    /**
     * Create a new component.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    protected constructor(fillColour: number | null, lineColour: number, render: (graphics: Graphics) => void) {
        super(new Graphics());

        this.pixiObj.setStrokeStyle({width: 1, color: lineColour, alpha: 1});

        render(this.pixiObj);

        if (fillColour !== null) {
            this.pixiObj.fill(fillColour);
        }
    }
}

/**
 * Draws a circle.
 */
export class RenderCircle extends PIXIGraphicsComponent {
    /**
     * Create a new circle.
     *
     * @param xOff Positional X offset.
     * @param yOff Positional Y offset.
     * @param radius Radius of the circle.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(xOff: number,
                yOff: number,
                radius: number,
                fillColour: number | null = PIXIGraphicsComponent.defaultFill,
                lineColour: number = PIXIGraphicsComponent.defaultLine) {
        super(fillColour, lineColour, graphics => graphics.circle(xOff, yOff, radius));
    }
}

/**
 * Draws a rectangle.
 */
export class RenderRect extends PIXIGraphicsComponent {
    /**
     * Create a new rectangle.
     *
     * @param xOff Positional X offset.
     * @param yOff Positional Y offset.
     * @param width Width of the rectangle.
     * @param height Height of the rectangle.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(xOff: number,
                yOff: number,
                width: number,
                height: number,
                fillColour: number | null = PIXIGraphicsComponent.defaultFill,
                lineColour: number = PIXIGraphicsComponent.defaultLine) {
        super(fillColour, lineColour, graphics => graphics.rect(xOff, yOff, width, height));
    }
}

/**
 * Draws a polygon.
 */
export class RenderPoly extends PIXIGraphicsComponent {
    /**
     * Create a new Polygon.
     *
     * @param points Array of points that make up the polygon.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(points: Point[],
                fillColour: number | null = PIXIGraphicsComponent.defaultFill,
                lineColour: number = PIXIGraphicsComponent.defaultLine) {
        super(fillColour, lineColour, graphics => graphics.poly(points));
    }
}
