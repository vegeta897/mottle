import { PixiApp } from './pixi/pixi_app'
import { Angle, Vector2 } from './util'
import { Container, Graphics } from 'pixi.js'
import { DEG_TO_RAD } from '@pixi/math'
import { DashLine } from 'pixi-dashed-line'

const { stage } = PixiApp.shared

const shapeContainer: Container = new Container()
stage.addChildAt(shapeContainer, 0)

const MAX_DIST = 20
const MAX_ANGLE = 20 * DEG_TO_RAD
const GUIDE_COLOR = 0xff94b2

enum SEGMENT_DIR {
	NONE,
	START_TO_END,
	END_TO_START,
	BIDIRECTIONAL,
}

type Segment = {
	start: Vector2
	end: Vector2
	length: number
	angle: number
	complete: boolean
	direction: SEGMENT_DIR
	next?: Segment
	previous?: Segment
}

type Shape = {
	index: number
	segments: Segment[]
	startingSegments: Segment[]
	start: Vector2
	reverse: boolean
	complete: boolean
	contiguous: boolean
}

class AngledPoint {
	constructor(public degrees: number, public distance: number) {}
}

class XYPoint {
	constructor(public x: number, public y: number) {}
}

type PointLocation = AngledPoint | XYPoint

const shapes: Shape[] = []

// TODO: Make this a class instance
export const Level: { shape: null | Shape; segment: null | Segment } = {
	shape: null,
	segment: null,
}

function addShape(
	x: number,
	y: number,
	points: PointLocation[],
	options: { contiguous: boolean } = { contiguous: true }
) {
	const shape: Shape = {
		index: shapes.length,
		segments: [],
		startingSegments: [],
		reverse: false,
		complete: false,
		contiguous: options.contiguous,
		start: { x, y },
	}
	shapes.push(shape)
	const pointsGraphic = new Graphics()
	pointsGraphic.beginFill(GUIDE_COLOR)
	pointsGraphic.drawCircle(x, y, 6)
	const linesGraphic = new Graphics()
	const dashedLines = new DashLine(linesGraphic, {
		dash: [12, 8],
		width: 3,
		color: GUIDE_COLOR,
	})
	dashedLines.moveTo(x, y)
	let nextX = x
	let nextY = y
	let previousSegment: Segment | null = null
	let angle
	for (let point of points) {
		const start = { x: nextX, y: nextY }
		if (point instanceof XYPoint) {
			angle = Angle.fromVector(point)
			nextX += point.x
			nextY += point.y
		} else {
			angle = point.degrees * DEG_TO_RAD
			nextX += point.distance * Math.cos(point.degrees * DEG_TO_RAD)
			nextY += point.distance * Math.sin(point.degrees * DEG_TO_RAD)
		}
		dashedLines.lineTo(nextX, nextY)
		pointsGraphic.drawCircle(nextX, nextY, 6)
		const end = { x: nextX, y: nextY }
		const segment: Segment = {
			start,
			end,
			angle,
			direction: options.contiguous
				? SEGMENT_DIR.BIDIRECTIONAL
				: SEGMENT_DIR.NONE,
			complete: false,
			length: Vector2.getMagnitude(Vector2.subtract(end, start)),
		}
		if (previousSegment) {
			segment.previous = previousSegment
			previousSegment.next = segment
		} else if (segment.direction === SEGMENT_DIR.NONE) {
			segment.direction = SEGMENT_DIR.START_TO_END
		}
		shape.segments.push(segment)
		if (
			options.contiguous ||
			!previousSegment ||
			shape.segments.length === points.length
		) {
			shape.startingSegments.push(segment)
		}
		if (
			shape.segments.length === points.length &&
			segment.direction === SEGMENT_DIR.NONE
		) {
			segment.direction = SEGMENT_DIR.END_TO_START
		}
		previousSegment = segment
	}
	if (options.contiguous) {
		shape.segments[0].previous = previousSegment!
		previousSegment!.next = shape.segments[0]
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
	addShape(80, 80, [
		new AngledPoint(36, starSize),
		new AngledPoint(-108, starSize),
		new AngledPoint(108, starSize),
		new AngledPoint(-36, starSize),
		new AngledPoint(-180, starSize),
	])
	// Zig-zag
	const zigLength = 50
	addShape(
		-20,
		80,
		[
			new XYPoint(-zigLength, zigLength),
			new XYPoint(-zigLength, -zigLength),
			new XYPoint(-zigLength, zigLength),
			new XYPoint(-zigLength, -zigLength),
		],
		{ contiguous: false }
	)
}

export function getShapeAt(position: Vector2, velocity: Vector2) {
	const velocityAngle = Angle.fromVector(velocity)
	for (let shape of shapes.filter((s) => !s.complete)) {
		for (let segment of shape.startingSegments) {
			let direction = SEGMENT_DIR.NONE
			const start = { x: 0, y: 0 }
			if (
				[SEGMENT_DIR.START_TO_END, SEGMENT_DIR.BIDIRECTIONAL].includes(
					segment.direction
				) &&
				Angle.diff(segment.angle, velocityAngle) < MAX_ANGLE &&
				Vector2.getMagnitudeSquared(
					Vector2.subtract(position, segment.start)
				) <=
					MAX_DIST ** 2
			) {
				direction = SEGMENT_DIR.START_TO_END
				start.x = segment.start.x
				start.y = segment.start.y
			} else if (
				[SEGMENT_DIR.END_TO_START, SEGMENT_DIR.BIDIRECTIONAL].includes(
					segment.direction
				) &&
				Angle.diff(Angle.flip(segment.angle), velocityAngle) < MAX_ANGLE &&
				Vector2.getMagnitudeSquared(Vector2.subtract(position, segment.end)) <=
					MAX_DIST ** 2
			) {
				direction = SEGMENT_DIR.END_TO_START
				start.x = segment.end.x
				start.y = segment.end.y
			}
			if (direction !== SEGMENT_DIR.NONE) {
				shape.reverse = direction === SEGMENT_DIR.END_TO_START
				shape.start = start
				Level.shape = shape
				Level.segment = segment
				return true
			}
		}
	}
	return false
}

export function getSegmentStart() {
	return Level.shape!.reverse ? Level.segment!.end : Level.segment!.start
}
export function getSegmentEnd() {
	return Level.shape!.reverse ? Level.segment!.start : Level.segment!.end
}
export function getNextSegment() {
	return Level.shape!.reverse ? Level.segment!.previous : Level.segment!.next
}
