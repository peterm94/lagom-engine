import * as PIXI from "pixi.js";
import {Scene} from "./Scene";
import {Log} from "../Common/Util";
import {ResourceLoader} from "../Common/ResourceLoader";
import {SpriteSheet} from "../Common/Sprite/SpriteSheet";
import {Keyboard} from "../Input/Keyboard";
import {Mouse} from "../Input/Mouse";

class Diag
{
    renderTime = 0;
    fixedUpdateTime = 0;
    updateTime = 0;
    totalFrameTime = 0;
}

export interface GameOptions {
    width: number;
    height: number;
    resolution: number;
    backgroundColor: number;
}

/**
 * Game class, containing all high level framework references. Sets up the render window and controls updating the ECS.
 */
export class Game
{
    // Get keyboard events. Updated every update() frame.
    readonly keyboard: Keyboard;

    // Get mouse events. Updated every update() frame.
    readonly mouse: Mouse;

    // Set this to true to end the game
    gameOver = false;

    // Main PIXI renderer
    readonly renderer: PIXI.Renderer;

    // PIXI interaction manager
    readonly manager: PIXI.InteractionManager;

    readonly resourceLoader: ResourceLoader = new ResourceLoader();

    // Currently loaded scene.
    currentScene!: Scene;

    // Track total time
    // private timeMs = 0;

    // Time since last frame was triggered
    private lastFrameTime = Date.now();

    // Accumulated time since the last update. Used to keep the framerate fixed independently of the elapsed time.
    private elapsedSinceUpdate = 0;

    // Fixed timestep rate for logic updates (60hz)
    private readonly fixedDeltaMS = 1000 / 60;

    // Delta since the last frame update. This is *not* the delta of the ECS update, but the render loop.
    deltaTime = 0;

    private updateLoop(): void
    {
        if (!this.gameOver)
        {
            let now = Date.now();
            const totalUpdateStart = now;
            this.deltaTime = now - this.lastFrameTime;

            // TODO there is probably a better way, but this stops catchup issues when the tab isn't in focus.
            if (this.deltaTime > 100)
            {
                Log.warn("DeltaTime registered at " + this.deltaTime + "ms. Capping at " + 100);
                this.deltaTime = 100;
            }

            this.lastFrameTime = now;

            this.elapsedSinceUpdate += this.deltaTime;

            while (this.elapsedSinceUpdate >= this.fixedDeltaMS)
            {
                // call FixedUpdate() for the ECS
                this.fixedUpdateInternal(this.fixedDeltaMS);

                this.elapsedSinceUpdate -= this.fixedDeltaMS;
                // this.timeMs += this.fixedDeltaMS;
            }
            this.diag.fixedUpdateTime = Date.now() - now;
            // Call update() for the ECS
            now = Date.now();
            this.updateInternal(this.deltaTime);
            this.diag.updateTime = Date.now() - now;

            now = Date.now();
            this.renderer.render(this.currentScene.pixiStage);
            this.diag.renderTime = Date.now() - now;
            this.diag.totalFrameTime = Date.now() - totalUpdateStart;

            requestAnimationFrame(this.updateLoop.bind(this));
        }
    }

    readonly diag: Diag = new Diag();

    /**
     * Create a new Game.
     * @param options Options for the PIXI Renderer.
     */
    constructor(options?: GameOptions)
    {
        // Set it up in the page
        this.renderer = new PIXI.Renderer(options);
        this.manager = new PIXI.InteractionManager(this.renderer);
        this.keyboard = new Keyboard(this.renderer.view);
        this.mouse = new Mouse(this.renderer.view);
    }

    /**
     * Start the game loop.
     */
    start(): void
    {
        if (this.currentScene == null)
        {
            throw new Error("Ensure a scene is set before starting the game.");
        }

        this.startInternal();
    }

    private startInternal(): void
    {
        Log.info("Game started.");

        // Start the update loop
        this.lastFrameTime = Date.now();
        this.updateLoop();
    }

    private updateInternal(delta: number): void
    {
        this.currentScene.update(delta);

        this.keyboard.update();
        this.mouse.pixi_mouse.update();
    }

    private fixedUpdateInternal(delta: number): void
    {
        this.currentScene.fixedUpdate(delta);
    }

    /**
     * Set a scene to load. Will be started instantly.
     * @param scene The Scene to load.
     * @returns The scene.
     */
    setScene<T extends Scene>(scene: T): T
    {
        // TODO clean up old scene?
        this.currentScene = scene;

        Log.debug("Setting scene for game.", scene);
        scene.onAdded();
        return scene;
    }

    getResource(name: string): SpriteSheet
    {
        return this.resourceLoader.get(name);
    }

    addResource(name: string, sheet: SpriteSheet): SpriteSheet
    {
        return this.resourceLoader.addResource(name, sheet);
    }

    load(): Promise<unknown>
    {
        return this.resourceLoader.loadAll();
    }
}
