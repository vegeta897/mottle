import { PixiApp } from './pixi/pixi_app'
import { Vector2 } from './util'
import { Container, Graphics } from 'pixi.js'
import { DEG_TO_RAD } from '@pixi/math'

const { stage } = PixiApp.shared

const shapeContainer: Container = new Container()
stage.addChildAt(shapeContainer, 0)

const NEAR = 16

type Segment = {
	start: Vector2
	end: Vector2
	length: number
	next?: Segment
	previous?: Segment
}

type Shape = {
	index: number
	x: number
	y: number
	segments: Segment[]
	complete: boolean
}

class AngledPoint {
	constructor(public degrees: number, public distance: number) {}
}

class XYPoint {
	constructor(public x: number, public y: number) {}
}

type PointLocation = AngledPoint | XYPoint

const shapes: Shape[] = []

export const Level: { shape: null | Shape; segment: null | Segment } = {
	shape: null,
	segment: null,
}

function addShape(x: number, y: number, points: PointLocation[]) {
	const shape: Shape = {
		index: shapes.length,
		segments: [],
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
	let previousSegment: Segment | null = null
	for (let point of points) {
		const start = { x: nextX, y: nextY }
		if (point instanceof XYPoint) {
			nextX += point.x
			nextY += point.y
		} else {
			nextX += point.distance * Math.cos(point.degrees * DEG_TO_RAD)
			nextY += point.distance * Math.sin(point.degrees * DEG_TO_RAD)
		}
		linesGraphic.lineTo(nextX, nextY)
		pointsGraphic.drawCircle(nextX, nextY, 6)
		const end = { x: nextX, y: nextY }
		const segment: Segment = {
			start,
			end,
			length: Vector2.getMagnitude(Vector2.subtract(end, start)),
		}
		if (previousSegment) {
			segment.previous = previousSegment
			previousSegment.next = segment
		}
		shape.segments.push(segment)
		previousSegment = segment
	}
	shapeContainer.addChild(pointsGraphic)
	shapeContainer.addChild(linesGraphic)
}

export function createLevel() {
	// Triangle
	addShape(80, -20, [
		new XYPoint(60, -120),
		new XYPoint(60, 120),
		new XYPoint(-120, 0),
	])
	// Square
	addShape(-80, -20, [
		new XYPoint(-100, 0),
		new XYPoint(0, -100),
		new XYPoint(100, 0),
		new XYPoint(0, 100),
	])
	// Star
	const starSize = 180
	addShape(0, 80, [
		new AngledPoint(36, starSize),
		new AngledPoint(-108, starSize),
		new AngledPoint(108, starSize),
		new AngledPoint(-36, starSize),
		new AngledPoint(-180, starSize),
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
	return null
}
