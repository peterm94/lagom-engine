import { Button } from "./Button";

const pixi_mouse = require('pixi.js-mouse');

export class Mouse
{
    /**
     * Check if a button pressed down in this frame.
     * @param button The button to check for.
     * @returns True if they button has been pressed this frame.
     */
    static isButtonPressed(button: Button): boolean
    {
        return pixi_mouse.isButtonPressed(button)
    }

    /**
     * Check if a button is currently down in this frame.
     * @param button The button to check for.
     * @returns True if they button is down this frame.
     */
    static isButtonDown(button: Button): boolean
    {
        return pixi_mouse.isButtonDown(button);
    }

    /**
     * Check if a button has been released in this frame.
     * @param button The button to check for.
     * @returns True if they button has been released this frame.
     */
    static isButtonReleased(button: Button): boolean
    {
        return pixi_mouse.isButtonReleased(button);
    }

    /**
     * Get the current mouse X position.
     * @returns The current X position of the mouse.
     */
    static getPosX(): number
    {
        return pixi_mouse.getPosX();
    }

    /**
     * Get the current mouse Y position.
     * @returns The current Y position of the mouse.
     */
    static getPosY(): number
    {
        return pixi_mouse.getPosY();
    }
}