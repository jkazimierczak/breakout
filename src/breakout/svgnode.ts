// MIT License

// Copyright (c) 2022 jkazimierczak

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export const COLLISION = {
    NONE: Symbol("NONE"),
    TOP: Symbol("TOP"),
    RIGHT: Symbol("RIGHT"),
    BOTTOM: Symbol("BOTTOM"),
    LEFT: Symbol("LEFT"),
};

interface ISVGNodeParams {
    selector?: string;
    domNode?: HTMLElement;
}

export class SVGNode {
    node: HTMLElement;

    constructor(obj: ISVGNodeParams) {
        if (obj.selector) {
            const element = document.querySelector<HTMLElement>(obj.selector);
            if (!element) {
                throw new Error(`Selector ${obj.selector} yielded no objects.`);
            }
            this.node = element;
        } else if (obj.domNode) {
            this.node = obj.domNode;
        }
        throw new Error("Invalid constructor params");
    }

    getStringAttr(attrName: string) {
        return this.node.getAttribute(attrName);
    }

    get(attrName: string) {
        return Number(this.getStringAttr(attrName));
    }

    set(attrName: string, value: string) {
        return this.node.setAttribute(attrName, value);
    }

    collidesWith(svg: SVGNode) {
        return (
            this.x + this.width >= svg.x && // left-edge
            this.x <= svg.x + svg.width && // right-edge
            this.y + this.height >= svg.y && // top-edge
            this.y <= svg.y + svg.height // bottom-edge
        );
    }

    collidesWithWhichEdge(svg: SVGNode) {
        if (!this.collidesWith(svg)) {
            return { edge: COLLISION.NONE };
        }

        if (this.x + this.width === svg.x) {
            return { edge: COLLISION.LEFT };
        } else if (this.x === svg.x + svg.width) {
            return { edge: COLLISION.RIGHT };
        } else if (this.y + this.height === svg.y) {
            return { edge: COLLISION.TOP };
        } else if (this.y === svg.y + svg.height) {
            return { edge: COLLISION.BOTTOM };
        } else {
            return { edge: COLLISION.NONE };
        }
    }

    get x() {
        return this.get("x");
    }

    set x(value: number) {
        this.set("x", String(value));
    }

    get y() {
        return this.get("y");
    }

    set y(value: number) {
        this.set("y", String(value));
    }

    get width() {
        return this.get("width");
    }

    set width(value: number) {
        this.set("width", String(value));
    }

    get height() {
        return this.get("height");
    }

    set height(value: number) {
        this.set("height", String(value));
    }
}

export type SVGNodeParams = ConstructorParameters<typeof SVGNode>[0];
