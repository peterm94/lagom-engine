import {
    CircleSatCollider,
    CollisionMatrix,
    Component,
    Entity,
    Game,
    Key,
    Log,
    LogLevel,
    newSystem,
    RectSatCollider,
    RenderCircle,
    RenderRect,
    SatCollisionSystem,
    Scene,
    types,
} from "lagom-engine";

enum Layers {
    Guy,
    Wall,
    WallCheck,
}

class MoveMe extends Component {
    constructor(public vel: number = 0) {
        super();
    }
}

class Gravity extends Component {}

class Grounded extends Component {
    constructor(public onGround: boolean = false) {
        super();
    }
}

class MainScene extends Scene {
    makeBlock(x: number, y: number, w: number, h: number) {
        const floor = this.addEntity(new Entity("floor", x, y));
        floor.addComponent(new RectSatCollider({ layer: Layers.Wall, height: h, width: w }));
        floor.addComponent(new RenderRect({ width: w, height: h }));
    }
    onAdded() {
        super.onAdded();

        const matrix = new CollisionMatrix();
        matrix.addCollision(Layers.Guy, Layers.Wall);
        matrix.addCollision(Layers.Wall, Layers.WallCheck);
        this.addGlobalSystem(new SatCollisionSystem(matrix));

        const e2 = this.addEntity(new Entity("", 105, 100));
        e2.addComponent(new CircleSatCollider({ layer: Layers.Guy, radius: 10 })).onTriggerWithLayer(Layers.Wall, (caller, data) => {
            console.log("player in wall");
            caller.parent.transform.x -= data.result.overlapV.x;
            caller.parent.transform.y -= data.result.overlapV.y + 1;
        });
        const grounded = e2.addComponent(new Grounded());
        const groundChild = e2.addChild(new Entity("groundCheck", 0, 12));
        const groundCheck = groundChild.addComponent(
            new CircleSatCollider({
                layer: Layers.WallCheck,
                radius: 12,
            }),
        );
        groundCheck.onTriggerEnter.register((caller, data) => {
            if (data.other.layer == Layers.Wall) {
                console.log("grounded");
                grounded.onGround = true;
            }
        });

        groundCheck.onTriggerExit.register((caller, data) => {
            if (data.other.layer == Layers.Wall) {
                console.log("no grounded");
                grounded.onGround = false;
            }
        });
        groundChild.addComponent(new RenderCircle({ radius: 2 }, 0x00ffff, undefined));

        e2.addComponent(new RenderCircle({ radius: 10 }));

        e2.addComponent(new MoveMe());
        e2.addComponent(new Gravity());

        this.makeBlock(0, 150, 200, 10);
        this.makeBlock(100, 100, 200, 10);
        this.makeBlock(130, 100, 200, 100);

        this.addFnSystem(
            newSystem([MoveMe], (d, e, moveme) => {
                if (Game.keyboard.isKeyDown(Key.KeyA)) {
                    e.transform.position.x -= d * 0.1;
                }
                if (Game.keyboard.isKeyDown(Key.KeyD)) {
                    e.transform.position.x += d * 0.1;
                }
                if (Game.keyboard.isKeyPressed(Key.KeyW) && grounded.onGround) {
                    moveme.vel = -50;
                }
            }),
        );

        // Gravity
        this.addFixedFnSystem(
            newSystem(types(MoveMe, Gravity, Grounded), (delta, entity, moveme, gravity, grounded) => {
                // if (grounded.onGround) {
                //     return;
                // }
                moveme.vel += delta * 0.2;
                if (moveme.vel > 20) {
                    moveme.vel = 20;
                }

                entity.transform.position.y += moveme.vel * delta * 0.01;
            }),
        );

        // this.addFnSystem(newSystem([MoveMe, MoveMeToo], (d, e) => {}))
    }
}

export class Platformer extends Game {
    resourceLoad = async () => {};
    startScene = () => new MainScene(this);
    static GAME_WIDTH = 512;
    static GAME_HEIGHT = 512;

    constructor() {
        super({
            width: Platformer.GAME_WIDTH,
            height: Platformer.GAME_HEIGHT,
            resolution: 1,
            backgroundColor: 0x200140,
        });

        Log.logLevel = LogLevel.INFO;
    }
}
