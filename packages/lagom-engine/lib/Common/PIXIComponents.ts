import { PIXIComponent } from "../ECS/Component";
import { Graphics, Point, Text, TextStyle } from "pixi.js";
import { visible } from "../Debug/Decorators";

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

    private _text: string;

    @visible
    public set text(text: string) {
        this._text = text;
        this.pixiObj.text = text;
    }

    public get text(): string {
        return this._text;
    }

    constructor(xOff: number, yOff: number, text: string, options?: Partial<TextStyle>) {
        super(new Text({ text, style: options }));

        this._text = text;
        this.pixiObj.x = xOff;
        this.pixiObj.y = yOff;
    }
}

export interface ShapeStyle {
    fillColour?: number | null;
    lineColour?: number;
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
    protected constructor(
        protected fillColour: number | null,
        protected lineColour: number,
    ) {
        super(new Graphics());
    }

    protected abstract draw(): void;

    public setStyle(shapeStyle: ShapeStyle): void {
        this.pixiObj.clear();
        this.fillColour = shapeStyle.fillColour !== undefined ? shapeStyle.fillColour : this.fillColour;
        this.lineColour = shapeStyle.lineColour !== undefined ? shapeStyle.lineColour : this.lineColour;

        this.pixiObj.setStrokeStyle({ width: 1, color: this.lineColour, alpha: 1 });

        if (this.fillColour !== null) {
            this.pixiObj.setFillStyle({ color: this.fillColour, alpha: 1 });
        }
        this.draw();
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
    protected draw(): void {
        const shape = this.pixiObj.circle(this.options.xOff ?? 0, this.options.yOff ?? 0, this.options.radius);
        if (this.fillColour !== null) {
            shape.fill();
        }
        shape.stroke();
    }
    /**
     * Create a new circle.
     *
     * @param options Circle draw options.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(
        readonly options: CircleOptions,
        fillColour: number | null = PIXIGraphicsComponent.defaultFill,
        lineColour: number = PIXIGraphicsComponent.defaultLine,
    ) {
        super(fillColour, lineColour);
        this.setStyle({fillColour, lineColour});
    }
}

/**
 * Draws a rectangle.
 */
export class RenderRect extends PIXIGraphicsComponent {
    protected draw(): void {
        let shape = this.pixiObj.rect(this.options.xOff ?? 0, this.options.yOff ?? 0, this.options.width, this.options.height);
        if (this.fillColour !== null) {
            shape.fill();
        }
        shape.stroke();
    }
    /**
     * Create a new rectangle.
     *
     * @param options Rectangle definition.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(
        readonly options: RectOptions,
        fillColour: number | null = PIXIGraphicsComponent.defaultFill,
        lineColour: number = PIXIGraphicsComponent.defaultLine,
    ) {
        super(fillColour, lineColour);
        this.setStyle({fillColour, lineColour});
    }
}

/**
 * Draws a polygon.
 */
export class RenderPoly extends PIXIGraphicsComponent {
    protected draw(): void {
        let shape = this.pixiObj.poly(this.points.map((value) => new Point(value[0], value[1])));
        if (this.fillColour !== null) {
            shape.fill();
        }
        shape.stroke();
    }
    /**
     * Create a new Polygon.
     *
     * @param points Array of points that make up the polygon.
     * @param fillColour The inner fill colour. Null for transparent.
     * @param lineColour The colour of the line.
     */
    constructor(
        readonly points: number[][],
        fillColour: number | null = PIXIGraphicsComponent.defaultFill,
        lineColour: number = PIXIGraphicsComponent.defaultLine,
    ) {
        super(fillColour, lineColour);
        this.setStyle({fillColour, lineColour});
    }
}
