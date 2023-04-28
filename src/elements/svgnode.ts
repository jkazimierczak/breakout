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

export interface SVGNodeParams {
    selector?: string;
    domNode?: HTMLElement;
}

export class SVGNode {
    node: HTMLElement;

    constructor(obj: SVGNodeParams) {
        if (obj.selector) {
            const element = document.querySelector<HTMLElement>(obj.selector);
            if (!element) {
                throw new Error(`Selector ${obj.selector} yielded no objects.`);
            }
            this.node = element;
        } else if (obj.domNode) {
            this.node = obj.domNode;
        } else {
            throw new Error("Invalid constructor params");
        }
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

    /**
     * Check collision using AABB collision.
     * @param svg The element to check collision against.
     */
    collidesWith(svg: SVGNode) {
        return (
            this.x2 >= svg.x1 && // left-edge
            this.x1 <= svg.x2 && // right-edge
            this.y2 >= svg.y1 && // top-edge
            this.y1 <= svg.y2 // bottom-edge
        );
    }

    /**
     * Check if a point is inside a polygon defined by edges.
     * Each edge has to be represented by a pair of starting X,Y and ending X,Y.
     * @param edges An array of edges.
     * @param xp An x-coordinate of a point.
     * @param yp An y-coordinate of a point.
     * @returns A boolean that tells if a point is inside.
     */
    static isPointInside(edges: number[][], xp: number, yp: number) {
        let count = 0;
        edges.forEach((edge) => {
            const [x1, y1, x2, y2] = edge;
            if (yp < y1 != yp < y2 && xp < x1 + ((yp - y1) / (y2 - y1)) * (x2 - x1)) count++;
        });
        return count % 2 == 1;
    }

    get topEdge() {
        return [this.x1, this.y1, this.x2, this.y1];
    }

    get rightEdge() {
        return [this.x2, this.y1, this.x2, this.y2];
    }

    get bottomEdge() {
        return [this.x1, this.y2, this.x2, this.y2];
    }

    get leftEdge() {
        return [this.x1, this.y1, this.x1, this.y2];
    }

    /**
     * Returns the edges of the node. This assumes that the node is a rectangle.
     */
    getEdges() {
        return [this.topEdge, this.rightEdge, this.bottomEdge, this.leftEdge];
    }

    /**
     * Returns the edges of top triangular overlap area.
     */
    get topOverlapAreaEdges() {
        const triangle_left = [this.x1, this.y1, this.midX, this.midY];
        const triangle_right = [this.x2, this.y1, this.midX, this.midY];
        return [this.topEdge, triangle_right, triangle_left];
    }

    /**
     * Returns the edges of right triangular overlap area.
     */
    get rightOverlapAreaEdges() {
        const triangle_top = [this.x2, this.y1, this.midX, this.midY];
        const triangle_bottom = [this.x2, this.y2, this.midX, this.midY];
        return [this.rightEdge, triangle_bottom, triangle_top];
    }

    /**
     * Returns the edges of bottom triangular overlap area.
     */
    get bottomOverlapAreaEdges() {
        const triangle_left = [this.x1, this.y2, this.midX, this.midY];
        const triangle_right = [this.x2, this.y2, this.midX, this.midY];
        return [this.bottomEdge, triangle_right, triangle_left];
    }

    /**
     * Returns the edges of left triangular overlap area.
     */
    get leftOverlapAreaEdges() {
        const triangle_top = [this.x1, this.y1, this.midX, this.midY];
        const triangle_bottom = [this.x1, this.y2, this.midX, this.midY];
        return [this.leftEdge, triangle_top, triangle_bottom];
    }

    overlapTop(svg: SVGNode) {
        return SVGNode.isPointInside(this.topOverlapAreaEdges, svg.midX, svg.y2);
    }

    /**
     * Determine the overlap from the right side with the SVG.
     * The overlap is calculated until the center.
     * @param svg
     */
    overlapRight(svg: SVGNode) {
        return SVGNode.isPointInside(this.rightOverlapAreaEdges, svg.x1 - 1, svg.midY);
    }

    overlapBottom(svg: SVGNode) {
        return SVGNode.isPointInside(this.bottomOverlapAreaEdges, svg.midX, svg.y1 - 1);
    }

    overlapLeft(svg: SVGNode) {
        return SVGNode.isPointInside(this.leftOverlapAreaEdges, svg.x2, svg.midY);
    }

    overlap(svg: SVGNode) {
        const overlap = {
            top: this.overlapTop(svg),
            bottom: this.overlapBottom(svg),
            right: this.overlapRight(svg),
            left: this.overlapLeft(svg),
        };
        return overlap;
    }

    get x1() {
        return this.get("x");
    }

    set x1(value: number) {
        this.set("x", String(value));
    }

    get x2() {
        return this.x1 + this.width;
    }

    get y1() {
        return this.get("y");
    }

    set y1(value: number) {
        this.set("y", String(value));
    }

    get y2() {
        return this.y1 + this.height;
    }

    get midX() {
        return this.x1 + this.width / 2;
    }

    get midY() {
        return this.y1 + this.height / 2;
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

export function hideNode(node: SVGNode) {
    node.set("display", "none");
}

export function showNode(node: SVGNode) {
    node.set("display", "block");
}
