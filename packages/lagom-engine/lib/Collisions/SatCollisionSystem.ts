import {GlobalSystem} from "../ECS/GlobalSystem";
import {Component} from "../ECS/Component";
import {CollisionMatrix} from "./CollisionMatrix";
import {Entity} from "../ECS/Entity";
import {Log, Util} from "../Common/Util";
import * as SAT from "sat";
import {Observable} from "../Common/Observer";
import {CircleColliderOptions, PolyColliderInterface} from "./Colliders";

export abstract class SatCollider extends Component {

    abstract shape: SAT.Circle | SAT.Polygon

    constructor(readonly layer: number, readonly xOff: number, readonly yOff: number) {
        super();
    }

    updatePosition() {
        const worldPoint = this.parent.transform.getGlobalPosition()
        this.shape.pos.x = worldPoint.x
        this.shape.pos.y = worldPoint.y
    }

    readonly onTrigger: Observable<SatCollider, { other: SatCollider; result: SAT.Response }> = new Observable();
    readonly onTriggerEnter: Observable<SatCollider, { other: SatCollider; result: SAT.Response }> = new Observable();
    readonly onTriggerExit: Observable<SatCollider, { other: SatCollider; result: SAT.Response }> = new Observable();
}

export class PolySatCollider extends SatCollider {
    constructor(options: PolyColliderInterface) {
        super(options.layer, options.xOff ?? 0, options.yOff ?? 0);
        const vec = options.points.map(value => new SAT.Vector(value[0], value[1]));
        this.shape = new SAT.Polygon(new SAT.Vector(options.xOff, options.yOff), vec)
    }

    override shape: SAT.Polygon;
}

export class CircleSatCollider extends SatCollider {
    override shape: SAT.Circle

    constructor(options: CircleColliderOptions) {
        super(options.layer, options.xOff ?? 0, options.yOff ?? 0);

        this.shape = new SAT.Circle(new SAT.Vector(options.xOff, options.yOff), options.radius);
    }
}

export class SatCollisionSystem extends GlobalSystem<[SatCollider[]]> {
    types = [SatCollider];

    // Key is the collision layer.
    readonly colliders: Map<number, SatCollider[]> = new Map();

    constructor(readonly collisionMatrix: CollisionMatrix) {
        super();
    }

    private last_frame: Map<string, [SatCollider, SatCollider, SAT.Response]> = new Map();

    update(_delta: number): void {

        // Update all positions.
        this.colliders.forEach(v => v.forEach( coll => coll.updatePosition()))

        const hits: Map<string, [SatCollider, SatCollider, SAT.Response]> = new Map();
        for (let [l1, l2] of this.collisionMatrix.collisionPairs) {
            const colliders1 = this.colliders.get(l1);
            const colliders2 = this.colliders.get(l2);

            if (colliders1 === undefined || colliders1.length === 0
                || colliders2 === undefined || colliders2.length === 0) {
                continue;
            }

            // TODO if l1 == l2 we can do something better
            for (const c1 of colliders1) {
                for (const c2 of colliders2) {
                    const coll = this.testCollision(c1, c2);
                    if (coll !== undefined) {
                        hits.set(`${c1.id}:${c2.id}`, [c1, c2, coll]);
                    }
                }
            }
        }

        // Trigger all hit callbacks
        hits.forEach(([c1, c2, coll], key) => {
            // TODO sort? or do we rely on this being the same way every time?
            if (this.last_frame.has(key)) {
                c1.onTrigger.trigger(c1, {other: c2, result: coll});
                // TODO the result is the wrong way around
                c2.onTrigger.trigger(c2, {other: c1, result: coll});
            } else {
                c1.onTriggerEnter.trigger(c1, {other: c2, result: coll});
                // TODO the result is the wrong way around
                c2.onTriggerEnter.trigger(c2, {other: c1, result: coll});
            }
            this.last_frame.delete(key);
        })

        this.last_frame.forEach(([c1, c2, coll], _key) => {
            c1.onTriggerExit.trigger(c1, {other: c2, result: coll});
            // TODO the result is the wrong way around
            c2.onTriggerExit.trigger(c2, {other: c1, result: coll});
        })

        this.last_frame = hits;
    }

    private testCollision(c1: SatCollider, c2: SatCollider): SAT.Response | undefined {
        const response = new SAT.Response();

        if (c1 instanceof PolySatCollider) {
            if (c2 instanceof PolySatCollider) {
                if (SAT.testPolygonPolygon(c1.shape, c2.shape, response)) {
                    return response;
                }
            } else if (c2 instanceof CircleSatCollider) {
                if (SAT.testPolygonCircle(c1.shape, c2.shape, response)) {
                    return response;
                }
            }
        }

        if (c1 instanceof CircleSatCollider) {
            if (c2 instanceof PolySatCollider) {
                if (SAT.testCirclePolygon(c1.shape, c2.shape, response)) {
                    return response;
                }
            } else if (c2 instanceof CircleSatCollider) {
                if (SAT.testCircleCircle(c1.shape, c2.shape, response)) {
                    return response;
                }
            }
        }

        return undefined;
    }

    fixedUpdate(_: number) {
        super.fixedUpdate(_);

    }

    protected componentLoaded(_entity: Entity, component: SatCollider) {
        super.componentLoaded(_entity, component);

        let colliders = this.colliders.get(component.layer);
        if (colliders === undefined) {
            colliders = [];
            this.colliders.set(component.layer, colliders);
        }

        colliders.push(component);
    }

    protected componentRemoved(_entity: Entity, component: SatCollider): void {
        super.componentRemoved(_entity, component);

        let colliders = this.colliders.get(component.layer);
        if (colliders === undefined) {
            Log.warn("No colliders found with group ", component.layer);
            return;
        }
        Util.remove(colliders, component);
    }
}