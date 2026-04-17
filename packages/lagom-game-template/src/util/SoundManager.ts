import { AnimatedSpriteController, Button, Component, CType, Entity, Game, Key, System, Timer } from "lagom-engine";

class MuteComp extends Component {}

class MuteListener extends System<[AnimatedSpriteController, MuteComp]> {
    types: [CType<AnimatedSpriteController>, CType<MuteComp>] = [AnimatedSpriteController, MuteComp];

    runOnEntities(delta: number, e: Entity, spr: AnimatedSpriteController, args_1: MuteComp): void {
        if (Game.mouse.isButtonPressed(Button.LEFT)) {
            const pos = Game.mouse.canvasPos();
            if (pos.x >= Game.GAME_WIDTH - 24 && pos.x <= Game.GAME_WIDTH - 8 && pos.y >= Game.GAME_HEIGHT - 24 && pos.y <= Game.GAME_HEIGHT - 8) {
                Game.audio.toggleMuted();
                spr.setAnimation(Number(Game.audio.muted));
            }
        } else if (Game.keyboard.isKeyPressed(Key.KeyM)) {
            Game.audio.toggleMuted();
            spr.setAnimation(Number(Game.audio.muted));
        }
    }
}

export class SoundManager extends Entity {
    constructor() {
        super("audio", Game.GAME_WIDTH - 16 - 8, Game.GAME_HEIGHT - 24, 0);
    }

    onAdded(): void {
        super.onAdded();

        this.addComponent(new MuteComp());
        const spr = this.addComponent(
            new AnimatedSpriteController(Number(Game.audio.muted), [
                {
                    id: 0,
                    textures: [this.scene.game.getTexture("mute_button").tileAt(0, 0)],
                },
                {
                    id: 1,
                    textures: [this.scene.game.getTexture("mute_button").tileAt(1, 0)],
                },
            ]),
        );

        this.addComponent(new Timer(50, spr, false)).onTrigger.register((caller, data) => {
            data.setAnimation(Number(Game.audio.muted));
        });

        this.scene.addSystem(new MuteListener());
    }

    onRemoved(): void {
        super.onRemoved();
    }
}
