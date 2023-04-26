import { SVGNode, SVGNodeParams } from "./svgnode.ts";

export class SVGScreen extends SVGNode {
    btn: Element;

    constructor(obj: SVGNodeParams) {
        super(obj);

        const btn = this.node.querySelector(".btn");
        if (!btn) {
            throw new Error("The screen has no button.");
        }
        this.btn = btn;
    }
}
