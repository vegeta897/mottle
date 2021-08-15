import {
	defineQuery,
	defineSystem,
	hasComponent,
	removeComponent,
} from 'bitecs'
import { MoveTo, Player } from './components'
import { Vector2 } from './util'
import { DisplayObjects } from './pixi/object_manager'

const playerQuery = defineQuery([Player])

const MOVE_SPEED = 6 // Pixels per tick

export const playerSystem = defineSystem((world) => {
	for (let eid of playerQuery(world)) {
		if (hasComponent(world, MoveTo, eid)) {
			const delta = {
				x: MoveTo.x[eid] - Player.x[eid],
				y: MoveTo.y[eid] - Player.y[eid],
			}
			const distance = Vector2.getMagnitude(delta)
			if (distance < MOVE_SPEED) {
				// Finished moving
				Player.x[eid] = MoveTo.x[eid]
				Player.y[eid] = MoveTo.y[eid]
				removeComponent(world, MoveTo, eid)
			} else {
				// Move toward point
				const tickMove = Vector2.normalize(delta, distance, MOVE_SPEED)
				Player.x[eid] += tickMove.x
				Player.y[eid] += tickMove.y
			}
		}
		const displayObject = DisplayObjects[eid]
		displayObject.x = Player.x[eid]
		displayObject.y = Player.y[eid]
	}
	return world
})
