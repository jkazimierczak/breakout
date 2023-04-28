import game from "@/game/state.ts";
import { createAllBlocks, hideNode, showNode, SVGNode } from "@/elements";
import {
    ball,
    bar,
    blocks,
    gameFinishedScreen,
    gameOverScreen,
    startScreen,
    svg,
    topBar,
} from "@/game/elements.ts";
import gsap from "gsap";
import { cycleFill, flicker } from "@/animations.ts";

export function init() {
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

export function startNewGame() {
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

export function finishGame() {
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

export function respawn() {
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

export function cleanUpPreviousGame() {
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
