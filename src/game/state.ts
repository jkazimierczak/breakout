import { ball, bar } from "@/game/elements.ts";

class GameState {
    private readonly initialLives;
    private readonly BAR_INITIAL_X: number;
    private readonly BALL_INITIAL_X: number;
    private readonly BALL_INITIAL_Y: number;

    livesLeft: number;
    successiveHits: number;
    paused: boolean;
    barMoveEnabled: boolean;

    constructor() {
        this.initialLives = 3;
        this.livesLeft = this.initialLives;
        this.successiveHits = 0;
        this.paused = true;
        this.barMoveEnabled = false;

        this.BALL_INITIAL_X = ball.x1;
        this.BALL_INITIAL_Y = ball.y1;
        this.BAR_INITIAL_X = bar.x1;
    }

    /**
     * Reset ball and bar to their original positions.
     */
    resetPositions() {
        ball.x1 = this.BALL_INITIAL_X;
        ball.y1 = this.BALL_INITIAL_Y;
        bar.x1 = this.BAR_INITIAL_X;
    }

    /**
     * Restore game's state to initial values.
     */
    resetState() {
        this.livesLeft = this.initialLives;
        this.successiveHits = 0;

        this.resetPositions();
    }
}

export default new GameState();
