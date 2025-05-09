export enum ButtonState {
    UP,
    DOWN,
    PRESSED,
    RELEASED
}

/**
 * Class storing all player keyboard inputs.
 */
export class Keyboard {

    private readonly keys: Map<string, ButtonState> = new Map();

    /**
     * Constructor.
     *
     * @param canvas The game canvas to listen for keyboard inputs on.
     */
    constructor(canvas: HTMLCanvasElement) {
        const keydown = (e: KeyboardEvent) => {
            e.preventDefault();

            const curr = this.keys.get(e.code) || ButtonState.UP;
            // Not currently down, press it
            if (curr === ButtonState.UP || curr === ButtonState.RELEASED) {
                this.keys.set(e.code, ButtonState.PRESSED);
            } else {
                // Already pressed, set to down
                this.keys.set(e.code, ButtonState.DOWN);
            }
        };

        const keyup = (e: KeyboardEvent) => {
            e.preventDefault();

            const curr = this.keys.get(e.code) || ButtonState.UP;
            // Currently down, release it
            if (curr === ButtonState.DOWN || curr === ButtonState.PRESSED) {
                this.keys.set(e.code, ButtonState.RELEASED);
            } else {
                this.keys.set(e.code, ButtonState.UP);
            }
        };

        const clearKeys = () => this.keys.clear();

        const mousedown = (e: MouseEvent) => {

            // Clear on right click. Otherwise keys get "stuck" down.
            if (e.button === 2) {
                this.keys.clear();
            }
        };

        canvas.addEventListener("keydown", keydown);
        canvas.addEventListener("keyup", keyup);
        canvas.addEventListener("blur", clearKeys);
        canvas.addEventListener("mousedown", mousedown);

        // Focusable.
        canvas.tabIndex = 1;
        canvas.style.outline = "none";
    }

    public update() {

        // This runs after the logic for the frame, so we can advance the states.
        for (const [key, value] of this.keys) {
            if (value === ButtonState.RELEASED) {
                this.keys.delete(key);
            } else if (value === ButtonState.PRESSED) {
                this.keys.set(key, ButtonState.DOWN);
            }
        }
    }

    /**
     * Check if a key has been pressed down in this frame.
     * @param keys The keys to check for. Only one key must be down for this to trigger.
     * @returns True if they key has been pressed this frame.
     */
    public isKeyPressed = (...keys: string[]) => keys.some(key => this.keys.get(key) === ButtonState.PRESSED);

    /**
     * Check if a key has been released in this frame.
     * @param keys The keys to check for. Only one key must be released for this to trigger.
     * @returns True if they key has been released this frame.
     */
    public isKeyReleased = (...keys: string[]) => keys.some(key => this.keys.get(key) === ButtonState.RELEASED);

    /**
     * Check if a key is currently down in this frame.
     * @param keys The keys to check for. Only one key must be down for this to trigger.
     * @returns True if they key is down this frame.
     */
    public isKeyDown = (...keys: string[]) => keys.some(key => this.keys.get(key) === ButtonState.DOWN || this.keys.get(key) === ButtonState.PRESSED);
}
