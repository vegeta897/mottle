import { Map2D } from './map'
import { Container, Graphics } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'
import { addComponent, addEntity } from 'bitecs'
import Game from './game'
import {
	DisplayObject,
	Drag,
	PaintBall,
	Transform,
	Velocity,
} from './ecs/components'
import Prando from 'prando'

const paintMap = new Map2D(1000, 102)
console.log(paintMap)

const paintContainer: Container = new Container()
PixiApp.shared.viewport.addChildAt(paintContainer, 0)

const paintGraphic = new Graphics()
paintGraphic.beginFill(0xc03b94)
paintGraphic.drawCircle(0, 0, 4)

const rng = new Prando()

export function spillPaint(
	x: number,
	y: number,
	velocityX: number,
	velocityY: number
) {
	for (let i = 0; i < 8; i++) {
		const sprite = paintGraphic.clone()
		paintContainer.addChild(sprite)
		const entity = addEntity(Game.shared.world)
		DisplayObjects[entity] = sprite
		addComponent(Game.shared.world, PaintBall, entity)
		PaintBall.paint[entity] = 50
		addComponent(Game.shared.world, DisplayObject, entity)
		addComponent(Game.shared.world, Transform, entity)
		Transform.x[entity] = x
		Transform.y[entity] = y
		Transform.width[entity] = 4
		Transform.height[entity] = 4
		addComponent(Game.shared.world, Velocity, entity)
		Velocity.x[entity] += velocityX * 3 * rng.next(0.8, 1.5)
		Velocity.y[entity] += velocityY * 3 * rng.next(0.8, 1.5)
		addComponent(Game.shared.world, Drag, entity)
		Drag.rate[entity] = 0.1
	}
}
