import {TextDisp} from "./PIXIComponents";
import {Entity} from "../ECS/Entity";
import {System} from "../ECS/System";
import {Component} from "../ECS/Component";
import {Game} from "../ECS/Game";
import {CType} from "../ECS/FnSystemWrapper";

/**
 * FPS tracking component.
 */
class FpsTracker extends Component {
    constructor(readonly verbose: boolean) {
        super();
    }
}

/**
 * System that updates with diagnostic information.
 */
class FpsUpdater extends System<[TextDisp, FpsTracker]> {
    types: [CType<TextDisp>, CType<FpsTracker>] = [TextDisp, FpsTracker];

    printFrame = 10;
    frameCount = 0;

    private game!: Game;

    private avgFixedUpdateDt = 0;
    private fixedDt = 0;
    private avgUpdateDt = 0;
    private avgUpdate = 0;
    private avgFixedUpdate = 0;
    private avgRender = 0;
    private avgFrame = 0;

    private readonly samples = 100;

    onAdded(): void {
        super.onAdded();
        this.game = this.getScene().getGame();
    }

    private rollAverage(prevAvg: number, newVal: number): number {
        return (prevAvg * (this.samples - 1) + newVal) / this.samples;
    }

    fixedUpdate(delta: number): void {
        super.fixedUpdate(delta);
        this.avgFixedUpdateDt = this.rollAverage(this.avgFixedUpdateDt, 1000 / delta);
        this.fixedDt = delta;
    }

    runOnEntities(delta: number, _entity: Entity, text: TextDisp, tracker: FpsTracker): void {

        if ((this.frameCount % this.printFrame) !== 0) {
            return;
        }
        text.pixiObj.text = `${this.avgUpdateDt.toFixed(2)}`;

        if (tracker.verbose) {
            text.pixiObj.text =
                `U: ${delta.toFixed(2)}ms `
                + `// ${(1000 / delta).toFixed(2)}hz `
                + `// ${this.avgUpdateDt.toFixed(2)}hz`
                + `\nFixedU: ${this.fixedDt.toFixed(2)}ms `
                + `// ${(1000 / this.fixedDt).toFixed(2)}hz `
                + `// ${this.avgFixedUpdateDt.toFixed(2)}hz`
                + `\nUpdateTime: ${this.game.diag.updateTime.toFixed(2)}ms `
                + `// ${this.avgUpdate.toFixed(2)}ms`
                + `\nFixedUpdateTime: ${this.game.diag.fixedUpdateTime.toFixed(2)}ms `
                + `// ${this.avgFixedUpdate.toFixed(2)}ms`
                + `\nRenderTime: ${this.game.diag.renderTime.toFixed(2)}ms `
                + `// ${this.avgRender.toFixed(2)}ms`
                + `\nTotalFrameTime: ${this.game.diag.totalFrameTime.toFixed(2)}ms `
                + `// ${this.avgFrame.toFixed(2)}ms`
                + `\nEntities: ${this.game.currentScene.entities.size}`;
        }

    }

    update(delta: number): void {
        super.update(delta);

        this.frameCount++;

        // Delta of exactly 0 will break the average.
        if (delta !== 0) {
            this.avgUpdateDt = this.rollAverage(this.avgUpdateDt, 1000 / delta);
        }

        this.avgUpdate = this.rollAverage(this.avgUpdate, this.game.diag.updateTime);
        this.avgFixedUpdate = this.rollAverage(this.avgFixedUpdate, this.game.diag.fixedUpdateTime);
        this.avgRender = this.rollAverage(this.avgRender, this.game.diag.renderTime);
        this.avgFrame = this.rollAverage(this.avgFrame, this.game.diag.totalFrameTime);
    }
}


/**
 * Entity that adds FPS information to the canvas.
 */
export class Diagnostics extends Entity {
    onAdded(): void {
        super.onAdded();

        this.addComponent(new FpsTracker(this.verbose));
        this.addComponent(new TextDisp(0, 0, "", {fontSize: this.textSize, fill: this.textCol}));

        const scene = this.getScene();
        scene.addSystem(new FpsUpdater());
    }

    /**
     * Constructor.
     * @param textCol Colour of the debug text.
     * @param textSize Size of the debug text.
     * @param verbose Set to true for more information. False will just display simple FPS.
     */
    constructor(private readonly textCol: string,
                private readonly textSize: number = 10,
                private verbose: boolean = false) {
        super("diagnostics");
    }
}
