import gsap from "gsap";
import { EasePack } from "gsap/EasePack";
import { throttle } from "lodash-es";
import "@fontsource/press-start-2p";
import "./style.css";
import { moveBarByKeyboard, moveBarByMouse } from "@/game/movement.ts";
import { gameFinishedScreen, gameOverScreen, startScreen } from "@/game/elements.ts";
import { cleanUpPreviousGame, init, startNewGame } from "@/game/lifecycle.ts";
import { drawGame } from "@/game/mainloop.ts";

gsap.registerPlugin(EasePack);
console.log("Game loaded");

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
