import { createWorld, pipe, registerComponents } from 'bitecs'
import {
	areaConstraintSystem,
	dragSystem,
	forceSystem,
	inputSystem,
	playerSystem,
	velocitySystem,
	shapeSystem,
	scrollSystem,
} from './systems'
import { Force } from './components'
import { cameraSystem, spriteSystem } from './render_systems'

export default class ECS {
	world = createWorld()
	tickPipeline = pipe(
		scrollSystem,
		inputSystem,
		playerSystem,
		forceSystem,
		velocitySystem,
		dragSystem,
		areaConstraintSystem,
		shapeSystem
	)
	renderPipeline = pipe(spriteSystem, cameraSystem)
	constructor() {
		registerComponents(this.world, [Force])
	}
}
