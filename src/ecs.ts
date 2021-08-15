import { createWorld, pipe } from 'bitecs'

export default class ECS {
	world = createWorld()
	pipeline = pipe()

	constructor() {
		this.world.time = { delta: 0, elapsed: 0, then: performance.now() }
	}

	update() {
		this.pipeline(this.world)
	}
}
