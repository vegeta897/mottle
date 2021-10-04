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
	index: number
	points: Vector2[]
	complete: boolean
}

export const shapes: Shape[] = []

function addShape(points: [number, number][]) {
	const shape: Shape = { index: shapes.length, points: [], complete: false }
	shapes.push(shape)
	let nextX = 0
	let nextY = 0
	for (let [x, y] of points) {
		nextX += x
		nextY += y
		shape.points.push({ x: nextX, y: nextY })
	}
	const startPointGraphic = new Graphics()
	startPointGraphic.beginFill(0xffe0dc)
	startPointGraphic.drawCircle(points[0][0], points[0][1], NEAR)
	shapeContainer.addChild(startPointGraphic)
}

export function createLevel() {
	addShape([
		[80, -20],
		[60, -120],
		[60, 120],
		[-120, 0],
	])
}

export function getShapeAt(position: Vector2) {
	for (let shape of shapes) {
		if (
			!shape.complete &&
			Vector2.getMagnitudeSquared(
				Vector2.subtract(position, shape.points[0])
			) <=
				NEAR ** 2
		) {
			return shape
		}
	}
}
