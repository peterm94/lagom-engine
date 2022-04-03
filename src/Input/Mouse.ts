import { Button } from "./Button";
import PixiMouse from "./PixiMouse";

export class Mouse
{
    constructor(readonly canvas: HTMLCanvasElement)
    {
    }

    readonly pixi_mouse = new PixiMouse(this.canvas)

    /**
     * Check if a button pressed down in this frame.
     * @param button The button to check for.
     * @returns True if they button has been pressed this frame.
     */
    isButtonPressed(button: Button): boolean
    {
        return this.pixi_mouse.isButtonPressed(button)
    }

    /**
     * Check if a button is currently down in this frame.
     * @param button The button to check for.
     * @returns True if they button is down this frame.
     */
    isButtonDown(button: Button): boolean
    {
        return this.pixi_mouse.isButtonDown(button);
    }

    /**
     * Check if a button has been released in this frame.
     * @param button The button to check for.
     * @returns True if they button has been released this frame.
     */
    isButtonReleased(button: Button): boolean
    {
        return this.pixi_mouse.isButtonReleased(button);
    }

    /**
     * Get the current mouse X position.
     * @returns The current X position of the mouse.
     */
    getPosX(): number
    {
        return this.pixi_mouse.getPosX();
    }

    /**
     * Get the current mouse Y position.
     * @returns The current Y position of the mouse.
     */
    getPosY(): number
    {
        return this.pixi_mouse.getPosY();
    }
}