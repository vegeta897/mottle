import { defineQuery, defineSystem } from 'bitecs'
import { Player } from './components'
import { playerSprite } from './index'
import Game from './game'

const playerQuery = defineQuery([Player])

let moveX = 2

export const playerSystem = defineSystem((world) => {
	for (let eid of playerQuery(world)) {
		if (Math.floor(Game.shared.tick / 100) % 2) continue
		if (Game.shared.tick % 200 === 0) moveX *= -1
		Player.x[eid] += moveX
		playerSprite.x = Player.x[eid]
		playerSprite.y = Player.y[eid]
	}
	return world
})
