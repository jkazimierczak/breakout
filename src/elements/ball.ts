import { SVGNode, SVGNodeParams } from "./svgnode.ts";
import {
    BALL_DIR_X_LEFT,
    BALL_DIR_X_RIGHT,
    BALL_DIR_Y_DOWN,
    BALL_DIR_Y_UP,
    GAME_STEP,
} from "@/constants.ts";

export class SVGBall extends SVGNode {
    xDir: number;
    yDir: number;

    constructor(obj: SVGNodeParams, xDir: number, yDir: number) {
        super(obj);

        this.xDir = xDir;
        this.yDir = yDir;
    }

    switchXDir() {
        if (this.xDir === BALL_DIR_X_LEFT) {
            this.xDir = BALL_DIR_X_RIGHT;
        } else {
            this.xDir = BALL_DIR_X_LEFT;
        }
    }

    switchYDir() {
        if (this.yDir === BALL_DIR_Y_UP) {
            this.yDir = BALL_DIR_Y_DOWN;
        } else {
            this.yDir = BALL_DIR_Y_UP;
        }
    }

    nextPos() {
        const nextXPos = this.x + GAME_STEP * this.xDir;
        const nextYPos = this.y + GAME_STEP * this.yDir;

        return {
            nextX: nextXPos,
            nextY: nextYPos,
        };
    }
}
