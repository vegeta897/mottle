import { System } from '../systems/system'
import { Application, Container, Ticker, Graphics } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export const WIDTH = 960
export const HEIGHT = 800
export const DEFAULT_ZOOM = 2

const ballGraphic = new Graphics()
ballGraphic.beginFill(0xff0000)
ballGraphic.drawCircle(0, 0, 12)
ballGraphic.x = WIDTH / 2 / DEFAULT_ZOOM
ballGraphic.y = HEIGHT / 2 / DEFAULT_ZOOM

export class PixiApp {
	systems: System[] = []
	application = new Application({
		width: WIDTH,
		height: HEIGHT,
		backgroundColor: 0xf7ffeb,
		sharedTicker: true,
	})
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
		})
		this.viewport.setZoom(DEFAULT_ZOOM)
		this.stage.addChild(this.viewport)

		this.viewport.addChild(this.spriteContainer)

		this.spriteContainer.addChild(ballGraphic)
	}
	render(tick: number, dt: number) {
		this.systems.forEach((system) => system.update(tick, dt))
		this.application.render()
	}
}
