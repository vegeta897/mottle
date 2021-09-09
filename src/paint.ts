import { Map2D } from './map'
import { Container, Graphics } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { DisplayObjects } from './pixi/object_manager'
import { addComponent, addEntity } from 'bitecs'
import Game from './game'
import {
	AreaConstraint,
	DisplayObject,
	Drag,
	PaintBall,
	Transform,
	Velocity,
} from './ecs/components'
import Prando from 'prando'
import { Vector2 } from './util'

const { viewport } = PixiApp.shared

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
		PaintBall.paint[entity] = rng.nextInt(3, 10)
		addComponent(Game.shared.world, DisplayObject, entity)
		addComponent(Game.shared.world, Transform, entity)
		Transform.x[entity] = x
		Transform.y[entity] = y
		Transform.width[entity] = 4
		Transform.height[entity] = 4
		addComponent(Game.shared.world, AreaConstraint, entity)
		AreaConstraint.bottom[entity] = 264
		AreaConstraint.right[entity] = 4080
		addComponent(Game.shared.world, Velocity, entity)
		const rotated = Vector2.rotate(
			{ x: velocityX, y: velocityY },
			rng.next(-1, 1)
		)
		Velocity.x[entity] += rotated.x * rng.next(0.8, 1.2)
		Velocity.y[entity] += rotated.y * rng.next(0.8, 1.2)
		Velocity.speed[entity] = Vector2.getMagnitude({
			x: Velocity.x[entity],
			y: Velocity.y[entity],
		})
		addComponent(Game.shared.world, Drag, entity)
		Drag.rate[entity] = 0.05
	}
}

const SPLAT_SIZE = 6

const floorPaintContainer: Container = new Container()
floorPaintContainer.setTransform(SPLAT_SIZE / 2, SPLAT_SIZE / 2)
viewport.addChildAt(floorPaintContainer, 0)

const paintMap = new Map2D(1000, 48)

const splat = new Graphics()
splat.beginFill(0xff88aa)
splat.drawRect(0, 0, SPLAT_SIZE, SPLAT_SIZE)

export function paintGround({ x, y }: Vector2, brushSize: number): number {
	const [left, right, top, bottom] = [
		x - brushSize / 2,
		x + brushSize / 2,
		y - brushSize / 2,
		y + brushSize / 2,
	].map((v) => Math.floor(v / SPLAT_SIZE))
	let tilesPainted = 0
	for (let ix = 0; ix <= right - left; ix++) {
		for (let iy = 0; iy <= bottom - top; iy++) {
			const paintMapX = left + ix
			const paintMapY = top + iy
			if (paintMap.get(paintMapX, paintMapY)) continue
			paintMap.set(paintMapX, paintMapY, 1)
			tilesPainted++
			floorPaintContainer.addChild(
				splat
					.clone()
					.setTransform(
						(left + ix) * SPLAT_SIZE - SPLAT_SIZE / 2,
						(top + iy) * SPLAT_SIZE - SPLAT_SIZE / 2
					)
			)
		}
	}

	return tilesPainted
}
