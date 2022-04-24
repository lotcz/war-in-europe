import "./style.css";

import GameController from "./GameController";
import GameModel from "./GameModel";
import GameRenderer from "./GameRenderer";

const MAX_DELTA = 500;
const DEBUG_MASTER = true;

const dom = window.document.body;
const game = new GameModel();

const controller = new GameController(game, dom);
controller.activate();

const renderer = new GameRenderer(game, dom);
renderer.activate();

if (DEBUG_MASTER) {
	window['game'] = game;
}

let lastTime = null;

const updateLoop = function () {
	const time = performance.now();
	if (!lastTime) lastTime = time;
	const delta = (time - lastTime);
	lastTime = time;

	if (delta < MAX_DELTA)
	{
		controller.update(delta);
		renderer.render();
	} else {
		console.log(`Waited for ${Math.round(delta/500)/2} s and skipped frame rendering.`);
	}
	requestAnimationFrame(updateLoop);
}

requestAnimationFrame(updateLoop);
