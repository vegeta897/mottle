import { PixiApp } from './pixi/pixi_app'
import { Vector2 } from './util'
import { Container, Graphics } from 'pixi.js'

const { viewport } = PixiApp.shared

const shapeContainer: Container = new Container()
viewport.addChildAt(shapeContainer, 0)

export enum PaintBucketStates {
	SLEEP,
	IDLE,
	WALK,
	SPILL,
}

const NEAR = 16

type Shape = {
	points: Vector2[]
}

const shapes: Shape[] = []

function addShape({ x, y }: Vector2) {
	shapes.push({ points: [{ x, y }] })
	const startPointGraphic = new Graphics()
	startPointGraphic.beginFill(0xffe0dc)
	startPointGraphic.drawCircle(x, 0, NEAR)
	shapeContainer.addChild(startPointGraphic)
}

export function createLevel() {
	addShape({ x: 80, y: 0 })
}

export function getShapeAt(position: Vector2) {
	for (let shape of shapes) {
		if (
			Vector2.getMagnitudeSquared(
				Vector2.subtract(position, shape.points[0])
			) <=
			NEAR ** 2
		) {
			return shape
		}
	}
}
