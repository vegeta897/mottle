import './style.css'
import Game from './game'
import { addComponent, addEntity } from 'bitecs'
import { Drag, Player, Velocity } from './components'
import { Graphics } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'

const game = Game.shared

const { spriteContainer, viewport } = PixiApp.shared

const player = addEntity(game.world)
addComponent(game.world, Player, player)
addComponent(game.world, Velocity, player)
addComponent(game.world, Drag, player)
Drag.rate[player] = 0.3

const playerSprite = new Graphics()
playerSprite.beginFill(0xff0000)
playerSprite.drawCircle(0, 0, 12)
DisplayObjects[player] = playerSprite
spriteContainer.addChild(playerSprite)
viewport.follow(playerSprite, {
	speed: 8,
	radius: 48,
})

game.init()

// TODO: Try Vite?
