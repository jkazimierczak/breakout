import gsap from "gsap";
import { EasePack, RoughEase } from "gsap/EasePack";
import { SVGNode } from "./elements/svgnode.ts";
import throttle from "lodash/throttle";
import "@fontsource/press-start-2p";
import { cycleFill, flicker } from "./animations.ts";
import {
    BALL_DIR_X_LEFT,
    BALL_DIR_X_RIGHT,
    BALL_INITIAL_X_DIR,
    BALL_INITIAL_Y_DIR,
} from "./constants.ts";
import { SVGBall } from "./elements/ball.ts";
import { SVGText } from "./elements/text.ts";
import { SVGScreen } from "./elements/screen.ts";
import { createAllBlocks } from "./elements/blocks.ts";

console.log("Game loaded");
gsap.registerPlugin(EasePack);

// Game variables
let livesLeft = 3;
let BAR_INITIAL_X: number;
let BALL_INITIAL_X: number;
let BALL_INITIAL_Y: number;
let paused = true;
let barMoveEnabled = false;

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
const blocks: [SVGNode?] = [];
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

function checkBallBlocksCollision() {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (!block) return;

        if (ball.collidesWith(block)) {
            block.node.remove();
            blocks.splice(i, 1);

            topBar.blocksLeft.text = String(blocks.length);
            topBar.points.text = String(Number(topBar.points.text) + 1);

            ball.switchYDir();
            ball.switchXDir();

            return;
        }
    }
}

const moveBar = (e: MouseEvent) => {
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
function hideNode(node: SVGNode) {
    node.set("display", "none");
}

function showNode(node: SVGNode) {
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
    document.querySelectorAll<HTMLElement>(".block").forEach((block) => {
        blocks.push(new SVGNode({ domNode: block }));
    });

    showNode(startScreen);

    // svg.node.style.cursor = "none";

    topBar.points.text = String(0);
    topBar.blocksLeft.text = String(blocks.length);

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

    startScreen.btn.addEventListener("click", () => {
        startNewGame();
    });

    gameOverScreen.btn.addEventListener("click", () => {
        cleanUpPreviousGame();
        startNewGame();
    });

    window.requestAnimationFrame(drawGame);
});
