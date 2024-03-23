import {System} from "../ECS/System";
import {LagomType} from "../ECS/LifecycleObject";
import {Component} from "../ECS/Component";
import {Camera} from "./Camera";
import {Entity} from "../ECS/Entity";

export class FollowMe extends Component
{
}

export interface CamOptions
{
    centre?: boolean;
    xOffset?: number;
    yOffset?: number;
    lerpSpeed?: number;
}

export class FollowCamera extends System<[FollowMe]>
{
    private camera!: Camera;

    centre = true;
    xOffset = 0;
    yOffset = 0;
    lerpSpeed = 0.1;


    constructor(options?: CamOptions)
    {
        super();

        if (options)
        {
            if (options.centre !== undefined) this.centre = options.centre;
            if (options.xOffset !== undefined) this.xOffset = options.xOffset;
            if (options.yOffset !== undefined) this.yOffset = options.yOffset;
            if (options.lerpSpeed !== undefined) this.lerpSpeed = options.lerpSpeed;
        }
    }

    onAdded(): void
    {
        super.onAdded();

        this.camera = this.getScene().camera;
    }

    types(): LagomType<Component>[]
    {
        return [FollowMe];
    }

    update(): void
    {
        // no normal update required for this system
    }

    fixedUpdate(delta: number): void
    {
        this.runOnEntities((entity: Entity) => {

            let targetX = entity.transform.x + this.xOffset;
            let targetY = entity.transform.y + this.yOffset;

            // Calculate camera midpoint
            if (this.centre)
            {
                targetX -= this.camera.halfWidth;
                targetY -= this.camera.halfHeight;
            }

            // Soft follow
            this.camera.moveTowards(targetX, targetY, this.lerpSpeed * (delta / 1000));
        });
    }
}
