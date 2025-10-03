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
    types
} from "lagom-engine";

enum Layers {
    L1,
    L2,
    L3
}

class MoveMe extends Component {
    constructor(public vel: number = 0) {
        super();
    }
}

class Gravity extends Component {
}

class MainScene extends Scene {

    onAdded() {
        super.onAdded()

        const matrix = new CollisionMatrix();
        matrix.addCollision(Layers.L1, Layers.L1)
        matrix.addCollision(Layers.L1, Layers.L2)
        matrix.addCollision(Layers.L2, Layers.L3)
        this.addGlobalSystem(new SatCollisionSystem(matrix));

        const e1 = this.addEntity(new Entity("", 100, 100))
        const c1 = e1.addComponent(new CircleSatCollider({layer: Layers.L1, radius: 10}))
        c1.onTriggerEnter.register((caller, data) => {
            // Log.info("ENTER 1");
        })
        c1.onTrigger.register((caller, data) => {
            // Log.info("INSIDE");
        })
        c1.onTriggerExit.register((caller, data) => {
            // Log.info("EXIT 1");
        })
        e1.addComponent(new RenderCircle(0, 0, 10));

        const e2 = this.addEntity(new Entity("", 105, 100))
        e2.addComponent(new CircleSatCollider({layer: Layers.L1, radius: 10}))
            .onTrigger.register((caller, data) => {
            if (data.other.layer == Layers.L1) {
                // console.log("hit")
                caller.parent.transform.x -= data.result.overlapV.x;
                caller.parent.transform.y -= data.result.overlapV.y;
            }
        })
        e2.addComponent(new RenderCircle(0, 0, 10));
        e2.addComponent(new MoveMe());
        e2.addComponent(new Gravity());

        const floor = this.addEntity(new Entity("floor", 0, 150));
        floor.addComponent(new RectSatCollider({layer: Layers.L1, height: 10, width: 200}));
        floor.addComponent(new RenderRect(0, 0, 200, 10));

        this.addFnSystem(newSystem([MoveMe], (d, e, moveme) => {
            if (this.game.keyboard.isKeyDown(Key.KeyA)) {
                e.transform.position.x -= d * .10;
            }
            if (this.game.keyboard.isKeyDown(Key.KeyD)) {
                e.transform.position.x += d * .10;
            }
            if (this.game.keyboard.isKeyPressed(Key.KeyW)) {
                moveme.vel = -50;
            }
        }))

        this.addFixedFnSystem(newSystem(types(MoveMe, Gravity), (delta, entity, moveme, gravity) => {
            moveme.vel += delta * 0.2
            if (moveme.vel > 20) {
                moveme.vel = 20;
            }
            entity.transform.y += moveme.vel * delta * 0.01;
        }))

        // this.addFnSystem(newSystem([MoveMe, MoveMeToo], (d, e) => {}))
    }

}

export class Platformer extends Game {
    static GAME_WIDTH = 512;
    static GAME_HEIGHT = 512;

    constructor() {
        super({
            width: Platformer.GAME_WIDTH,
            height: Platformer.GAME_HEIGHT,
            resolution: 1,
            backgroundColor: 0x200140
        });

        Log.logLevel = LogLevel.INFO;

        this.setScene(new MainScene(this));
    }
}