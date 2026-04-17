import { ActionOnPress, Entity, FrameTriggerSystem, Game, Log, LogLevel, Scene, TextDisp, TimerSystem } from "lagom-engine";
import { SoundManager } from "./util/SoundManager";

class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addGUIEntity(new Entity("title")).addComponent(
            new TextDisp(100, 10, "GAME NAME", {
                fontFamily: "retro",
                fill: 0xffffff,
            }),
        );

        this.addSystem(
            new ActionOnPress(() => {
                this.game.setScene(new MainScene(this.game));
            }),
        );
    }
}

class MainScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addGUIEntity(new Entity("main scene")).addComponent(
            new TextDisp(100, 10, "MAIN SCENE", {
                fontFamily: "pixeloid",
                fill: 0xffffff,
            }),
        );

        // Game.audio.startMusic("music", true);
    }
}

export class GameTemplate extends Game {
    startScene = () => new TitleScene(this);
    resourceLoad = async () => {
        await Game.resourceLoader.autoLoad();
        console.log("loaded all resources");
    };

    constructor() {
        super({
            width: 512,
            height: 512,
            resolution: 1,
            backgroundColor: 0x200140,
        });

        // Set the global log level
        Log.logLevel = LogLevel.INFO;
    }
}
