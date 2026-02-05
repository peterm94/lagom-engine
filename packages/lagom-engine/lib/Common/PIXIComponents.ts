import { PIXIComponent } from "../ECS/Component";
import { Graphics, Point, Text, TextStyle } from "pixi.js";

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
        super(new Text({ text, style: options }));

        this.pixiObj.x = xOff;
        this.pixiObj.y = yOff;
    }
}

/**
 * Base component for drawing PIXI primitives.
 */
export abstract class PIXIGraphicsComponent extends PIXIComponent<Graphics> {
    static readonly defaultLine = 0xff3300;
    static readonly defaultFill = null;

    /**
     * Create a new component.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    protected constructor(fillColour: number | null, lineColour: number) {
        super(new Graphics());

        this.pixiObj.setStrokeStyle({ width: 1, color: lineColour, alpha: 1 });

        if (fillColour !== null) {
            this.pixiObj.fill(fillColour);
        }
    }
}

export interface OffsetShape {
    xOff?: number;
    yOff?: number;
}

export interface CircleOptions extends OffsetShape {
    radius: number;
}

export interface RectOptions extends OffsetShape {
    width: number;
    height: number;
}

export interface PolyOptions extends OffsetShape {
    points: Point[];
}

/**
 * Draws a circle.
 */
export class RenderCircle extends PIXIGraphicsComponent {
    /**
     * Create a new circle.
     *
     * @param options Circle draw options.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(xOff: number, yOff: number, radius: number, fillColour: number | null = PIXIGraphicsComponent.defaultFill, lineColour: number = PIXIGraphicsComponent.defaultLine) {
        super(fillColour, lineColour);
        this.pixiObj.circle(xOff, yOff, radius).stroke();
    }

    //     constructor(options: CircleOptions, fillColour: number | null = PIXIGraphicsComponent.defaultFill, lineColour: number = PIXIGraphicsComponent.defaultLine) {
    //         super(fillColour, lineColour);
    //         this.pixiObj.circle(options.xOff ?? 0, options.yOff ?? 0, options.radius).stroke();
    //     }
}

/**
 * Draws a rectangle.
 */
export class RenderRect extends PIXIGraphicsComponent {
    /**
     * Create a new rectangle.
     *
     * @param options Rectangle definition.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(
        xOff: number,
        yOff: number,
        width: number,
        height: number,
        fillColour: number | null = PIXIGraphicsComponent.defaultFill,
        lineColour: number = PIXIGraphicsComponent.defaultLine,
    ) {
        super(fillColour, lineColour);
        this.pixiObj.rect(xOff, yOff, width, height).stroke();
    }

    //     constructor(options: RectOptions, fillColour: number | null = PIXIGraphicsComponent.defaultFill, lineColour: number = PIXIGraphicsComponent.defaultLine) {
    //         super(fillColour, lineColour);
    //         this.pixiObj.rect(options.xOff ?? 0, options.yOff ?? 0, options.width, options.height).stroke();
    //     }
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
    constructor(points: Point[], fillColour: number | null = PIXIGraphicsComponent.defaultFill, lineColour: number = PIXIGraphicsComponent.defaultLine) {
        super(fillColour, lineColour);
        this.pixiObj.poly(points).stroke();
    }
}
