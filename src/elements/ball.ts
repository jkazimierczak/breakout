import { SVGNode, SVGNodeParams } from "./svgnode.ts";
import { BALL_SPEED } from "@/constants.ts";

export class SVGBall extends SVGNode {
    velocity = { x: 0, y: 0 };

    constructor(obj: SVGNodeParams, initialAngle = 90) {
        super(obj);

        const direction = (initialAngle * Math.PI) / 180;
        this.velocity.x = BALL_SPEED * Math.cos(-direction);
        this.velocity.y = BALL_SPEED * Math.sin(-direction);
    }

    switchXDir() {
        this.velocity.x = -this.velocity.x;
    }

    switchYDir() {
        this.velocity.y = -this.velocity.y;
    }
}
