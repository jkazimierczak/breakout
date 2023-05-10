import { ball, blocks, gameOverScreen, svg, topBar } from "@/game/elements.ts";
import game from "@/game/state.ts";
import gsap from "gsap";
import { finishGame, respawn } from "@/game/lifecycle.ts";
import { hideNode, showNode } from "@/elements";
import { RoughEase } from "gsap/EasePack";

export function checkBallBlocksCollision() {
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

export function deathPitCollisionHandler() {
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
    game.successiveHits = 0;
    setTimeout(respawn, 1000);
}
