import { Component } from "../ECS/Component";
import { GlobalSystem } from "../ECS/GlobalSystem";
import { Observable } from "./Observer";

/**
 * Frame synced timer. Requires the TimerSystem to be updated.
 */
export class Timer<T> extends Component {
    /**
     * Event that is triggered when the timer is completed.
     */
    onTrigger: Observable<Timer<T>, T> = new Observable();

    timerLengthMs: number = 0;
    remainingMs: number = 0;
    payload: T;
    repeat: boolean;

    /**
     * Reset this timer. The original payload will be used.
     * @param lengthMs New timer value.
     */
    public reset(lengthMs: number) {
        this.timerLengthMs = lengthMs;
        this.remainingMs = lengthMs;
    }

    /**
     * Create a new timer.
     * @param lengthMs Timer length in milliseconds.
     * @param payload What will be delivered in the trigger event.
     * @param repeat Set to true to repeat the timer after it triggers.
     */
    constructor(lengthMs: number, payload: T, repeat = false) {
        super();
        this.reset(lengthMs);
        this.payload = payload;
        this.repeat = repeat;
    }

    onRemoved(): void {
        super.onRemoved();
        this.onTrigger.releaseAll();
    }
}

/**
 * System used to drive the Timer.
 */
export class TimerSystem extends GlobalSystem<[Timer<unknown>[]]> {
    types = [Timer];

    update(delta: number): void {
        this.runOnComponents((timers: Timer<unknown>[]) => {
            for (const timer of timers) {
                timer.remainingMs -= delta;

                if (timer.remainingMs <= 0) {
                    timer.onTrigger.trigger(timer, timer.payload);
                    // Check again for remaining time, reset() may have been called in the timer.
                    if (!timer.repeat && timer.remainingMs <= 0) {
                        timer.destroy();
                    } else {
                        timer.remainingMs = timer.timerLengthMs;
                    }
                }
            }
        });
    }
}

/**
 * Non frame-synced timer. Not controlled by the ECS at all. Be careful with references that may expire.
 */
export class AsyncTimer {
    private remainingMS: number;
    private readonly callback: () => void;

    /**
     * Create a new timer.
     * @param lengthMS Timer duration in milliseconds.
     * @param triggerCallback Callback that is called when the timer is triggered.
     */
    constructor(lengthMS: number, triggerCallback: () => void) {
        this.remainingMS = lengthMS;
        this.callback = triggerCallback;

        this.update(0);
    }

    private update(elapsedMS: number): void {
        this.remainingMS -= elapsedMS;

        if (this.remainingMS <= 0) {
            this.callback();
        } else {
            requestAnimationFrame(this.update.bind(this));
        }
    }
}
