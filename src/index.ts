import './style.css'
import Game from './game'
import { addComponent, addEntity } from 'bitecs'
import { Player } from './components'
import { Graphics } from 'pixi.js'
import { DEFAULT_ZOOM, HEIGHT, PixiApp, WIDTH } from './pixi/pixi_app'

const game = Game.shared

const player = addEntity(game.world)
addComponent(game.world, Player, player)

export const playerSprite = new Graphics()
playerSprite.beginFill(0xff0000)
playerSprite.drawCircle(0, 0, 12)
playerSprite.x = WIDTH / 2 / DEFAULT_ZOOM
playerSprite.y = HEIGHT / 2 / DEFAULT_ZOOM
PixiApp.shared.spriteContainer.addChild(playerSprite)
PixiApp.shared.viewport.follow(playerSprite, {
	speed: 8,
	// acceleration: 8,
	radius: 24,
})

game.init()

// TODO: Try Vite?
