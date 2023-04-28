import { SVGNode, SVGNodeParams } from "./svgnode.ts";
import { BALL_SPEED } from "@/constants.ts";
import { random } from "lodash-es";

export class SVGBall extends SVGNode {
    velocity = { x: 0, y: 0 };

    constructor(obj: SVGNodeParams, initialAngle?: number) {
        super(obj);

        if (!initialAngle) {
            this.initializeWithRandomAngle();
            return;
        }
        this.initialize(initialAngle);
    }

    initialize(angle: number) {
        const direction = (angle * Math.PI) / 180;
        this.velocity.x = BALL_SPEED * Math.cos(-direction);
        this.velocity.y = BALL_SPEED * Math.sin(-direction);
    }

    initializeWithRandomAngle() {
        this.initialize(random(45, 180 - 45));
    }

    switchXDir() {
        this.velocity.x = -this.velocity.x;
    }

    switchYDir() {
        this.velocity.y = -this.velocity.y;
    }
}
