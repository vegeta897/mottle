import { createWorld, pipe, registerComponents } from 'bitecs'
import {
	areaConstraintSystem,
	dragSystem,
	forceSystem,
	inputSystem,
	paintBucketSystem,
	collisionSystem,
	playerSystem,
	velocitySystem,
	shapeSystem,
	paintSystem,
} from './systems'
import { Force } from './components'
import { cameraSystem, spriteSystem } from './render_systems'

export default class ECS {
	world = createWorld()
	tickPipeline = pipe(
		inputSystem,
		playerSystem,
		paintBucketSystem,
		forceSystem,
		dragSystem,
		velocitySystem,
		areaConstraintSystem,
		collisionSystem,
		shapeSystem,
		paintSystem
	)
	renderPipeline = pipe(spriteSystem, cameraSystem)
	constructor() {
		registerComponents(this.world, [Force])
	}
}
