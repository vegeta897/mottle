import './style.css'
import Game from './game'
import { addComponent, addEntity, hasComponent } from 'bitecs'
import { MoveTo, Player } from './components'
import { Graphics } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'

const game = Game.shared

const player = addEntity(game.world)
addComponent(game.world, Player, player)

const playerSprite = new Graphics()
playerSprite.beginFill(0xff0000)
playerSprite.drawCircle(0, 0, 12)
DisplayObjects[player] = playerSprite
PixiApp.shared.spriteContainer.addChild(playerSprite)
PixiApp.shared.viewport.follow(playerSprite, {
	speed: 8,
	// acceleration: 8,
	radius: 24,
})

PixiApp.shared.viewport.on('mousedown', (evt) => {
	const point = PixiApp.shared.viewport.toLocal(evt.data.global)
	if (!hasComponent(game.world, MoveTo, player)) {
		addComponent(game.world, MoveTo, player)
	}
	MoveTo.x[player] = Math.round(point.x)
	MoveTo.y[player] = Math.round(point.y)
})

game.init()

// TODO: Try Vite?
