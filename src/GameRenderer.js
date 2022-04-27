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
		this.onGroupSelectedHandler = (group) => this.groupSelected(group);
		this.onButtonClickHandler = () => this.model.triggerEvent('start');

		Pixies.destroyElement(document.getElementById('initial_loading'));

	}

	activate() {
		this.wrapper = Pixies.createElement(this.dom, 'div', ['war-in-europe']);
		this.container = Pixies.createElement(this.wrapper, 'div', ['container']);
		this.container.appendChild(this.model.renderer.domElement);

		this.credits = Pixies.createElement(this.container, 'div', 'credits');
		this.name = Pixies.createElement(this.credits, 'h1');
		this.name.innerText = 'War in Europe 2022';
		this.description = Pixies.createElement(this.credits, 'div');
		this.description.innerHTML = 'Modern warfare simulator by <strong>anthropoid404</strong>.';

		this.opening = Pixies.createElement(this.container, 'div', 'opening');
		this.inner = Pixies.createElement(this.opening, 'div');
		this.button = Pixies.createElement(this.opening, 'button');
		this.button.addEventListener('click', this.onButtonClickHandler);

		this.onResize();
		window.addEventListener('resize', this.onResizeHandler);
		this.model.addEventListener('selected', this.onGroupSelectedHandler);
	}

	deactivate() {
		this.button.removeEventListener('click',  this.onButtonClickHandler);
		this.model.renderer.dispose();
		Pixies.destroyElement(this.container);
		window.removeEventListener('resize', this.onResizeHandler);
		this.model.removeEventListener('selected', this.onGroupSelectedHandler);
	}

	render() {
		this.model.composer.render();
		if (this.opening) {
			if (this.model.openingOpacity > 0) {
				this.opening.style.opacity = this.model.openingOpacity;
			} else {
				Pixies.destroyElement(this.opening);
				this.opening = null;
			}
		}
		if (this.model.finishedTheGame) {
			this.credits.style.opacity = this.model.creditsOpacity;
			this.credits.style.top = this.model.creditsTop + 'px';
		}
	}

	onResize() {
		//console.log(this.dom);
		this.model.onResize(this.wrapper.offsetWidth, this.wrapper.offsetHeight);
	}

	groupSelected(group) {
		if (group && group === this.model.activeGroup) {
			this.dom.style.cursor = 'pointer';
		} else {
			this.dom.style.cursor = 'default';
		}
	}

}
