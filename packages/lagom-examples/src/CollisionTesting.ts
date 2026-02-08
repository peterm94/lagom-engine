import { CircleSatCollider, CollisionMatrix, Component, Diagnostics, Entity, Game, Log, LogLevel, MathUtil, RenderCircle, SatCollisionSystem, Scene } from "lagom-engine";

class MoveMe extends Component {
    dir = MathUtil.randomRange(0, 360);
}

class MainScene extends Scene {
    onAdded() {
        super.onAdded();

        const matrix = new CollisionMatrix();
        matrix.addCollision(0, 0);
        this.addGlobalSystem(new SatCollisionSystem(matrix));

        // Physics caps out at about 600 entities (with collisions), not too bad
        // No physics we can render multiple thousands easily
        for (let i = 0; i < 600; i++) {
            const e = this.addEntity(new Entity("block", MathUtil.randomRange(0, 512), MathUtil.randomRange(0, 512)));
            e.addComponent(new MoveMe());
            e.addComponent(new RenderCircle({ radius: 5 }));
            const collider = e.addComponent(new CircleSatCollider({ radius: 5, layer: 0 }));
            collider.onTriggerEnterWthLayer(0, (caller, data) => {
                caller.getEntity().getComponent<RenderCircle>(RenderCircle)?.setStyle({ lineColour: 0x00ff00 });
                data.other.getEntity().getComponent<RenderCircle>(RenderCircle)?.setStyle({ lineColour: 0x00ff00 });
            });

            collider.onTriggerExitWithLayer(0, (caller, data) => {
                caller.getEntity().getComponent<RenderCircle>(RenderCircle)?.setStyle({ lineColour: 0xffffff });
                data.other.getEntity().getComponent<RenderCircle>(RenderCircle)?.setStyle({ lineColour: 0xffffff });
                caller.getEntity().destroy();
            });
        }

        this.addGUIEntity(new Diagnostics("red", 20, true));

        this.addFnSystem([MoveMe], (delta, entity, moveme) => {
            const motion = MathUtil.lengthDirXY(delta * 0.01, MathUtil.degToRad(moveme.dir));
            entity.transform.x = (entity.transform.x + motion.x + 512) % 512;
            entity.transform.y = (entity.transform.y + motion.y + 512) % 512;
        });
    }
}

export class CollisionTesting extends Game {
    startScene = () => new MainScene(this);
    resourceLoad = async () => {};

    constructor() {
        super({
            width: 512,
            height: 512,
            resolution: 1,
            backgroundColor: 0x200140,
        });

        Log.logLevel = LogLevel.INFO;
    }
}
