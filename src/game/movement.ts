import { bar, frame, game } from "@/game/elements.ts";
import state from "@/game/state.ts";

export const moveBarByMouse = (e: MouseEvent) => {
    if (!state.barMoveEnabled) return;
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
export const moveBarByKeyboard = (e: KeyboardEvent) => {
    if (!state.barMoveEnabled) return;
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
