import { Application, Container, Ticker } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export const WIDTH = 960
export const HEIGHT = 800
export const DEFAULT_ZOOM = 2

export class PixiApp {
	private static _shared: PixiApp = new PixiApp()
	application = new Application({
		width: WIDTH,
		height: HEIGHT,
		backgroundColor: 0xf7ffeb,
		sharedTicker: true,
	})
	render = this.application.render.bind(this.application)
	stage = this.application.stage
	viewport: Viewport
	spriteContainer = new Container()

	constructor() {
		// Do not use PIXI's ticker
		Ticker.shared.autoStart = false
		Ticker.shared.stop()

		// Add app view canvas to page
		this.application.view.id = 'viewport'
		document.body.appendChild(this.application.view)

		// Create viewport
		this.viewport = new Viewport({
			screenWidth: this.application.view.width,
			screenHeight: this.application.view.height,
			noTicker: true,
		})
		this.viewport.moveCenter(0, 0)
		this.viewport.setZoom(DEFAULT_ZOOM)
		this.stage.addChild(this.viewport)

		this.viewport.addChild(this.spriteContainer)
	}

	static get shared() {
		return PixiApp._shared
	}
}
