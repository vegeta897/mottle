import { Application, Container, Ticker } from 'pixi.js'
// import { Point } from '@pixi/math'
import * as PIXI from 'pixi.js'
// import { Viewport } from 'pixi-viewport'

//TODO: Use https://pixijs.io/customize/

export const SCREEN_WIDTH = 600
export const SCREEN_HEIGHT = 432
export const RENDER_SCALE = 2

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

export class PixiApp {
	private static _shared: PixiApp = new PixiApp()
	application = new Application({
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		backgroundColor: 0xf7ffeb,
		sharedTicker: true,
	})
	render = () => this.application.render()
	stage: Container = this.application.stage
	// viewport: Viewport
	spriteContainer: Container = new Container()

	constructor() {
		// Do not use PIXI's ticker
		Ticker.shared.autoStart = false
		Ticker.shared.stop()

		// Configure and add app view canvas to page
		this.application.view.id = 'viewport'
		this.application.view.style.width = SCREEN_WIDTH * RENDER_SCALE + 'px'
		this.application.view.style.height = SCREEN_HEIGHT * RENDER_SCALE + 'px'
		document.body.appendChild(this.application.view)

		// // Create viewport
		// this.viewport = new Viewport({
		// 	screenWidth: this.application.view.width,
		// 	screenHeight: this.application.view.height,
		// 	// worldWidth: 4080,
		// 	// worldHeight: 264,
		// 	noTicker: true,
		// })
		// this.viewport.moveCenter(<Point>{ x: 0, y: 0 })
		// this.stage.addChild(this.viewport)
		//
		this.stage.addChild(this.spriteContainer)
		this.stage.x = SCREEN_WIDTH / 2
		this.stage.y = SCREEN_HEIGHT / 2

		// Pixi inspector
		;(window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__?.register({ PIXI: PIXI })
	}

	static get shared() {
		return PixiApp._shared
	}
	toLocal({ x, y }: { x: number; y: number }) {
		return { x: x - this.stage.x, y: y - this.stage.y }
	}
}
