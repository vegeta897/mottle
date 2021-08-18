import './style.css'
import Game from './game'
import { addComponent, addEntity } from 'bitecs'
import { Drag, Player, Transform, Velocity } from './ecs/components'
import { Sprite, Texture } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'
import { onViewportChange } from './level'

const game = Game.shared

const { spriteContainer, viewport } = PixiApp.shared

export const player = addEntity(game.world)
addComponent(game.world, Player, player)
addComponent(game.world, Transform, player)
addComponent(game.world, Velocity, player)
addComponent(game.world, Drag, player)
Drag.rate[player] = 0.3

const playerSprite = new Sprite(Texture.WHITE)
playerSprite.anchor.x = 0.5
playerSprite.anchor.y = 0.5
playerSprite.tint = 0xff0000
playerSprite.alpha = 0.6
DisplayObjects[player] = playerSprite
spriteContainer.addChild(playerSprite)
viewport.moveCenter(playerSprite.x, playerSprite.y)
onViewportChange()

game.init()

// TODO: Try Vite?
