import './style.css'
import Game from './game'
import { addComponent, addEntity } from 'bitecs'
import {
	AreaConstraint,
	DisplayObject,
	Drag,
	Player,
	setComponentXY,
	Transform,
	Velocity,
} from './ecs/components'
import { Sprite, Texture, Loader } from 'pixi.js'
import { PixiApp, SCREEN_HEIGHT, SCREEN_WIDTH } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'
import { createLevel } from './level'

const game = Game.shared

const { spriteContainer } = PixiApp.shared

const loader = Loader.shared
loader.add('./sprites.json')
loader.onComplete.once(startGame)
loader.onError.once(console.error)
loader.load()

export const player = addEntity(game.world)
export let playerSprite: Sprite
export let playerRight: Texture
export let playerLeft: Texture

async function startGame() {
	playerRight = Texture.from('player-right')
	playerLeft = Texture.from('player-left')

	addComponent(game.world, Player, player)
	Player.painting[player] = 0
	addComponent(game.world, Transform, player)
	setComponentXY(Transform, player, { x: 200, y: SCREEN_HEIGHT / 2 })
	Transform.width[player] = 28
	Transform.height[player] = 24
	addComponent(game.world, Velocity, player)
	addComponent(game.world, Drag, player)
	Drag.rate[player] = 0.2
	addComponent(game.world, AreaConstraint, player)
	AreaConstraint.top[player] = 38
	AreaConstraint.left[player] = 24
	AreaConstraint.bottom[player] = SCREEN_HEIGHT - 12
	AreaConstraint.right[player] = SCREEN_WIDTH - 24
	addComponent(game.world, DisplayObject, player)

	playerSprite = new Sprite(playerRight)
	playerSprite.anchor.set(0.5, 0.85)
	DisplayObjects[player] = playerSprite
	spriteContainer.addChild(playerSprite)

	game.init()
	createLevel()
}
// TODO: Try Vite?
