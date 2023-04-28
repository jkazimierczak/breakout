import { SVGNode, SVGNodeParams } from "./svgnode.ts";
import gsap from "gsap";
import { BAR_SPEED } from "@/constants.ts";

export class SVGBar extends SVGNode {
    velocity = { x: 0 };

    constructor(obj: SVGNodeParams) {
        super(obj);

        this.setAngle(0);
    }

    setDirectionRight() {
        this.setAngle(0);
    }

    setDirectionLeft() {
        this.setAngle(180);
    }

    private setAngle(angle: number) {
        const direction = (angle * Math.PI) / 180;
        this.velocity.x = BAR_SPEED * Math.cos(-direction);
    }

    move() {
        gsap.to(this.node, {
            duration: 0.1,
            attr: { x: this.x1 + this.velocity.x },
            ease: "ease-out",
        });
    }

    moveTo(x: number) {
        gsap.to(this.node, {
            duration: 0.1,
            attr: { x: x },
            ease: "ease-out",
        });
    }
}
