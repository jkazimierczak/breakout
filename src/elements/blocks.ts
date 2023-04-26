import {
    BLOCK_COLORS,
    BLOCK_COUNT,
    BLOCK_HEIGHT,
    BLOCK_ROW_COUNT,
    BLOCK_WIDTH,
} from "../constants.ts";

export const SVGNS = "http://www.w3.org/2000/svg";

function createBlock(x: number, y: number, color = BLOCK_COLORS.DEFAULT) {
    const rect = document.createElementNS(SVGNS, "rect");

    // Position
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(BLOCK_WIDTH));
    rect.setAttribute("height", String(BLOCK_HEIGHT));
    // Styling
    rect.setAttribute("class", "block");
    rect.setAttribute("fill", color);

    return rect;
}

function createBlockRow(index = 0, color = BLOCK_COLORS.DEFAULT) {
    const FIRST_BLOCK_X = 50;
    const FIRST_BLOCK_Y = 90;
    const Y_OFFSET = BLOCK_HEIGHT * index;

    for (let i = 0; i < BLOCK_COUNT; i++) {
        const x = FIRST_BLOCK_X + BLOCK_WIDTH * i;
        const y = FIRST_BLOCK_Y + Y_OFFSET;

        const block = createBlock(x, y, color);
        const game = document.querySelector("#blocks");
        game?.appendChild(block);
    }
}

export function createAllBlocks() {
    const colorCount = Object.keys(BLOCK_COLORS).length - 2;

    for (let i = 0; i < BLOCK_ROW_COUNT; i++) {
        const colorKey = Object.keys(BLOCK_COLORS)[1 + (i % colorCount)];
        createBlockRow(i, BLOCK_COLORS[colorKey]);
    }
}
