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
    RenderCircle,
    SatCollisionSystem,
    Scene
} from "lagom-engine";

// import SAT from "sat";

enum Layers {
    L1,
    L2
}

class MoveMe extends Component {
}

class MainScene extends Scene {

    onAdded() {
        super.onAdded()

        const matrix = new CollisionMatrix();
        matrix.addCollision(Layers.L1, Layers.L2)
        this.addGlobalSystem(new SatCollisionSystem(matrix));

        const e1 = this.addEntity(new Entity("", 100, 100))
        const c1 = e1.addComponent(new CircleSatCollider({layer:Layers.L1, radius: 10}))
        c1.onTriggerEnter.register((caller, data) => {
            Log.info("ENTER 1");
        })
        c1.onTrigger.register((caller, data) => {
            Log.info("INSIDE");
        })
        c1.onTriggerExit.register((caller, data) => {
            Log.info("EXIT 1");
        })
        e1.addComponent(new RenderCircle(0, 0, 10));

        const e2 = this.addEntity(new Entity("", 105, 100))
        e2.addComponent(new CircleSatCollider({layer:Layers.L2, radius: 10}))
            .onTriggerEnter.register((caller, data) => {
            // Log.info("ENTER 2");
        })
        e2.addComponent(new RenderCircle(0, 0, 10));
        e2.addComponent(new MoveMe());

        this.addFnSystem(newSystem([MoveMe], (d, e) => {
            if (this.game.keyboard.isKeyDown(Key.KeyA)) {
                e.transform.position.x -= d * .10;
            }
            if (this.game.keyboard.isKeyDown(Key.KeyD)) {
                e.transform.position.x += d * .10;
            }
        }))
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