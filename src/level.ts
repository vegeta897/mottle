import { PixiApp } from './pixi/pixi_app'
import { Vector2 } from './util'
import { Container, Graphics } from 'pixi.js'

const { stage } = PixiApp.shared

const shapeContainer: Container = new Container()
stage.addChildAt(shapeContainer, 0)

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
	const pointsGraphic = new Graphics()
	pointsGraphic.beginFill(0xffe0dc)
	const linesGraphic = new Graphics()
	linesGraphic.lineStyle(1, 0xffe0dc)
	linesGraphic.moveTo(points[0][0], points[0][1])
	for (let [x, y] of points) {
		nextX += x
		nextY += y
		linesGraphic.lineTo(nextX, nextY)
		pointsGraphic.drawCircle(nextX, nextY, shape.points.length > 0 ? 6 : NEAR)
		shape.points.push({ x: nextX, y: nextY })
	}
	shapeContainer.addChild(pointsGraphic)
	shapeContainer.addChild(linesGraphic)
}

export function createLevel() {
	addShape([
		[80, -20],
		[60, -120],
		[60, 120],
		[-120, 0],
	])
	addShape([
		[-80, -20],
		[-100, 0],
		[0, -100],
		[100, 0],
		[0, 100],
	])
	addShape([
		[-60, 80],
		[130, 100],
		[-60, -150],
		[-60, 150],
		[120, -100],
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
