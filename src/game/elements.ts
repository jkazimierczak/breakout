import { SVGNode, SVGBar, SVGScreen, SVGText, SVGBall } from "@/elements";

export const game = new SVGNode({ selector: "#game" });
export const ball = new SVGBall({ selector: "#ball" });
export const frame = {
    top: new SVGNode({ selector: "#frame_top" }),
    left: new SVGNode({ selector: "#frame_left" }),
    right: new SVGNode({ selector: "#frame_right" }),
};
export const bar = new SVGBar({ selector: "#bar" });
export const svg = new SVGNode({ selector: "svg" });
export const deathPit = new SVGNode({ selector: "#death_pit" });
export const blocks: [SVGNode?] = [];
// Top bar elements
export const topBar = {
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
export const startScreen = new SVGScreen({ selector: "#start_screen" });
export const gameOverScreen = new SVGScreen({ selector: "#game_over_screen" });
export const gameFinishedScreen = new SVGScreen({ selector: "#game_finished_screen" });
