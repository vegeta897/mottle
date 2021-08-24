import { Map2D } from './map'
import { Circle, Container, Graphics } from 'pixi.js'
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
import { alignToGrid, Vector2 } from './util'

const { viewport } = PixiApp.shared

const paintMap = new Map2D(1000, 102)

const paintContainer: Container = new Container()
viewport.addChildAt(paintContainer, 0)

const paintBallGraphic = new Graphics()
paintBallGraphic.beginFill(0xc03b94)
paintBallGraphic.drawCircle(0, 0, 4)

const rng = new Prando()

export function spillPaint(
	x: number,
	y: number,
	velocityX: number,
	velocityY: number
) {
	for (let i = 0; i < 12; i++) {
		const sprite = paintBallGraphic.clone()
		paintContainer.addChild(sprite)
		const entity = addEntity(Game.shared.world)
		DisplayObjects[entity] = sprite
		addComponent(Game.shared.world, PaintBall, entity)
		PaintBall.paint[entity] = rng.nextInt(20, 50)
		addComponent(Game.shared.world, DisplayObject, entity)
		addComponent(Game.shared.world, Transform, entity)
		Transform.x[entity] = x
		Transform.y[entity] = y
		Transform.width[entity] = 4
		Transform.height[entity] = 4
		addComponent(Game.shared.world, Velocity, entity)
		const rotated = Vector2.rotate(
			{ x: velocityX, y: velocityY },
			rng.next(-0.3, 0.3)
		)
		Velocity.x[entity] += rotated.x * 4 * rng.next(0.8, 1.5)
		Velocity.y[entity] += rotated.y * 4 * rng.next(0.8, 1.5)
		addComponent(Game.shared.world, Drag, entity)
		Drag.rate[entity] = 0.15
	}
}

const SPLAT_SIZE = 8

const splat = new Graphics()
splat.beginFill(0xff88aa)
splat.drawRect(0, 0, SPLAT_SIZE, SPLAT_SIZE)

export function paintGround({ x, y }: Vector2, brushSize: number): number {
	const brushCircle = new Circle(x, y, brushSize / 2)
	const brushRect = brushCircle.getBounds()
	const [left, top /*, right, bottom*/] = [
		brushRect.left,
		brushRect.top,
		// brushRect.right,
		// brushRect.bottom,
	].map((v) => alignToGrid(v, SPLAT_SIZE))
	let tilesPainted = 0
	for (let ix = 0; ix <= Math.ceil(brushSize / SPLAT_SIZE); ix++) {
		for (let iy = 0; iy <= Math.ceil(brushSize / SPLAT_SIZE); iy++) {
			const splatX = left + ix * SPLAT_SIZE
			const splatY = top + iy * SPLAT_SIZE
			if (!brushCircle.contains(splatX, splatY)) continue
			// const grid = Vector2.toString({ x: splatX, y: splatY })
			if (!paintMap.get(splatX, splatY)) {
				tilesPainted++
				paintContainer.addChild(
					splat
						.clone()
						.setTransform(splatX - SPLAT_SIZE / 2, splatY - SPLAT_SIZE / 2)
				)
			}
		}
	}

	return tilesPainted
}
