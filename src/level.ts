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
	x: number
	y: number
	points: Vector2[]
	complete: boolean
}

export const shapes: Shape[] = []

function addShape(x: number, y: number, points: [number, number][]) {
	const shape: Shape = {
		index: shapes.length,
		points: [],
		complete: false,
		x,
		y,
	}
	shapes.push(shape)
	const pointsGraphic = new Graphics()
	pointsGraphic.beginFill(0xffe0dc)
	pointsGraphic.drawCircle(x, y, NEAR)
	const linesGraphic = new Graphics()
	linesGraphic.lineStyle(2, 0xffe0dc)
	linesGraphic.moveTo(x, y)
	let nextX = x
	let nextY = y
	for (let [x, y] of points) {
		nextX += x
		nextY += y
		linesGraphic.lineTo(nextX, nextY)
		pointsGraphic.drawCircle(nextX, nextY, 6)
		shape.points.push({ x: nextX, y: nextY })
	}
	shapeContainer.addChild(pointsGraphic)
	shapeContainer.addChild(linesGraphic)
}

export function createLevel() {
	// Triangle
	addShape(80, -20, [
		[60, -120],
		[60, 120],
		[-120, 0],
	])
	// Square
	addShape(-80, -20, [
		[-100, 0],
		[0, -100],
		[100, 0],
		[0, 100],
	])
	// Star
	// TODO: Add angle/distance based shape drawing method
	addShape(-60, 80, [
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
			Vector2.getMagnitudeSquared(Vector2.subtract(position, shape)) <=
				NEAR ** 2
		) {
			return shape
		}
	}
}
