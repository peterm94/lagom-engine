import { ActionOnPress, Component, Entity, Game, Key, newSystem, RenderRect, Scene, TextDisp, types } from "lagom-engine";

// TODO make this more generic
// TODO update values before use
// TODO check the colours
const submitUrl = "https://quackqack.pythonanywhere.com/GAME/submit";
const leaderboardUrl = "https://quackqack.pythonanywhere.com/GAME/leaderboard"
const secret = "";

export async function submitScore(name: string, score: number) {

    const hash = await sha256(score + secret);

    try {
        const resp = await fetch(submitUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, score, hash }),
            signal: AbortSignal.timeout(5000),
        });
        return resp.ok;
    } catch (e) {
        return false;
    }
}

async function sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getScores(): Promise<Score[] | null> {
    try {
        const resp = await fetch(leaderboardUrl, {
            signal: AbortSignal.timeout(5000),
        });
        if (!resp.ok) {
            return null;
        }
        return resp.json().then((data) => data.slice(0, 10));
    } catch (error) {
        return null;
    }
}

interface Score {
    name: string;
    score: number;
}

class NameComp extends Component {
    static NAME_LENGTH = 6;
    static letters: string[] = "_".repeat(NameComp.NAME_LENGTH).split("");
    static index: number = 0;
}

class RenderName extends TextDisp {}

export class SubmitScore extends Entity {
    constructor(readonly score: number) {
        super("submitter", Game.GAME_WIDTH / 2, 0);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(
            new RenderRect(
                {
                    xOff: -40,
                    yOff: 15,
                    width: 80,
                    height: Game.GAME_HEIGHT - 30,
                },
                0x3f5e5c,
                0x6d8d8a,
            ),
        );

        this.addComponent(
            new TextDisp(0, 20, "New High Score!", {
                fontFamily: "retro",
                fill: 0xf6edcd,
                fontSize: 7,
            }),
        ).pixiObj.anchor.set(0.5);

        this.addComponent(
            new TextDisp(0, 40, "Enter Name", {
                fontFamily: "retro",
                fill: 0xf6edcd,
                fontSize: 6,
            }),
        ).pixiObj.anchor.set(0.5);

        this.addComponent(
            new RenderName(0, 50, "___", {
                fontFamily: "retro",
                fill: 0xf6edcd,
                fontSize: 8,
            }),
        ).pixiObj.anchor.set(0.5);

        this.addComponent(
            new TextDisp(0, 75, "Press Enter\nto Submit", {
                fontFamily: "retro",
                fill: 0xe2a97e,
                align: "center",
                fontSize: 5,
            }),
        ).pixiObj.anchor.set(0.5);

        const nameComp = this.addComponent(new NameComp());

        const updateName = (e: KeyboardEvent) => {
            const key = e.key;

            if (/^[a-zA-Z0-9]$/.test(key) && NameComp.index < NameComp.NAME_LENGTH) {
                NameComp.letters[NameComp.index] = key;
                NameComp.index = (NameComp.index + 1) % (NameComp.NAME_LENGTH + 1);
            } else if (key === "Backspace" && NameComp.index > 0) {
                NameComp.index = (NameComp.index - 1 + NameComp.letters.length) % NameComp.NAME_LENGTH;
                NameComp.letters[NameComp.index] = "_";
            } else if (key === "Enter" && NameComp.index != 0) {
                submitScore(NameComp.letters.slice(0, NameComp.index).join(""), this.score).then((success) => {
                    document.removeEventListener("keydown", updateName);
                    this.destroy();
                    // TODO make this the main scene
                    this.scene.addGUIEntity(new HighScores(this.score, success, () => new Scene(this.getScene().game)));
                });
            }
        };

        document.addEventListener("keydown", updateName);

        this.scene.addFnSystem(
            newSystem(types(NameComp, RenderName), (delta, entity, name, txt) => {
                txt.pixiObj.text = NameComp.letters.join("");
            }),
        );
    }
}

export class HighScores extends Entity {
    constructor(
        readonly score: number,
        readonly submitSuccess: boolean,
        readonly mainScene: () => Scene
    ) {
        super("highscores", Game.GAME_WIDTH / 2, 0);
    }

    onAdded() {
        super.onAdded();

        this.scene.addSystem(
            new ActionOnPress(() => {
                this.scene.game.setScene(this.mainScene());
            }, [Key.Space]),
        );

        this.addComponent(
            new RenderRect(
                {
                    xOff: -40,
                    yOff: 5,
                    width: 80,
                    height: Game.GAME_HEIGHT - 10,
                },
                0x3f5e5c,
                0x6d8d8a,
            ),
        );
        this.addComponent(
            new TextDisp(0, 10, "HighScores", {
                fontFamily: "retro",
                fill: 0xf6edcd,
                fontSize: 7,
            }),
        ).pixiObj.anchor.set(0.5);

        this.addComponent(
            new TextDisp(0, 79, `Your Score: ${this.score}`, {
                fontFamily: "retro",
                fill: 0xf6edcd,
                fontSize: 5,
            }),
        ).pixiObj.anchor.set(0.5);

        this.addComponent(
            new TextDisp(0, 89, `Press Space to Restart`, {
                fontFamily: "retro",
                fill: 0xe2a97e,
                fontSize: 4,
            }),
        ).pixiObj.anchor.set(0.5);

        if (!this.submitSuccess) {
            this.addComponent(
                new TextDisp(0, 73, "Failed to submit score", {
                    fontFamily: "retro",
                    fill: 0xe2a97e,
                    fontSize: 3,
                }),
            ).pixiObj.anchor.set(0.5);
        }

        getScores().then((scores) => {
            if (scores === null) {
                this.addComponent(
                    new TextDisp(0, 41, "Error\nFetching Scores", {
                        fontFamily: "retro",
                        fill: 0xf6edcd,
                        align: "center",
                        fontSize: 5,
                    }),
                ).pixiObj.anchor.set(0.5);
                return;
            }

            let yoff = 18;
            scores.forEach((score) => {
                this.addComponent(
                    new TextDisp(-35, yoff, score.name, {
                        fontFamily: "retro",
                        fill: 0xf6edcd,
                        fontSize: 5,
                    }),
                );

                this.addComponent(
                    new TextDisp(5, yoff, score.score.toString(), {
                        fontFamily: "retro",
                        align: "left",

                        fill: 0xf6edcd,
                        fontSize: 5,
                    }),
                );

                yoff += 5;
            });
        });
    }
}
