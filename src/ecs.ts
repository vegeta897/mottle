import { World } from 'uecs'
import Game from './game'
import { System } from './systems/system'

// TODO: Switch to bitECS?

export default class ECS {
	world = new World()
	systems: System[] = []
	registerSystems(game: Game) {}
	update(tick: number) {
		this.systems.forEach((system) => system.update(tick))
	}
}
