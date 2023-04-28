import gsap from "gsap";
import { EasePack, RoughEase } from "gsap/EasePack";
import { hideNode, showNode, SVGNode } from "@/elements/svgnode.ts";
import throttle from "lodash/throttle";
import "@fontsource/press-start-2p";
import { cycleFill, flicker } from "@/animations.ts";
import { SVGBall } from "@/elements/ball.ts";
import { SVGText } from "@/elements/text.ts";
import { SVGScreen } from "@/elements/screen.ts";
import { createAllBlocks } from "@/elements/blocks.ts";
import { BALL_SPEED } from "@/constants.ts";
import "./style.css";

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
const game = new SVGNode({ selector: "#game" });
const ball = new SVGBall({ selector: "#ball" }, 90);
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
    // Top frame collision
    if (ball.collidesWith(frame.top)) {
        ball.y = frame.top.y + frame.top.height;
        ball.switchYDir();
    }
    // Right frame collision
    if (ball.collidesWith(frame.right)) {
        ball.x = frame.right.x - ball.width;
        ball.switchXDir();
    }
    // Left frame collision
    if (ball.collidesWith(frame.left)) {
        ball.x = frame.left.x + frame.left.width;
        ball.switchXDir();
    }
    // Bar collision
    if (ball.collidesWith(bar)) {
        ball.y = bar.y - ball.height;

        // Calculate the point of impact on the bar
        const ballMiddleX = ball.x + ball.width / 2;
        const barMiddleX = bar.x + bar.width / 2;
        const diff = ballMiddleX - barMiddleX;

        if (diff === 0) {
            // hit the middle of the bar
            ball.switchYDir();
        } else {
            // hit the edge or between the edge and the middle of the bar
            const maxAngle = 90 * (Math.PI / 180);
            const minAngle = 20 * (Math.PI / 180);
            const angleDiff = Math.abs(diff) / (bar.width / 2);
            const newAngle = maxAngle + angleDiff * (minAngle - maxAngle);

            if (diff < 0) {
                ball.velocity.x = -BALL_SPEED * Math.cos(newAngle);
                ball.velocity.y = -BALL_SPEED * Math.sin(newAngle);
            } else {
                ball.velocity.x = BALL_SPEED * Math.cos(newAngle);
                ball.velocity.y = -BALL_SPEED * Math.sin(newAngle);
            }
        }
    }

    ball.x += ball.velocity.x;
    ball.y += ball.velocity.y;

    // Bottom edge collision
    if (ball.collidesWith(deathPit)) {
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
            ball.switchYDir();

            const overlap = block.overlap(ball);
            if (overlap.left || overlap.right) {
                ball.switchXDir();
            }

            block.node.remove();
            blocks.splice(i, 1);

            topBar.blocksLeft.text = String(blocks.length);
            topBar.points.text = String(Number(topBar.points.text) + 1);

            return;
        }
    }
}

const moveBar = (e: MouseEvent) => {
    if (!barMoveEnabled) return;
    if (!game.node.parentElement) return;

    const svgBoundingRect = game.node.parentElement.getBoundingClientRect();
    const clientX = e.clientX - bar.width / 2 - svgBoundingRect.left;
    const boundLeft = frame.left.width;
    const boundRight = frame.right.x - bar.width;

    if (clientX > boundLeft && clientX < boundRight) {
        bar.x = clientX;
    }
    // If the mouse moves out of bounds while the event
    // is throttled - set the position to the end
    else if (e.clientX <= svgBoundingRect.left + frame.left.width) {
        bar.x = boundLeft;
    } else if (e.clientX >= svgBoundingRect.left + svgBoundingRect.width - frame.right.width) {
        bar.x = boundRight;
    }
};

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
    ball.restore();

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
    ball.restore();

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
