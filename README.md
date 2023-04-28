# Breakout

An arcade game inspired by Atari Breakout.

https://user-images.githubusercontent.com/77862767/235263834-1001c5ed-22e6-445f-bb4b-250ef33d71a1.mp4

Available live: [https://jkazimierczak.github.io/breakout/](https://jkazimierczak.github.io/breakout/).

## The motivation

This was initially a project for university course - the end goal was to create a game using SVG and JS.

The original game had a few issues that made finishing the game impossible. Now, after receiving a rework:

- The game can be finished.
- The ball bounces off the bar at non-fixed angles (previously it was 45deg).
- Improved collisions and colliding-side detection (this didn’t work).
- Added keyboard controls.
- Added animations (previously these were only on some elements partially).
- Points in game make more sense, as hitting more blocks in succession yields more points.

## How to run

If you want to run this projects on your machine, then:

1. Have node.js and npm installed.
2. Clone this repository / download the archive and unpack.
3. Install dependencies with `npm i`.
4. Run the development server `npm run dev`.

> The game is also available live [on GitHub Pages](https://jkazimierczak.github.io/breakout/).

## Tech stack

The original version was using an SVG with a JS and CSS embedded into it. The SVG is now embedded into a HTML website, while the rest - JS and CSS - was reorganized into adequate files for better maintainability of the code.

### Languages & Dependencies

- TypeScript (replaced JavaScript)
- GSAP
- Lodash (ES tree-shakeable version, used just for throttling mouse events)

### Tools

- Prettier
- Vite
- pnpm
