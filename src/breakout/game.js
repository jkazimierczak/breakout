import gsap from "gsap";
import {EasePack, RoughEase} from "gsap/EasePack";
import {SVGNode} from "./svgnode.js";
import throttle from "lodash/throttle";
import "@fontsource/press-start-2p";

console.log("Game loaded");
gsap.registerPlugin(EasePack);

const SVGNS = "http://www.w3.org/2000/svg";

// Game constants
const BALL_DIR_Y_UP = -1;
const BALL_DIR_Y_DOWN = 1;
const BALL_DIR_X_RIGHT = 1;
const BALL_DIR_X_LEFT = -1;
const BALL_INITIAL_X_DIR = BALL_DIR_X_RIGHT;
const BALL_INITIAL_Y_DIR = BALL_DIR_Y_DOWN;
const GAME_STEP = 5;

// Constants (do not change)
const BLOCK_WIDTH = 70;
const BLOCK_HEIGHT = 30;
const BLOCK_COUNT = 10;
const BLOCK_COLORS = {
    WHITE: "#cccccc",
    RED: "#ff5d5d",
    ORANGE: "#fdaf68",
    YELLOW: "#ffd25d",
    GREEN: "#86ffa8",
    BLUE: "#87c5fe",
    DEFAULT: ""
};
BLOCK_COLORS.DEFAULT = BLOCK_COLORS.WHITE;
const BLOCK_ROW_COUNT = 5;

// Game variables
let livesLeft = 3;
let BAR_INITIAL_X = null;
let BALL_INITIAL_X = null;
let BALL_INITIAL_Y = null;
let paused = true;
let barMoveEnabled = false;

// Animation constants
const cycleFill = {
    attr: {
        "fill-opacity": 0,
    },
    duration: 0.75,
    ease: "none",
    repeat: -1,
    repeatDelay: 0.5,
    yoyo: true,
};
const flicker = {
    duration: 0.5,
    opacity: 0,
    ease: RoughEase.ease.config({ points: 30, strength: 3, clamp: true }),
};

class SVGBall extends SVGNode {
    constructor(obj, xDir, yDir) {
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

class SVGText extends SVGNode {
    constructor(obj) {
        super(obj);
        this.tspan = this.node.querySelector("tspan");

        if (!this.tspan) {
            throw "tspan not found.";
        }
    }

    set text(text) {
        this.tspan.textContent = text;
    }

    get text() {
        return this.tspan.textContent;
    }
}

class SVGScreen extends SVGNode {
    constructor(obj) {
        super(obj);
        this.btn = this.node.querySelector(".btn");

        if (!this.btn) {
            throw "The screen has no button.";
        }
    }
}

// SVG elements
const ball = new SVGBall({ selector: "#ball" }, BALL_INITIAL_X_DIR, BALL_INITIAL_Y_DIR);
const frame = {
    top: new SVGNode({ selector: "#frame_top" }),
    left: new SVGNode({ selector: "#frame_left" }),
    right: new SVGNode({ selector: "#frame_right" }),
};
const bar = new SVGNode({ selector: "#bar" });
const svg = new SVGNode({ selector: "svg" });
const deathPit = new SVGNode({ selector: "#death_pit" });
const blocks = [];
// Top bar elements
const topBar = {
    overlay: new SVGNode({ selector: "#topBarOverlay" }),
    points: new SVGText({ selector: "#points" }),
    blocksLeft: new SVGText({ selector: "#blocksLeft" }),
    hearts: [
        new SVGNode({ selector: "#heart_1" }),
        new SVGNode({ selector: "#heart_2" }),
        new SVGNode({ selector: "#heart_3" }),
    ],
};
// Screens
const startScreen = new SVGScreen({ selector: "#start_screen" });
const gameOverScreen = new SVGScreen({ selector: "#game_over_screen" });

// Game functions
function createBlock(x, y, color = BLOCK_COLORS.DEFAULT) {
    const rect = document.createElementNS(SVGNS, "rect");

    // Position
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", BLOCK_WIDTH);
    rect.setAttribute("height", BLOCK_HEIGHT);
    // Styling
    rect.setAttribute("class", "block");
    rect.setAttribute("fill", color);

    return rect;
}

function createBlockRow(index = 0, color = BLOCK_COLORS.DEFAULT) {
    const FIRST_BLOCK_X = 50;
    const FIRST_BLOCK_Y = 90;
    const Y_OFFSET = BLOCK_HEIGHT * index;

    for (let i = 0; i < BLOCK_COUNT; i++) {
        const x = FIRST_BLOCK_X + BLOCK_WIDTH * i;
        const y = FIRST_BLOCK_Y + Y_OFFSET;

        const block = createBlock(x, y, color);
        const game = document.querySelector("#blocks");
        game.appendChild(block);
    }
}

function createAllBlocks() {
    const colorCount = Object.keys(BLOCK_COLORS).length - 2;

    for (let i = 0; i < BLOCK_ROW_COUNT; i++) {
        const colorKey = Object.keys(BLOCK_COLORS)[1 + (i % colorCount)];
        createBlockRow(i, BLOCK_COLORS[colorKey]);
    }
}

function drawBall() {
    const { nextX, nextY } = ball.nextPos();
    ball.x = nextX;
    ball.y = nextY;

    // Top frame collision
    if (ball.collidesWith(frame.top)) {
        ball.switchYDir();
    }
    // Right frame collision
    else if (ball.collidesWith(frame.right)) {
        ball.switchXDir();
    }
    // Left frame collision
    else if (ball.collidesWith(frame.left)) {
        ball.switchXDir();
    }
    // Bar collision
    else if (ball.collidesWith(bar)) {
        ball.switchYDir();

        // Switch direction depending on the side the bar was hit
        const barMid = bar.x + bar.width / 2;
        if (ball.x < barMid) {
            ball.xDir = BALL_DIR_X_LEFT;
        } else {
            ball.xDir = BALL_DIR_X_RIGHT;
        }
    }
    // Bottom edge collision
    else if (ball.collidesWith(deathPit)) {
        deathPitCollisionHandler();
    }
    // Blocks collision
    checkBallBlocksCollision();
}

function checkBallBlocksCollision(distance) {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (ball.collidesWith(block)) {
            block.node.remove();
            blocks.splice(i, 1);

            topBar.blocksLeft.text = blocks.length;
            topBar.points.text = Number(topBar.points.text) + 1;

            ball.switchYDir();
            ball.switchXDir();

            return;
        }
    }
}

const moveBar = (e) => {
    if (!barMoveEnabled) return;

    const bar_w = bar.width;
    const clientX = e.clientX - bar_w / 2;
    const boundLeft = frame.left.width;
    const boundRight = frame.right.x - bar_w;

    if (clientX > boundLeft && clientX < boundRight) {
        bar.x = clientX;
    }
    // If the mouse moves out of bounds while the event
    // is throttled - set the position to the end
    else if (clientX <= boundLeft) {
        bar.x = boundLeft;
    } else if (clientX >= boundRight) {
        bar.x = boundRight;
    }
};

// Helpers
function hideNode(node) {
    node.set("display", "none");
}

function showNode(node) {
    node.set("display", "block");
}

// Main breakout loop
const drawGame = () => {
    if (!paused) {
        drawBall();
    }

    window.requestAnimationFrame(drawGame);
};

function init() {
    BALL_INITIAL_X = ball.x;
    BALL_INITIAL_Y = ball.y;
    BAR_INITIAL_X = bar.x;

    hideNode(ball);
    hideNode(bar);
    hideNode(gameOverScreen);
    showNode(topBar.overlay);

    gsap.set(startScreen.btn, { attr: { "fill-opacity": 1 } });
    gsap.set(gameOverScreen.btn, { attr: { "fill-opacity": 1 } });
    // Start animations
    gsap.to(startScreen.btn, cycleFill);
    gsap.to(gameOverScreen.btn, {
        ...cycleFill,
        delay: 0.75,
    });
}

function startNewGame() {
    createAllBlocks();
    // Add all blocks to breakout elements
    document.querySelectorAll(".block").forEach((block) => {
        blocks.push(new SVGNode({ domNode: block }));
    });

    showNode(startScreen);

    // svg.node.style.cursor = "none";

    topBar.points.text = 0;
    topBar.blocksLeft.text = blocks.length;

    showNode(ball);
    showNode(bar);
    hideNode(startScreen);
    hideNode(gameOverScreen);
    hideNode(topBar.overlay);

    gsap.from(ball.node, flicker);

    setTimeout(() => {
        barMoveEnabled = true;
        paused = false;
    }, 500);
}

function cleanUpPreviousGame() {
    ball.x = BALL_INITIAL_X;
    ball.y = BALL_INITIAL_Y;
    ball.xDir = BALL_INITIAL_X_DIR;
    ball.yDir = BALL_INITIAL_Y_DIR;

    bar.x = BAR_INITIAL_X;
    livesLeft = 3;

    document.querySelectorAll(".block").forEach((block) => block.remove());
    blocks.splice(0, blocks.length);

    showNode(ball);

    topBar.hearts.forEach((h) => gsap.set(h.node, { attr: { "fill-opacity": 1 } }));
}

function deathPitCollisionHandler() {
    barMoveEnabled = false;
    paused = true;
    hideNode(ball);

    const heart = topBar.hearts[livesLeft - 1];

    gsap.to(heart.node, {
        duration: 0.5,
        attr: { "fill-opacity": 0.5 },
        ease: RoughEase.ease.config({ points: 10, strength: 3, clamp: true }),
    });
    gsap.set(heart.node, { attr: { "fill-opacity": 0 }, delay: 0.5 });

    if (livesLeft - 1 === 0) {
        setTimeout(() => showNode(gameOverScreen), 500);
        svg.node.style.cursor = "pointer";
        return;
    }

    livesLeft--;
    setTimeout(respawn, 1000);
}

function respawn() {
    showNode(ball);

    bar.x = BAR_INITIAL_X;
    ball.x = BALL_INITIAL_X;
    ball.y = BALL_INITIAL_Y;
    ball.xDir = BALL_INITIAL_X_DIR;
    ball.yDir = BALL_INITIAL_Y_DIR;

    setTimeout(() => {
        paused = false;
        barMoveEnabled = true;
    }, 500);

    gsap.from(ball.node, flicker);
}

document.addEventListener("DOMContentLoaded", () => {
    init();

    const moveBarThrottled = throttle(moveBar, 10);
    document.addEventListener("mousemove", moveBarThrottled);

    startScreen.btn.addEventListener("click", (e) => {
        startNewGame();
    });

    gameOverScreen.btn.addEventListener("click", (e) => {
        cleanUpPreviousGame();
        startNewGame();
    });

    window.requestAnimationFrame(drawGame);
});
