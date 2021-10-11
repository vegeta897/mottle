import { DEG_TO_RAD, Rectangle } from 'pixi.js'
import { Angle, Vector2 } from './util'

class AngledPoint {
	constructor(public degrees: number, public distance: number) {}
}

class XYPoint {
	constructor(public x: number, public y: number) {}
}

export class ShapeCreationData {
	public boundingBox = new Rectangle()
	public rotation = 0
	constructor(
		private points: (AngledPoint | XYPoint)[],
		public contiguous: boolean = true
	) {}
	rotate(degrees: number) {
		this.rotation = degrees * DEG_TO_RAD
		return this
	}
	getSegmentData(
		origin: Vector2
	): { start: Vector2; end: Vector2; angle: number }[] {
		this.boundingBox.x = origin.x
		this.boundingBox.y = origin.y
		const nextPoint = Vector2.new()
		let points = this.points.map((point) => {
			let angle
			if (point instanceof XYPoint) {
				angle = Angle.fromVector(point) + this.rotation
				Vector2.assign(
					nextPoint,
					Vector2.add(nextPoint, Vector2.rotate(point, this.rotation))
				)
			} else {
				angle = point.degrees * DEG_TO_RAD + this.rotation
				Vector2.assign(
					nextPoint,
					Vector2.add(nextPoint, Vector2.fromAngle(point.distance, angle))
				)
			}
			return { ...nextPoint, angle }
		})
		const segments: { start: Vector2; end: Vector2; angle: number }[] = []
		const previousPoint = Vector2.new()
		for (const point of points) {
			const start = Vector2.round(Vector2.add(origin, previousPoint))
			Vector2.assign(previousPoint, point)
			const end = Vector2.round(Vector2.add(origin, previousPoint))
			this.boundingBox.enlarge(new Rectangle(end.x, end.y))
			segments.push({ start, end, angle: point.angle })
		}
		return segments
	}
}

export const Shapes = {
	triangleIso(width: number, height: number) {
		return new ShapeCreationData([
			new XYPoint(width, -height),
			new XYPoint(width, height),
			new XYPoint(-height, 0),
		])
	},
	square(size: number) {
		return new ShapeCreationData([
			new XYPoint(size, 0),
			new XYPoint(0, size),
			new XYPoint(-size, 0),
			new XYPoint(0, -size),
		])
	},
	star(size: number) {
		return new ShapeCreationData([
			new AngledPoint(36, size),
			new AngledPoint(36 * 2 - 180, size),
			new AngledPoint(36 * 3, size),
			new AngledPoint(36 * 4 - 180, size),
			new AngledPoint(36 * 5, size),
		])
	},
	zigZag(segments: number, segmentLength: number) {
		const points: XYPoint[] = []
		for (let i = 0; i < segments; i++) {
			points.push(
				new XYPoint(segmentLength, segmentLength * (i % 2 === 0 ? 1 : -1))
			)
		}
		return new ShapeCreationData(points, false)
	},
}
