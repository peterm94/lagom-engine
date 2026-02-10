import {
    AnimatedSprite,
    AnimatedSpriteController,
    AnimationEnd,
    Component,
    Entity,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    MathUtil,
    Scene,
    Sprite,
    Timer,
    TimerSystem,
} from "lagom-engine";

class MoveMe extends Component {
    dir = MathUtil.randomRange(0, 360);
}

class MainScene extends Scene {
    onAdded() {
        super.onAdded();

        const sheet = this.game.getResource("sheet");

        this.addGlobalSystem(new FrameTriggerSystem());
        this.addGlobalSystem(new TimerSystem());
        this.addEntity(new Entity("single")).addComponent(sheet.tileIdx(0).sprite());

        for (let i = 0; i < 12; i++) {
            this.addEntity(new Entity(i.toString(), i * 40, 40)).addComponent(new Sprite(sheet.tileIdx(i)));
        }

        this.addEntity(new Entity("offset", 0, 80)).addComponent(new Sprite(sheet.fromPoints(16, 16, 32, 32)));

        this.addEntity(new Entity("animated", 0, 120)).addComponent(new AnimatedSprite(sheet.allTiles(), { animationSpeed: 600 }));
        this.addEntity(new Entity("animated", 40, 120)).addComponent(new AnimatedSprite(sheet.allTiles(), { animationSpeed: 600, animationEndAction: AnimationEnd.REVERSE }));
        this.addEntity(new Entity("animated", 80, 120)).addComponent(
            new AnimatedSprite(sheet.allTiles(), {
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

        const e = this.addEntity(new Entity("controller", 0, 160));
        const controller = e.addComponent(
            new AnimatedSpriteController(0, [
                {
                    id: 0,
                    textures: sheet.tileSlice(0, 5),
                    config: { animationSpeed: 400, xScale: 0.2, yScale: 0.2 },
                    events: {
                        0: (controller) => {
                            controller.applyConfig({ xScale: 0.4, yScale: 0.4 });
                        },
                        1: (controller) => {
                            controller.applyConfig({ xScale: 0.6, yScale: 0.6 });
                        },
                        2: (controller) => {
                            controller.applyConfig({ xScale: 0.8, yScale: 0.8 });
                        },
                        3: (controller) => {
                            controller.applyConfig({ xScale: 1, yScale: 1 });
                        },
                        4: (controller) => {
                            controller.applyConfig({ xScale: 1.2, yScale: 1.2 });
                        },
                        5: (controller) => {
                            controller.applyConfig({ xScale: 0.2, yScale: 0.2 });
                        },
                    },
                },
                {
                    id: 1,
                    textures: sheet.tileSlice(5, 6),
                    config: { animationSpeed: 400, xScale: 2.5, yScale: 2.5, alpha: 0.5 },
                },
            ]),
        );
        e.addComponent(new Timer(MathUtil.randomRange(2000, 5000), controller)).onTrigger.register((caller, data) => {
            if (data.currentState === 0) {
                data.setAnimation(1);
            } else {
                data.setAnimation(0);
            }
            caller.reset(MathUtil.randomRange(2000, 5000));
        });
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
