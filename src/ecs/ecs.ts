import { createWorld, pipe, registerComponents } from 'bitecs'
import {
	cameraSystem,
	dragSystem,
	forceSystem,
	inputSystem,
	pickupSystem,
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
		velocitySystem,
		pickupSystem
	)
	renderPipeline = pipe(cameraSystem)
	constructor() {
		registerComponents(this.world, [Force])
	}
}
