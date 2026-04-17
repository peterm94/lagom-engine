import {
    Button,
    CircleSatCollider,
    CollisionMatrix,
    Component,
    Entity,
    Game,
    Key,
    Log,
    LogLevel,
    RectSatCollider,
    RenderCircle,
    RenderRect,
    SatCollisionSystem,
    Scene,
    TextDisp,
} from "lagom-engine";

class MainScene extends Scene {
    onAdded(): void {
        const matrix = new CollisionMatrix();
        matrix.addCollision(0, 1);

        this.addGlobalSystem(new SatCollisionSystem(matrix));

        class KeyTest extends Component {}

        const e = this.addEntity(new Entity("keyboard_testing", 100, 100));
        e.addComponent(new RenderCircle({ radius: 50 }));
        e.addComponent(new KeyTest());

        this.addFnSystem([RenderCircle, KeyTest], (delta, e, circle, kt) => {
            if (Game.keyboard.isKeyPressed(Key.KeyA, Key.Space)) {
                console.log("Key pressed");
                circle.setStyle({ fillColour: 0xff0000, lineColour: 0xff0000 });
            }
            if (Game.keyboard.isKeyReleased(Key.KeyA, Key.Space)) {
                console.log("Key released");
                circle.setStyle({ fillColour: 0x00ffff, lineColour: 0x00ffff });
            }
        });

        class MouseOnTop extends Component {
            constructor(public state = false) {
                super();
            }
        }

        // Mouse
        const mouse = this.addEntity(new Entity("mouse_testing", 350, 100));
        mouse.addComponent(new TextDisp(0, 0, "m_x: 0\nm_y: 0", { fill: 0xffffff, fontSize: 14 }));
        const rect = mouse.addComponent(new RenderRect({ width: 100, height: 100 }));
        const mouseOnTop = mouse.addComponent(new MouseOnTop());
        const rectCollider = mouse.addComponent(new RectSatCollider({ width: 100, height: 100, layer: 1 }));
        rectCollider.onTriggerEnter.register(() => {
            rect.setStyle({ lineColour: 0xff0000 });
            mouseOnTop.state = true;
        });
        rectCollider.onTriggerExit.register(() => {
            rect.setStyle({ lineColour: 0xffffff });
            mouseOnTop.state = false;
        });

        this.addFnSystem([TextDisp, RenderRect, MouseOnTop], (delta, entity, text, rect, mouse) => {
            const speed = 0.1;
            // move camera with arrows
            if (Game.keyboard.isKeyDown(Key.ArrowLeft)) {
                this.camera.translate(delta * speed, 0);
            }
            if (Game.keyboard.isKeyDown(Key.ArrowRight)) {
                this.camera.translate(delta * -speed, 0);
            }
            if (Game.keyboard.isKeyDown(Key.ArrowUp)) {
                this.camera.translate(0, delta * speed);
            }
            if (Game.keyboard.isKeyDown(Key.ArrowDown)) {
                this.camera.translate(0, delta * -speed);
            }

            if (Game.mouse.isButtonDown(Button.LEFT) && mouse.state) {
                rect.setStyle({ fillColour: 0x0030ff });
            }
            if (Game.mouse.isButtonReleased(Button.LEFT)) {
                rect.setStyle({ fillColour: null });
            }

            const mx = Game.mouse.x;
            const my = Game.mouse.y;
            const world = this.camera.viewToWorld(mx, my);
            (text as TextDisp).pixiObj.text =
                `view_x: ${mx.toFixed(0)}\nview_y: ${my.toFixed(0)}\n` +
                `world_x: ${world.x.toFixed(0)}\nworld_y: ${world.y.toFixed(0)}\n` +
                `cam_x: ${this.camera.position().x.toFixed(0)}\ncam_y: ${this.camera.position().y.toFixed(0)}`;
        });

        class PointerTest extends Component {}

        const pointer = this.addEntity(new Entity("pointer"));
        pointer.addComponent(new CircleSatCollider({ radius: 1, layer: 0 }));
        pointer.addComponent(new PointerTest());
        pointer.addComponent(new RenderCircle({ radius: 1 }));

        this.addFnSystem([CircleSatCollider, PointerTest], (delta, e, _1, _2) => {
            const pos = Game.mouse.worldPos(this.camera);
            e.transform.x = pos.x;
            e.transform.y = pos.y;
        });
    }
}

/**
 * Test keyboard, mouse and touch interactions
 */
export class InputTesting extends Game {
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
