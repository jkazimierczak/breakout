import gsap from "gsap";
import { EasePack, RoughEase } from "gsap/EasePack";
import { hideNode, showNode, SVGNode } from "@/elements/svgnode.ts";
import { throttle } from "lodash-es";
import "@fontsource/press-start-2p";
import { cycleFill, flicker } from "@/animations.ts";
import { createAllBlocks } from "@/elements/blocks.ts";
import { BALL_SPEED } from "@/constants.ts";
import "./style.css";
import { moveBarByKeyboard, moveBarByMouse } from "@/game/movement.ts";
import {
    ball,
    frame,
    bar,
    svg,
    deathPit,
    blocks,
    topBar,
    startScreen,
    gameOverScreen,
    gameFinishedScreen,
} from "@/game/elements.ts";
import game from "@/game/state.ts";

gsap.registerPlugin(EasePack);
console.log("Game loaded");

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
        game.successiveHits = 0;
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
            game.successiveHits++;

            const overlap = block.overlap(ball);

            if (overlap.top || overlap.bottom) {
                ball.switchYDir();
            } else if (overlap.left || overlap.right) {
                ball.switchXDir();
            } else {
                ball.switchXDir();
                ball.switchYDir();
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
            const points = Number(topBar.points.text) + game.successiveHits * 10;
            topBar.points.text = String(Math.round(points));
            if (blocks.length == 0) {
                finishGame();
            }

            return;
        }
    }
}

// Main breakout loop
const drawGame = () => {
    if (!game.paused) {
        drawBall();
    }

    window.requestAnimationFrame(drawGame);
};

function init() {
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
    document.querySelectorAll<HTMLElement>(".block").forEach((block, idx) => {
        blocks.push(new SVGNode({ domNode: block }));

        gsap.fromTo(
            block,
            {
                opacity: 0,
            },
            {
                opacity: 1,
                delay: idx / 100,
            }
        );
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
        game.barMoveEnabled = true;
        game.paused = false;
    }, 500);
}

function finishGame() {
    game.barMoveEnabled = false;
    game.paused = true;
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
    ball.x1 = game.BALL_INITIAL_X;
    ball.y1 = game.BALL_INITIAL_Y;
    ball.initializeWithRandomAngle();

    bar.x1 = game.BAR_INITIAL_X;
    game.livesLeft = 3;

    document.querySelectorAll(".block").forEach((block) => block.remove());
    blocks.splice(0, blocks.length);

    showNode(ball);

    topBar.hearts.forEach((h) => gsap.set(h.node, { attr: { "fill-opacity": 1 } }));
}

function deathPitCollisionHandler() {
    game.barMoveEnabled = false;
    game.paused = true;
    hideNode(ball);

    const heart = topBar.hearts[game.livesLeft - 1];

    gsap.to(heart.node, {
        duration: 0.5,
        attr: { "fill-opacity": 0.5 },
        ease: RoughEase.ease.config({ points: 10, strength: 3, clamp: true }),
    });
    gsap.set(heart.node, { attr: { "fill-opacity": 0 }, delay: 0.5 });

    if (game.livesLeft - 1 === 0) {
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

    game.livesLeft--;
    setTimeout(respawn, 1000);
}

function respawn() {
    showNode(ball);

    bar.x1 = game.BAR_INITIAL_X;
    ball.x1 = game.BALL_INITIAL_X;
    ball.y1 = game.BALL_INITIAL_Y;
    ball.initializeWithRandomAngle();

    setTimeout(() => {
        game.paused = false;
        game.barMoveEnabled = true;
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
