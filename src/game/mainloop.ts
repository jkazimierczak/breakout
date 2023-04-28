import game from "@/game/state.ts";
import { ball, bar, deathPit, frame } from "@/game/elements.ts";
import { BALL_SPEED } from "@/constants.ts";
import gsap from "gsap";
import { checkBallBlocksCollision, deathPitCollisionHandler } from "@/game/collisions.ts";

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

// Main breakout loop
export const drawGame = () => {
    if (!game.paused) {
        drawBall();
    }

    window.requestAnimationFrame(drawGame);
};
