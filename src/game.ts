import Stats from 'stats.js'

export default class Game {
	tick = 0
	static TickRate = 60
	static TickTime = 1000 / Game.TickRate
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
				if (delta > 1000) delta = Game.TickTime
				lag += delta
				while (lag >= Game.TickTime) {
					// this.ecs.update(++this.tick)
					lag -= Game.TickTime
				}
			}
			lastUpdate = now
			stats.begin()
			// this.threeApp.render(this.tick, lag / Game.TickTime)
			stats.end()
		}
		update()
	}
}
