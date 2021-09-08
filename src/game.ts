import Stats from 'stats.js'
import ECS from './ecs/ecs'
import { PixiApp } from './pixi/pixi_app'

export default class Game {
	private static _shared: Game = new Game()
	ecs = new ECS()
	world = this.ecs.world
	tick = 0
	tickRate = 60
	tickTime = 1000 / this.tickRate
	deltaTime = 0
	paused = false
	interpolate = true

	init() {
		const stats = new Stats()
		document.body.appendChild(stats.dom)

		// Main loop
		let lag = 0
		let lastUpdate = performance.now()
		const update = (now: number) => {
			// Adapted from https://gist.github.com/godwhoa/e6225ae99853aac1f633
			requestAnimationFrame(update)
			if (!this.paused) {
				let delta = now - lastUpdate
				if (delta > 1000) delta = this.tickTime
				lag += delta
				while (lag >= this.tickTime) {
					this.tick++
					this.ecs.tickPipeline(this.world)
					lag -= this.tickTime
				}
			}
			lastUpdate = now
			stats.begin()
			this.deltaTime = lag / this.tickTime
			this.ecs.renderPipeline(this.world)
			PixiApp.shared.viewport.update(this.tickTime)
			PixiApp.shared.render()
			stats.end()
		}
		requestAnimationFrame(update)
	}

	static get shared() {
		return Game._shared
	}
}
