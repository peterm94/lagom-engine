import { ButtonState } from "./Button";

export class Mouse {
    // See Button class for mappings.
    private readonly buttons: Map<number, ButtonState> = new Map();

    // Position in canvas coordinates. To put it in world space, convert using a Camera object.
    public x = 0;
    public y = 0;

    // Useful for touch controls, we want to just know if a finger is down.
    public isActive = false;
    private activePointerId: number | null = null;

    constructor(canvas: HTMLCanvasElement) {
        // Using pointer events means we can capture touch as well as mouse
        // I haven't really tested it but should work
        canvas.addEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();

            this.activePointerId = e.pointerId;
            this.isActive = true;

            const curr = this.buttons.get(e.button) || ButtonState.UP;
            if (curr === ButtonState.UP || curr === ButtonState.RELEASED) {
                this.buttons.set(e.button, ButtonState.PRESSED);
            } else {
                this.buttons.set(e.button, ButtonState.DOWN);
            }

            this.updatePosition(e, canvas);
            canvas.setPointerCapture(e.pointerId);
        });

        // Pointer move
        canvas.addEventListener("pointermove", (e: PointerEvent) => {
            if (this.activePointerId === e.pointerId) {
                this.updatePosition(e, canvas);
            }
        });

        // Pointer up
        canvas.addEventListener("pointerup", (e: PointerEvent) => {
            e.preventDefault();

            // If the latest touch event is released, set inactive.
            if (this.activePointerId === e.pointerId) {
                this.isActive = false;
                this.activePointerId = null;
            }

            const curr = this.buttons.get(e.button) || ButtonState.UP;
            if (curr === ButtonState.DOWN || curr === ButtonState.PRESSED) {
                this.buttons.set(e.button, ButtonState.RELEASED);
            } else {
                this.buttons.set(e.button, ButtonState.UP);
            }

            canvas.releasePointerCapture(e.pointerId);
        });

        canvas.addEventListener("pointercancel", () => {
            this.isActive = false;
            this.activePointerId = null;
            this.buttons.clear();
        });

        // This would disable canvas right click, I like it for screenshots.
        // canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    private updatePosition(event: PointerEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect();
        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;
    }

    public update() {
        // Advance states
        for (const [button, state] of this.buttons) {
            if (state === ButtonState.RELEASED) {
                this.buttons.delete(button);
            } else if (state === ButtonState.PRESSED) {
                this.buttons.set(button, ButtonState.DOWN);
            }
        }
    }

    /**
     * Check if a button pressed down in this frame.
     * @param buttons The button(s) to check for.
     * @returns True if any listed button has been pressed this frame.
     */
    public isButtonPressed = (...buttons: number[]) => buttons.some((b) => this.buttons.get(b) === ButtonState.PRESSED);

    /**
     * Check if a button has been released in this frame.
     * @param buttons The button(s) to check for.
     * @returns True if any listed button has been released this frame.
     */
    public isButtonReleased = (...buttons: number[]) => buttons.some((b) => this.buttons.get(b) === ButtonState.RELEASED);

    /**
     * Check if a button is currently down in this frame.
     * @param buttons The button(s) to check for.
     * @returns True if any listed button is down this frame.
     */
    public isButtonDown = (...buttons: number[]) =>
        buttons.some((b) => {
            const s = this.buttons.get(b);
            return s === ButtonState.DOWN || s === ButtonState.PRESSED;
        });
}
