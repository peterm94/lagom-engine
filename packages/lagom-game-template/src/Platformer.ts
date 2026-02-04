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
    onAdded() {
        super.onAdded();

        const matrix = new CollisionMatrix();
        matrix.addCollision(Layers.Guy, Layers.Wall);
        matrix.addCollision(Layers.Wall, Layers.WallCheck);
        this.addGlobalSystem(new SatCollisionSystem(matrix));

        const e2 = this.addEntity(new Entity("", 105, 100));
        e2.addComponent(new CircleSatCollider({ layer: Layers.Guy, radius: 10 })).onTrigger.register((caller, data) => {
            if (data.other.layer == Layers.Wall) {
                // console.log("hit")
                caller.parent.transform.x -= data.result.overlapV.x;
                caller.parent.transform.y -= data.result.overlapV.y;
            }
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
            console.log("grounded");
            if (data.other.layer == Layers.Wall) {
                grounded.onGround = true;
            }
        });

        groundCheck.onTriggerExit.register((caller, data) => {
            console.log("no grounded");
            if (data.other.layer == Layers.Wall) {
                grounded.onGround = false;
            }
        });
        groundChild.addComponent(new RenderCircle(0, 0, 2, 0x00ffff, undefined));

        e2.addComponent(new RenderCircle(0, 0, 10));

        e2.addComponent(new MoveMe());
        e2.addComponent(new Gravity());

        const floor = this.addEntity(new Entity("floor", 0, 150));
        floor.addComponent(new RectSatCollider({ layer: Layers.Wall, height: 10, width: 200 }));
        floor.addComponent(new RenderRect(0, 0, 200, 10));

        this.addFnSystem(
            newSystem([MoveMe], (d, e, moveme) => {
                if (this.game.keyboard.isKeyDown(Key.KeyA)) {
                    e.transform.position.x -= d * 0.1;
                }
                if (this.game.keyboard.isKeyDown(Key.KeyD)) {
                    e.transform.position.x += d * 0.1;
                }
                if (this.game.keyboard.isKeyPressed(Key.KeyW) && grounded.onGround) {
                    moveme.vel = -50;
                }
            }),
        );

        this.addFixedFnSystem(
            newSystem(types(MoveMe, Gravity), (delta, entity, moveme, gravity) => {
                moveme.vel += delta * 0.2;
                if (moveme.vel > 20) {
                    moveme.vel = 20;
                }
                entity.transform.y += moveme.vel * delta * 0.01;
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
