import { createWorld, pipe, registerComponents } from 'bitecs'
import {
	dragSystem,
	forceSystem,
	inputSystem,
	playerSystem,
	velocitySystem,
} from './systems'
import { Force } from './components'

export default class ECS {
	world = createWorld()
	tickPipeline = pipe(
		inputSystem,
		playerSystem,
		forceSystem,
		dragSystem,
		velocitySystem
	)
	renderPipeline = pipe()
	constructor() {
		registerComponents(this.world, [Force])
	}
}
