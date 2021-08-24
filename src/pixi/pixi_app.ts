import { Application, Container, Ticker } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export const WIDTH = 1200
export const HEIGHT = 864
export const DEFAULT_ZOOM = 2

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

export class PixiApp {
	private static _shared: PixiApp = new PixiApp()
	application = new Application({
		width: WIDTH,
		height: HEIGHT,
		backgroundColor: 0xf7ffeb,
		sharedTicker: true,
	})
	render = () => this.application.render()
	stage: Container = this.application.stage
	viewport: Viewport
	spriteContainer: Container = new Container()

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
		this.viewport.setZoom(DEFAULT_ZOOM)
		this.stage.addChild(this.viewport)

		this.viewport.addChild(this.spriteContainer)

		// Pixi inspector
		;(window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__?.register({ PIXI: PIXI })
	}

	static get shared() {
		return PixiApp._shared
	}
}
