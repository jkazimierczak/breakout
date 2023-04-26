import { SVGNode, SVGNodeParams } from "../breakout/svgnode.ts";

export class SVGText extends SVGNode {
    tspan: SVGTSpanElement;

    constructor(obj: SVGNodeParams) {
        super(obj);

        const tspan = this.node.querySelector("tspan");
        if (!tspan) {
            throw new Error("tspan not found");
        }
        this.tspan = tspan;
    }

    set text(text) {
        this.tspan.textContent = text;
    }

    get text() {
        return this.tspan.textContent;
    }
}
