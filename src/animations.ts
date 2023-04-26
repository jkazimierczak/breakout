import { RoughEase } from "gsap/EasePack";

export const cycleFill = {
    attr: {
        "fill-opacity": 0,
    },
    duration: 0.75,
    ease: "none",
    repeat: -1,
    repeatDelay: 0.5,
    yoyo: true,
};
export const flicker = {
    duration: 0.5,
    opacity: 0,
    ease: RoughEase.ease.config({ points: 30, strength: 3, clamp: true }),
};
