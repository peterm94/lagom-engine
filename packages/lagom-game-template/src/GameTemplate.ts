import {
    ActionOnPress,
    AudioAtlas,
    Entity,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    Scene,
    SpriteSheet,
    TextDisp,
    TimerSystem
} from 'lagom-engine';
import WebFont from 'webfontloader';
import muteButtonSpr from "./art/mute_button.png";
import {SoundManager} from "./util/SoundManager";

class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addGUIEntity(new Entity("title")).addComponent(new TextDisp(100, 10, "GAME NAME", {
            fontFamily: "retro",
            fill: 0xffffff
        }));

        this.addSystem(new ActionOnPress(() => {
            this.game.setScene(new MainScene(this.game))
        }));
    }
}

class MainScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addGUIEntity(new Entity("main scene")).addComponent(new TextDisp(100, 10, "MAIN SCENE", {
            fontFamily: "pixeloid",
            fill: 0xffffff
        }));

    }
}

export class GameTemplate extends Game {
    static GAME_WIDTH = 512;
    static GAME_HEIGHT = 512;

    static muted = false;
    static musicPlaying = false;
    static audioAtlas: AudioAtlas = new AudioAtlas();

    constructor() {
        super({
            width: GameTemplate.GAME_WIDTH,
            height: GameTemplate.GAME_HEIGHT,
            resolution: 1,
            backgroundColor: 0x200140
        });

        // Set the global log level
        Log.logLevel = LogLevel.WARN;

        this.addResource("mute_button", new SpriteSheet(muteButtonSpr, 16, 16));

        // Load an empty scene while we async load the resources for the main one
        this.setScene(new Scene(this));

        // Import sounds and set their properties
        // const music = GameTemplate.audioAtlas.load("music", "ADD_ME")
        //     .loop(true)
        //     .volume(0.3);

        // Import fonts. See index.html for examples of how to add new ones.
        const fonts = new Promise<void>((resolve, _) => {
            WebFont.load({
                custom: {
                    families: ["pixeloid", "retro"]
                },
                active() {
                    resolve();
                }
            });
        });

        // Wait for all resources to be loaded and then start the main scene.
        Promise.all([fonts, this.resourceLoader.loadAll()]).then(
            () => {
                this.setScene(new TitleScene(this));
            }
        )

    }
}
