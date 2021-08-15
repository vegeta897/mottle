import {
	defineQuery,
	defineSystem,
	hasComponent,
	removeComponent,
} from 'bitecs'
import { MoveTo, Player } from './components'
import { playerSprite } from './index'

const playerQuery = defineQuery([Player])

const MOVE_SPEED = 6 // Pixels per tick

export const playerSystem = defineSystem((world) => {
	for (let eid of playerQuery(world)) {
		if (hasComponent(world, MoveTo, eid)) {
			const delta = {
				x: MoveTo.x[eid] - Player.x[eid],
				y: MoveTo.y[eid] - Player.y[eid],
			}
			const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2)
			if (distance < MOVE_SPEED) {
				Player.x[eid] = MoveTo.x[eid]
				Player.y[eid] = MoveTo.y[eid]
				removeComponent(world, MoveTo, eid)
			} else {
				const tickMove = {
					x: (delta.x / distance) * MOVE_SPEED,
					y: (delta.y / distance) * MOVE_SPEED,
				}
				Player.x[eid] += tickMove.x
				Player.y[eid] += tickMove.y
			}
		}
		playerSprite.x = Player.x[eid]
		playerSprite.y = Player.y[eid]
	}
	return world
})
