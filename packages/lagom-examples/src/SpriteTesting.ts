import { AnimatedSprite, AnimationEnd, Component, Entity, FrameTriggerSystem, Game, Log, LogLevel, MathUtil, Scene, Sprite } from "lagom-engine";

class MoveMe extends Component {
    dir = MathUtil.randomRange(0, 360);
}

class MainScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addGlobalSystem(new FrameTriggerSystem());
        this.addEntity(new Entity("single")).addComponent(new Sprite(this.game.getResource("sheet").tileIdx(0)));

        for (let i = 0; i < 12; i++) {
            this.addEntity(new Entity(i.toString(), i * 40, 40)).addComponent(new Sprite(this.game.getResource("sheet").tileIdx(i)));
        }

        this.addEntity(new Entity("offset", 0, 80)).addComponent(new Sprite(this.game.getResource("sheet").fromPoints(16, 16, 32, 32)));

        this.addEntity(new Entity("animated", 0, 120)).addComponent(new AnimatedSprite(this.game.getResource("sheet").allTiles(), { animationSpeed: 600 }));
        this.addEntity(new Entity("animated", 40, 120)).addComponent(
            new AnimatedSprite(this.game.getResource("sheet").allTiles(), { animationSpeed: 600, animationEndAction: AnimationEnd.REVERSE }),
        );
        this.addEntity(new Entity("animated", 80, 120)).addComponent(
            new AnimatedSprite(this.game.getResource("sheet").allTiles(), {
                animationSpeed: 200,
                xAnchor: 0.5,
                yAnchor: 0.5,
                xOffset: 16,
                yOffset: 16,
                animationEndEvent: (me) => {
                    console.log("end");
                    me.applyConfig({ rotation: MathUtil.degToRad(MathUtil.randomRange(0, 360)) });
                },
            }),
        );
    }
}

export class SpriteTesting extends Game {
    startScene = () => new MainScene(this);
    resourceLoad = async () => {
        await this.resourceLoader.autoLoad();
    };

    constructor() {
        super({
            width: 512,
            height: 512,
            resolution: 1,
            backgroundColor: 0xf2f5e1,
        });

        Log.logLevel = LogLevel.INFO;
    }
}
