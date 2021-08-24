import './style.css'
import Game from './game'
import { addComponent, addEntity } from 'bitecs'
import {
	AreaConstraint,
	DisplayObject,
	Drag,
	Player,
	Transform,
	Velocity,
} from './ecs/components'
import { Sprite, Texture } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'
import { easeInSine } from './util'

const game = Game.shared

const { spriteContainer, viewport } = PixiApp.shared

export const player = addEntity(game.world)
addComponent(game.world, Player, player)
Player.paint[player] = 200
addComponent(game.world, Transform, player)
Transform.y[player] = viewport.worldScreenHeight / 2
Transform.width[player] = 24
Transform.height[player] = 24
addComponent(game.world, Velocity, player)
addComponent(game.world, Drag, player)
Drag.rate[player] = 0.3
addComponent(game.world, AreaConstraint, player)
AreaConstraint.bottom[player] = 408
AreaConstraint.right[player] = 4080
addComponent(game.world, DisplayObject, player)

export const playerSprite = new Sprite(Texture.WHITE)
playerSprite.anchor.x = 0.5
playerSprite.anchor.y = 0.5
playerSprite.setTransform(0, 0, 1.5, 1.5)
playerSprite.tint = 0xff0000
DisplayObjects[player] = playerSprite
spriteContainer.addChild(playerSprite)

export function easedPaintRemaining() {
	return easeInSine(Math.min(1, Player.paint[player] / 150))
}

export function updatePlayerColor() {
	const paintRemaining = easedPaintRemaining()
	const red = 128 + Math.round(paintRemaining * 127)
	const teal = 128 - Math.round(paintRemaining * 127)
	playerSprite.tint = (red << 16) + (teal << 8) + teal
}

game.init()

// TODO: Try Vite?
