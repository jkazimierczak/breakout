import { ball, bar } from "@/game/elements.ts";

class GameState {
    livesLeft: number;
    successiveHits: number;
    BAR_INITIAL_X: number;
    BALL_INITIAL_X: number;
    BALL_INITIAL_Y: number;
    paused: boolean;
    barMoveEnabled: boolean;

    constructor() {
        this.livesLeft = 3;
        this.successiveHits = 0;
        this.paused = true;
        this.barMoveEnabled = false;

        this.BALL_INITIAL_X = ball.x1;
        this.BALL_INITIAL_Y = ball.y1;
        this.BAR_INITIAL_X = bar.x1;
    }
}

export default new GameState();
