import { World } from 'uecs'
import Game from '../game'

export abstract class System {
	game: Game
	world: World

	constructor(game: Game) {
		this.game = game
		this.world = game.world
	}

	abstract update(tick?: number, dt?: number): void
}
