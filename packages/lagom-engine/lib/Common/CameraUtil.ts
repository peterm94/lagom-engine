import {System} from "../ECS/System";
import {Component} from "../ECS/Component";
import {Camera} from "./Camera";
import {Entity} from "../ECS/Entity";
import {CType} from "../ECS/FnSystemWrapper";

export class FollowMe extends Component {
}

export interface CamOptions {
    centre?: boolean;
    xOffset?: number;
    yOffset?: number;
    lerpSpeed?: number;
}

export class FollowCamera extends System<[FollowMe]> {
    private camera!: Camera;

    centre = true;
    xOffset = 0;
    yOffset = 0;
    lerpSpeed = 0.1;


    constructor(options?: CamOptions) {
        super();

        if (options) {
            if (options.centre !== undefined) this.centre = options.centre;
            if (options.xOffset !== undefined) this.xOffset = options.xOffset;
            if (options.yOffset !== undefined) this.yOffset = options.yOffset;
            if (options.lerpSpeed !== undefined) this.lerpSpeed = options.lerpSpeed;
        }
    }

    onAdded(): void {
        super.onAdded();

        this.camera = this.getScene().camera;
    }

    types: [CType<FollowMe>] = [FollowMe];

    runOnEntities(_delta: number, _entity: Entity, _followMe: FollowMe): void {
        // not required
    }

    runOnEntitiesFixed(delta: number, entity: Entity, _followMe: FollowMe) {
        let targetX = entity.transform.x + this.xOffset;
        let targetY = entity.transform.y + this.yOffset;

        // Calculate camera midpoint
        if (this.centre) {
            targetX -= this.camera.halfWidth;
            targetY -= this.camera.halfHeight;
        }

        // Soft follow
        this.camera.moveTowards(targetX, targetY, this.lerpSpeed * (delta / 1000));
    }
}
