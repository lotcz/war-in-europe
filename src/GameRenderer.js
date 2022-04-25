import Pixies from "./class/basic/Pixies";

export default class GameRenderer {

	/**
	 * @type GameModel
	 */
	model;

	dom;

	constructor(model, dom) {

		this.model = model;
		this.dom = dom;

		this.onResizeHandler = (event) => this.onResize(event);

		Pixies.destroyElement(document.getElementById('initial_loading'));
	}

	activate() {
		this.wrapper = Pixies.createElement(this.dom, 'div', ['war-in-europe']);
		this.container = Pixies.createElement(this.wrapper, 'div', ['container']);
		this.container.appendChild(this.model.renderer.domElement);

		this.onResize();
		window.addEventListener('resize', this.onResizeHandler);
	}

	deactivate() {
		this.model.renderer.dispose();
		Pixies.destroyElement(this.container);
		window.removeEventListener('resize', this.onResizeHandler);
	}

	render() {
		this.model.composer.render();
		//this.model.renderer.render(this.model.scene, this.model.camera);
	}

	onResize() {
		//console.log(this.dom);
		this.model.onResize(this.wrapper.offsetWidth, this.wrapper.offsetHeight);
	}

}
