import { createWorld, pipe, registerComponents } from 'bitecs'
import {
	areaConstraintSystem,
	cameraSystem,
	dragSystem,
	forceSystem,
	inputSystem,
	pickupSystem,
	playerSystem,
	spriteSystem,
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
		areaConstraintSystem,
		pickupSystem
	)
	renderPipeline = pipe(spriteSystem, cameraSystem)
	constructor() {
		registerComponents(this.world, [Force])
	}
}
