// This file is taken from pixi-mouse.js but takes the canvas in its constructor rather than finding it itself.
// TODO rewrite as Typescript.
export default class PixiMouse {
    constructor(canvasElement) {

        setTimeout(() => {
            canvasElement.addEventListener("mousemove", (event) => {
                if (this.posLocalX !== event.clientX || this.posLocalY !== event.clientY) {
                    this.posLocalX = event.clientX; this.posLocalY = event.clientY;
                }

                if (this.posGlobalX !== event.screenX || this.posGlobalY !== event.screenY) {
                    this.posGlobalX = event.screenX; this.posGlobalY = event.screenY;
                }
            });

            canvasElement.addEventListener("mousedown", (event) => {
                let buttonCode = event.button;
                if (!this.buttonStates.get(buttonCode)) {
                    event.posLocalX = this.getPosLocalX(); event.posLocalY = this.getPosLocalY();
                    this.buttonStates.set(buttonCode, event);
                }
            });

            canvasElement.addEventListener("mouseup", (event) => {
                let buttonCode = event.button;
                event = this.buttonStates.get(buttonCode);
                if (event) {
                    event.wasReleased = true;
                }
            });
        }, 0);

        this.buttonStates = new Map();
    }

    getPosGlobalX() {
        return this.posGlobalX;
    }

    getPosGlobalY() {
        return this.posGlobalY;
    }

    getPosLocalX() {
        return this.posLocalX;
    }

    getPosLocalY() {
        return this.posLocalY;
    }

    getPosX() {
        return this.getPosLocalX();
    }

    getPosY() {
        return this.getPosLocalY();
    }

    clear() {
        this.buttonStates.clear();
    }

    update() {
        this.buttonStates.forEach((value, buttonCode) => {
            const event = this.buttonStates.get(buttonCode);

            event.alreadyPressed = true;
            if (event.wasReleased)
                this.buttonStates.delete(buttonCode);
        });
    }

    isButtonDown(...args) {
        let result = false;
        for(let buttonCode of args) {
            const key = this.buttonStates.get(buttonCode);
            if (key && !key.wasReleased)
                result = true;
        }

        return result;
    }

    isButtonUp(...args) {
        return !this.isButtonDown(args);
    }

    isButtonPressed(...args) {
        let result = false;

        if (args.length === 0)
            return false;

        for(let buttonCode of args) {
            const event = this.buttonStates.get(buttonCode);
            if (event && !event.wasReleased && !event.alreadyPressed)
                result = true;
        }

        return result;
    }

    isButtonReleased(...args) {
        let result = false;

        if (args.length === 0)
            return false;

        for(let buttonCode of args) {
            const event = this.buttonStates.get(buttonCode);
            if (event && event.wasReleased)
                result = true;
        }

        return result;
    }
}
