import { PixiApp, SCREEN_HEIGHT } from './pixi/pixi_app'
import { Angle, Vector2 } from './util'
import { Container, Graphics, Point, Rectangle } from 'pixi.js'
import { DEG_TO_RAD } from '@pixi/math'
import { DashLine } from 'pixi-dashed-line'
import * as PIXI from 'pixi.js'
import { AreaConstraint } from './ecs/components'
import { player } from './'
import { ShapeCreationData, Shapes } from './shapes'
import Prando from 'prando'

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
	segments: Segment[]
	startingSegments: Segment[]
	start: Vector2
	reverse: boolean
	complete: boolean
	contiguous: boolean
	rotation: number
	boundingBox: Rectangle
	graphics: Graphics
}

const shapes: Set<Shape> = new Set()

// TODO: Make this a class instance
export const Level: { shape: null | Shape; segment: null | Segment } = {
	shape: null,
	segment: null,
}

const shapeLineStyle = {
	width: 5,
	color: GUIDE_COLOR,
	cap: PIXI.LINE_CAP.ROUND,
	join: PIXI.LINE_JOIN.ROUND,
}

function addShape(data: ShapeCreationData) {
	const shape: Shape = {
		segments: [],
		startingSegments: [],
		reverse: false,
		complete: false,
		boundingBox: data.boundingBox,
		rotation: data.rotation,
		contiguous: data.contiguous,
		start: data.origin,
		graphics: new Graphics(),
	}
	shapes.add(shape)
	shape.graphics.beginFill(GUIDE_COLOR)
	shape.graphics.drawCircle(shape.start.x, shape.start.y, 4)
	const dashedLines = new DashLine(shape.graphics, {
		dash: [10.08, 14.08], // Decimals for irregular rasterization
		...shapeLineStyle,
	})
	dashedLines.moveTo(shape.start.x, shape.start.y)
	let previousSegment: Segment | null = null
	const segmentDataList = data.getSegmentData()
	for (const segmentData of segmentDataList) {
		shape.graphics.lineStyle(shapeLineStyle)
		dashedLines.lineTo(segmentData.end.x, segmentData.end.y)
		shape.graphics.lineStyle()
		shape.graphics.drawCircle(segmentData.end.x, segmentData.end.y, 4)
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
			shape.boundingBox.top < AreaConstraint.top[player] ||
			shape.boundingBox.bottom > AreaConstraint.bottom[player]
		)
			throw `Shape point [${segment.end.x},${segment.end.y}] out of bounds!`
	}
	if (shape.contiguous) {
		shape.segments[0].previous = previousSegment!
		previousSegment!.next = shape.segments[0]
	}
	shape.graphics.cacheAsBitmap = true
	shape.graphics.alpha = 0.5
	shapeContainer.addChild(shape.graphics)
}

const PERFORATION_GAP = 256

export function createLevel() {
	const perforationGraphic = new Graphics()
	const dashedLines = new DashLine(perforationGraphic, {
		dash: [2, 2],
		width: 2,
		color: 0xf4e3b9,
	})
	dashedLines.lineTo(0, SCREEN_HEIGHT)

	let nextPerforationX = -PERFORATION_GAP / 2
	perforationContainer.addChild(
		perforationGraphic.setTransform(nextPerforationX)
	)
	for (let i = 0; i < 2; i++) {
		nextPerforationX += PERFORATION_GAP
		perforationContainer.addChild(
			perforationGraphic.clone().setTransform(nextPerforationX)
		)
	}
	let nextX = 400
	const rng = new Prando()
	for (let i = 0; i < 50; i++) {
		const shape = rng
			.nextArrayItem([
				() => Shapes.triangleIso(rng.nextInt(80, 150), rng.nextInt(80, 150)),
				() => Shapes.square(rng.nextInt(80, 130)),
				() => Shapes.star(rng.nextInt(120, 160)),
				() => Shapes.zigZag(rng.nextInt(3, 5), rng.nextInt(30, 60)),
			])()
			.rotate(rng.nextInt(-60, 60))
		let y = rng.nextInt(
			AreaConstraint.top[player],
			AreaConstraint.bottom[player] - shape.boundingBox.height
		)
		shape.move({
			x: nextX - shape.boundingBox.left,
			y: y - shape.boundingBox.top,
		})
		addShape(shape)
		nextX += shape.boundingBox.width + rng.nextInt(20, 60)
	}
}

export function getShapeAt(
	position: Vector2,
	velocity: Vector2,
	range: number
) {
	const velocityAngle = Angle.fromVector(velocity)
	for (let shape of [...shapes].filter((s) => !s.complete)) {
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
				shape.graphics.alpha = 1
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
	for (const shape of shapes) {
		if (spriteContainer.toGlobal({ x: shape.boundingBox.right, y: 0 }).x < 0) {
			//TODO: shape.destroy()
			shapes.delete(shape)
			shape.graphics.destroy()
		}
	}
}
