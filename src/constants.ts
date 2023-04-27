// Game constants
export const BALL_DIR_Y_UP = -1;
export const BALL_DIR_Y_DOWN = 1;
export const BALL_DIR_X_RIGHT = 1;
export const BALL_DIR_X_LEFT = -1;
export const BALL_INITIAL_X_DIR = BALL_DIR_X_RIGHT;
export const BALL_INITIAL_Y_DIR = BALL_DIR_Y_DOWN;
export const BALL_SPEED = 6;
// Constants (do not change)
export const BLOCK_WIDTH = 70;
export const BLOCK_HEIGHT = 30;
export const BLOCK_COUNT = 10;
export const BLOCK_COLORS: Record<string, string> = {
    WHITE: "#cccccc",
    RED: "#ff5d5d",
    ORANGE: "#fdaf68",
    YELLOW: "#ffd25d",
    GREEN: "#86ffa8",
    BLUE: "#87c5fe",
    DEFAULT: "",
};
BLOCK_COLORS.DEFAULT = BLOCK_COLORS.WHITE;
export const BLOCK_ROW_COUNT = 5;
