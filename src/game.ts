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
import { SVGBar } from "@/elements/bar.ts";

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
const ball = new SVGBall({ selector: "#ball" });
const frame = {
    top: new SVGNode({ selector: "#frame_top" }),
    left: new SVGNode({ selector: "#frame_left" }),
    right: new SVGNode({ selector: "#frame_right" }),
};
const bar = new SVGBar({ selector: "#bar" });
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
const gameFinishedScreen = new SVGScreen({ selector: "#game_finished_screen" });

// Game functions
function drawBall() {
    // Top frame collision
    if (ball.collidesWith(frame.top)) {
        ball.y1 = frame.top.y1 + frame.top.height;
        ball.switchYDir();
    }
    // Right frame collision
    if (ball.collidesWith(frame.right)) {
        ball.x1 = frame.right.x1 - ball.width;
        ball.switchXDir();
    }
    // Left frame collision
    if (ball.collidesWith(frame.left)) {
        ball.x1 = frame.left.x1 + frame.left.width;
        ball.switchXDir();
    }
    // Bar collision
    if (ball.collidesWith(bar)) {
        ball.y1 = bar.y1 - ball.height;

        // Calculate the point of impact on the bar
        const ballMiddleX = ball.x1 + ball.width / 2;
        const barMiddleX = bar.x1 + bar.width / 2;
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

        gsap.fromTo(bar.node, { attr: { y: bar.y1 + 3 } }, { attr: { y: bar.y1 }, duration: 0.2 });
    }

    ball.x1 += ball.velocity.x;
    ball.y1 += ball.velocity.y;

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

            block.set("opacity", "1");
            const durationMs = 100;
            gsap.to(block.node, {
                duration: durationMs / 1000,
                attr: { opacity: 0 },
                ease: "ease",
            });
            setTimeout(() => block.node.remove(), durationMs);
            blocks.splice(i, 1);

            topBar.blocksLeft.text = String(blocks.length);
            topBar.points.text = String(Number(topBar.points.text) + 1);
            if (blocks.length == 0) {
                finishGame();
            }

            return;
        }
    }
}

const moveBarByMouse = (e: MouseEvent) => {
    if (!barMoveEnabled) return;
    if (!game.node.parentElement) return;

    const svgBoundingRect = game.node.parentElement.getBoundingClientRect();
    const clientX = e.clientX - bar.width / 2 - svgBoundingRect.left;
    const boundLeft = frame.left.width;
    const boundRight = frame.right.x1 - bar.width;

    if (clientX > boundLeft && clientX < boundRight) {
        bar.x1 = clientX;
    }
    // If the mouse moves out of bounds while the event
    // is throttled - set the position to the end
    else if (e.clientX <= svgBoundingRect.left + frame.left.width) {
        bar.x1 = boundLeft;
    } else if (e.clientX >= svgBoundingRect.left + svgBoundingRect.width - frame.right.width) {
        bar.x1 = boundRight;
    }
};

const moveBarByKeyboard = (e: KeyboardEvent) => {
    if (!barMoveEnabled) return;
    if (!game.node.parentElement) return;

    const boundLeft = frame.left.width;
    const boundRight = frame.right.x1 - bar.width;

    if (e.key === "ArrowLeft") {
        bar.setDirectionLeft();
    } else if (e.key === "ArrowRight") {
        bar.setDirectionRight();
    }

    if (bar.x1 + bar.velocity.x <= boundLeft) {
        bar.moveTo(boundLeft);
    } else if (bar.x1 + bar.velocity.x >= boundRight) {
        bar.moveTo(boundRight);
    } else {
        bar.move();
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
    BALL_INITIAL_X = ball.x1;
    BALL_INITIAL_Y = ball.y1;
    BAR_INITIAL_X = bar.x1;

    hideNode(ball);
    hideNode(bar);
    hideNode(gameOverScreen);
    hideNode(gameFinishedScreen);
    showNode(topBar.overlay);

    gsap.set(startScreen.btn, { attr: { "fill-opacity": 1 } });
    gsap.set(gameOverScreen.btn, { attr: { "fill-opacity": 1 } });
    gsap.set(gameFinishedScreen.btn, { attr: { "fill-opacity": 1 } });
    // Start animations
    gsap.to(startScreen.btn, cycleFill);
    gsap.to(gameOverScreen.btn, {
        ...cycleFill,
        delay: 0.75,
    });
    gsap.to(gameFinishedScreen.btn, {
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

    svg.node.style.cursor = "none";

    topBar.points.text = String(0);
    topBar.blocksLeft.text = String(blocks.length);

    showNode(ball);
    showNode(bar);
    hideNode(startScreen);
    hideNode(gameOverScreen);
    hideNode(gameFinishedScreen);
    hideNode(topBar.overlay);

    gsap.from(ball.node, flicker);

    setTimeout(() => {
        barMoveEnabled = true;
        paused = false;
    }, 500);
}

function finishGame() {
    barMoveEnabled = false;
    paused = true;
    hideNode(ball);

    showNode(gameFinishedScreen);
    gameFinishedScreen.set("opacity", "0");
    gsap.to(gameFinishedScreen.node, {
        duration: 1,
        attr: { opacity: 1 },
        ease: "ease",
    });
}

function cleanUpPreviousGame() {
    ball.x1 = BALL_INITIAL_X;
    ball.y1 = BALL_INITIAL_Y;
    ball.initializeWithRandomAngle();

    bar.x1 = BAR_INITIAL_X;
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
        svg.node.style.cursor = "auto";

        showNode(gameOverScreen);
        gameOverScreen.set("opacity", "0");
        gsap.to(gameOverScreen.node, {
            duration: 1,
            attr: { opacity: 1 },
            ease: "ease",
        });

        return;
    }

    livesLeft--;
    setTimeout(respawn, 1000);
}

function respawn() {
    showNode(ball);

    bar.x1 = BAR_INITIAL_X;
    ball.x1 = BALL_INITIAL_X;
    ball.y1 = BALL_INITIAL_Y;
    ball.initializeWithRandomAngle();

    setTimeout(() => {
        paused = false;
        barMoveEnabled = true;
    }, 500);

    gsap.from(ball.node, flicker);
}

document.addEventListener("DOMContentLoaded", () => {
    init();

    document.addEventListener("mousemove", throttle(moveBarByMouse, 10));
    document.addEventListener("keydown", moveBarByKeyboard);

    startScreen.btn.addEventListener("click", () => {
        startNewGame();
    });

    gameOverScreen.btn.addEventListener("click", () => {
        cleanUpPreviousGame();
        startNewGame();
    });

    gameFinishedScreen.btn.addEventListener("click", () => {
        cleanUpPreviousGame();
        startNewGame();
    });

    window.requestAnimationFrame(drawGame);
});
