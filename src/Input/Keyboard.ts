export class Keyboard
{
    private readonly keys: Set<string> = new Set();
    private readonly keyDowns: Set<string> = new Set();
    private readonly keyUps: Set<string> = new Set();

    constructor(canvas: HTMLCanvasElement)
    {
        const keydown = (e: KeyboardEvent) => {
            e.preventDefault();

            if (this.keys.has(e.code)) return;

            this.keyDowns.add(e.code);
            this.keys.add(e.code);
        };

        const keyup = (e: KeyboardEvent) => {
            e.preventDefault();

            this.keyUps.add(e.code);
            this.keys.delete(e.code);
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
        this.keyDowns.clear();
        this.keyUps.clear();
    }

    /**
     * Check if a key has been pressed down in this frame.
     * @param keys The keys to check for. Only one key must be down for this to trigger.
     * @returns True if they key has been pressed this frame.
     */
    public isKeyPressed = (...keys: string[]) => keys.some(key => this.keyDowns.has(key));

    /**
     * Check if a key has been released in this frame.
     * @param keys The keys to check for. Only one key must be released for this to trigger.
     * @returns True if they key has been released this frame.
     */
    public isKeyReleased = (...keys: string[]) => keys.some(key => this.keyUps.has(key));

    /**
     * Check if a key is currently down in this frame.
     * @param keys The keys to check for. Only one key must be down for this to trigger.
     * @returns True if they key is down this frame.
     */
    public isKeyDown = (...keys: string[]) => keys.some(key => this.keys.has(key));
}
