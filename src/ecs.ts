import { createWorld, pipe } from 'bitecs'
import { playerSystem } from './systems'

export default class ECS {
	world = createWorld()
	tickPipeline = pipe(playerSystem)
	renderPipeline = pipe()
}
