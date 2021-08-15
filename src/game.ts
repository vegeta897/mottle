import Stats from 'stats.js'
import ECS from './ecs'
import { PixiApp } from './pixi/pixi_app'

export default class Game {
	private static _shared: Game = new Game()
	ecs = new ECS()
	world = this.ecs.world
	tick = 0
	tickRate = 60
	tickTime = 1000 / this.tickRate
	paused = false
	interpolate = true
	async init() {
		const stats = new Stats()
		document.body.appendChild(stats.dom)

		// Main loop
		let lag = 0
		let lastUpdate = performance.now()
		const update = () => {
			// Adapted from https://gist.github.com/godwhoa/e6225ae99853aac1f633
			requestAnimationFrame(update)
			const now = performance.now()
			if (!this.paused) {
				let delta = now - lastUpdate
				if (delta > 1000) delta = this.tickTime
				lag += delta
				while (lag >= this.tickTime) {
					this.ecs.update(++this.tick)
					lag -= this.tickTime
				}
			}
			lastUpdate = now
			stats.begin()
			PixiApp.shared.render(this.tick, lag / this.tickTime)
			stats.end()
		}
		update()
	}
	static get shared() {
		return Game._shared
	}
}
