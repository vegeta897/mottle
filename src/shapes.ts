import { DEG_TO_RAD, Rectangle } from 'pixi.js'
import { Angle, Vector2 } from './util'

class AngledPoint {
	constructor(public degrees: number, public distance: number) {}
	get angle() {
		return this.degrees * DEG_TO_RAD
	}
	applyTo(point: Vector2, rotation = 0) {
		const angle = this.angle + rotation
		Vector2.assign(
			point,
			Vector2.add(point, Vector2.fromAngle(this.distance, angle))
		)
	}
}

class XYPoint {
	constructor(public x: number, public y: number) {}
	get angle() {
		return Angle.fromVector(this)
	}
	applyTo(point: Vector2, rotation = 0) {
		Vector2.assign(point, Vector2.add(point, Vector2.rotate(this, rotation)))
	}
}

export class ShapeCreationData {
	private _boundingBox = new Rectangle()
	public get boundingBox(): Rectangle {
		if (this.dirty) this.calculateBoundingBox()
		return this._boundingBox
	}
	public rotation = 0
	public origin = Vector2.new()
	private dirty = true
	constructor(
		private pointSpecs: (AngledPoint | XYPoint)[],
		public contiguous: boolean = true
	) {}
	rotate(degrees: number) {
		this.rotation = degrees * DEG_TO_RAD
		this.dirty = true
		return this
	}
	move(moveTo: Vector2) {
		const delta = Vector2.subtract(moveTo, this.origin)
		Vector2.assign(this._boundingBox, Vector2.add(this._boundingBox, delta))
		Vector2.assign(this.origin, moveTo)
		return this
	}
	private calculateBoundingBox() {
		const nextPoint = Vector2.new()
		this.pointSpecs.forEach((pointSpec) => {
			pointSpec.applyTo(nextPoint, this.rotation)
			const global = Vector2.round(Vector2.add(this.origin, nextPoint))
			this._boundingBox.enlarge(new Rectangle(global.x, global.y))
		})
		this.dirty = false
	}
	getSegmentData(): { start: Vector2; end: Vector2; angle: number }[] {
		const segments: { start: Vector2; end: Vector2; angle: number }[] = []
		const previousPoint = Vector2.new()
		const nextPoint = Vector2.new()
		this.pointSpecs.forEach((pointSpec) => {
			pointSpec.applyTo(nextPoint, this.rotation)
			const start = Vector2.round(Vector2.add(this.origin, previousPoint))
			Vector2.assign(previousPoint, nextPoint)
			const end = Vector2.round(Vector2.add(this.origin, previousPoint))
			segments.push({ start, end, angle: pointSpec.angle + this.rotation })
		})
		return segments
	}
}

export const Shapes = {
	triangleIso(width: number, height: number) {
		return new ShapeCreationData([
			new XYPoint(width / 2, -height),
			new XYPoint(width / 2, height),
			new XYPoint(-width, 0),
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
