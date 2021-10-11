import { PixiApp, SCREEN_HEIGHT } from './pixi/pixi_app'
import { Angle, Vector2 } from './util'
import { Container, Graphics, Point, Rectangle } from 'pixi.js'
import { DEG_TO_RAD } from '@pixi/math'
import { DashLine } from 'pixi-dashed-line'
import * as PIXI from 'pixi.js'
import { AreaConstraint } from './ecs/components'
import { player } from './index'
import { ShapeCreationData, Shapes } from './shapes'

const { spriteContainer } = PixiApp.shared

const shapeContainer = new Container()
spriteContainer.addChildAt(shapeContainer, 0)
const perforationContainer = new Container()
perforationContainer.y = 1
spriteContainer.addChildAt(perforationContainer, 0)

const MAX_ANGLE = 25 * DEG_TO_RAD
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
	parallelPoint: Point
	perpendicularPoint: Point
	progress: number
	drift: number
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
	rotation: number
	boundingBox: Rectangle
}

const shapes: Shape[] = []

// TODO: Make this a class instance
export const Level: { shape: null | Shape; segment: null | Segment } = {
	shape: null,
	segment: null,
}

function addShape(x: number, y: number, data: ShapeCreationData) {
	const shape: Shape = {
		index: shapes.length,
		segments: [],
		startingSegments: [],
		reverse: false,
		complete: false,
		...data,
		start: { x, y },
		boundingBox: new Rectangle(),
	}
	// TODO: Set bounding box based on min/max x/y coords
	// TODO: Do this in Shapes function. Also handle rotation in Shapes function.
	shapes.push(shape)
	const pointsGraphic = new Graphics()
	pointsGraphic.beginFill(GUIDE_COLOR)
	pointsGraphic.drawCircle(x, y, 4)
	const linesGraphic = new Graphics()
	const dashedLines = new DashLine(linesGraphic, {
		dash: [10.08, 14.08], // Decimals for irregular rasterization
		width: 5,
		color: GUIDE_COLOR,
		cap: PIXI.LINE_CAP.ROUND,
		join: PIXI.LINE_JOIN.ROUND,
	})
	dashedLines.moveTo(x, y)
	let previousSegment: Segment | null = null
	const segmentDataList = data.getSegmentData({ x, y })
	for (const segmentData of segmentDataList) {
		dashedLines.lineTo(segmentData.end.x, segmentData.end.y)
		pointsGraphic.drawCircle(segmentData.end.x, segmentData.end.y, 4)
		const parallelPoint = new Point(
			segmentData.end.x - segmentData.start.x,
			segmentData.end.y - segmentData.start.y
		).normalize()
		const perpendicularVector2 = Vector2.rotate(parallelPoint, Math.PI / 2)
		const segment: Segment = {
			...segmentData,
			parallelPoint,
			perpendicularPoint: new Point(
				perpendicularVector2.x,
				perpendicularVector2.y
			),
			direction: shape.contiguous
				? SEGMENT_DIR.BIDIRECTIONAL
				: SEGMENT_DIR.NONE,
			complete: false,
			progress: 0,
			drift: 0,
			length: Vector2.getMagnitude(
				Vector2.subtract(segmentData.end, segmentData.start)
			),
		}
		if (previousSegment) {
			segment.previous = previousSegment
			previousSegment.next = segment
		} else if (segment.direction === SEGMENT_DIR.NONE) {
			segment.direction = SEGMENT_DIR.START_TO_END
		}
		shape.segments.push(segment)
		if (
			shape.contiguous ||
			!previousSegment ||
			shape.segments.length === segmentDataList.length
		) {
			shape.startingSegments.push(segment)
		}
		if (
			shape.segments.length === segmentDataList.length &&
			segment.direction === SEGMENT_DIR.NONE
		) {
			segment.direction = SEGMENT_DIR.END_TO_START
		}
		previousSegment = segment
		if (
			segment.end.y < AreaConstraint.top[player] ||
			segment.end.y > AreaConstraint.bottom[player]
		)
			throw `Shape point [${segment.end.x},${segment.end.y}] out of bounds!`
	}
	if (shape.contiguous) {
		shape.segments[0].previous = previousSegment!
		previousSegment!.next = shape.segments[0]
	}
	shapeContainer.addChild(pointsGraphic)
	shapeContainer.addChild(linesGraphic)
}

const PERFORATION_GAP = 256
let nextPerforationX = -128

export function createLevel() {
	const perforationGraphic = new Graphics()
	const dashedLines = new DashLine(perforationGraphic, {
		dash: [2, 2],
		width: 2,
		color: 0xf4e3b9,
	})
	for (let i = 0; i < 3; i++) {
		dashedLines.moveTo(nextPerforationX, 0)
		dashedLines.lineTo(nextPerforationX, SCREEN_HEIGHT)
		nextPerforationX += PERFORATION_GAP
	}
	perforationContainer.addChild(perforationGraphic)
	addShape(400, 180, Shapes.triangleIso(60, 120))
	addShape(500, 250, Shapes.square(100).rotate(-15))
	addShape(630, 130, Shapes.star(180).rotate(5))
	addShape(750, 300, Shapes.zigZag(4, 50).rotate(-10))
}

export function getShapeAt(
	position: Vector2,
	velocity: Vector2,
	range: number
) {
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
					range ** 2
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
					range ** 2
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

export function updateLevel() {
	if (spriteContainer.toGlobal(perforationContainer).x < 0)
		perforationContainer.x += PERFORATION_GAP
}
