import './style.css'
import Game from './game'
import { addComponent, addEntity } from 'bitecs'
import { Drag, Player, Transform, Velocity } from './ecs/components'
import { Sprite, Texture } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'

const game = Game.shared

const { spriteContainer, viewport } = PixiApp.shared

export const player = addEntity(game.world)
addComponent(game.world, Player, player)
Player.paint[player] = 200
addComponent(game.world, Transform, player)
addComponent(game.world, Velocity, player)
addComponent(game.world, Drag, player)
Drag.rate[player] = 0.3

export const playerSprite = new Sprite(Texture.WHITE)
playerSprite.anchor.x = 0.5
playerSprite.anchor.y = 0.5
playerSprite.tint = 0xff0000
DisplayObjects[player] = playerSprite
spriteContainer.addChild(playerSprite)
viewport.follow(playerSprite)

export function updatePlayerColor() {
	const paintRemaining = Math.min(1, Player.paint[player] / 100)
	const red = 128 + Math.round(paintRemaining * 127)
	const teal = 128 - Math.round(paintRemaining * 127)
	playerSprite.tint = (red << 16) + (teal << 8) + teal
}

game.init()

// TODO: Try Vite?
