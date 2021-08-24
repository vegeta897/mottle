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
import { Sprite, Texture, Loader } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'
import { createLevel } from './level'

const game = Game.shared

const { spriteContainer, viewport } = PixiApp.shared

const loader = Loader.shared
loader.add('./sprites.json')
loader.onComplete.once(startGame)
loader.onError.once(console.error)
loader.load()

export const player = addEntity(game.world)
export let playerSprite: Sprite

async function startGame() {
	addComponent(game.world, Player, player)
	Player.paint[player] = 200
	addComponent(game.world, Transform, player)
	Transform.y[player] = viewport.worldScreenHeight / 2
	Transform.width[player] = 18
	Transform.height[player] = 24
	addComponent(game.world, Velocity, player)
	addComponent(game.world, Drag, player)
	Drag.rate[player] = 0.3
	addComponent(game.world, AreaConstraint, player)
	AreaConstraint.left[player] = -12
	AreaConstraint.bottom[player] = 408
	AreaConstraint.right[player] = 4080
	addComponent(game.world, DisplayObject, player)

	playerSprite = new Sprite(Texture.from('player'))
	playerSprite.anchor.set(0.5, 0.625)
	DisplayObjects[player] = playerSprite
	spriteContainer.addChild(playerSprite)

	game.init()
	createLevel()
}
// TODO: Try Vite?
