import { DEG_TO_RAD } from 'pixi.js'
import { Angle, Vector2 } from './util'

class AngledPoint {
	constructor(public degrees: number, public distance: number) {}
}

class XYPoint {
	constructor(public x: number, public y: number) {}
}

export class ShapeCreationData {
	constructor(
		private points: (AngledPoint | XYPoint)[],
		public rotation: number = 0,
		public contiguous: boolean = true
	) {}
	rotate(degrees: number) {
		this.rotation = degrees * DEG_TO_RAD
		return this
	}
	getSegmentData(
		origin: Vector2
	): { start: Vector2; end: Vector2; angle: number }[] {
		const segments: { start: Vector2; end: Vector2; angle: number }[] = []
		let nextX = 0
		let nextY = 0
		let angle

		for (const point of this.points) {
			const start = {
				x: Math.round(origin.x + nextX),
				y: Math.round(origin.y + nextY),
			}
			if (this.rotation !== 0) {
				const rotated = Vector2.rotate({ x: nextX, y: nextY }, this.rotation)
				start.x = Math.round(origin.x + rotated.x)
				start.y = Math.round(origin.y + rotated.y)
			}
			if (point instanceof XYPoint) {
				angle = Angle.fromVector(point)
				nextX += point.x
				nextY += point.y
			} else {
				angle = point.degrees * DEG_TO_RAD
				nextX += point.distance * Math.cos(point.degrees * DEG_TO_RAD)
				nextY += point.distance * Math.sin(point.degrees * DEG_TO_RAD)
			}
			const end = {
				x: Math.round(origin.x + nextX),
				y: Math.round(origin.y + nextY),
			}
			if (this.rotation !== 0) {
				angle += this.rotation
				const rotated = Vector2.rotate({ x: nextX, y: nextY }, this.rotation)
				end.x = Math.round(origin.x + rotated.x)
				end.y = Math.round(origin.y + rotated.y)
			}
			segments.push({ start, end, angle })
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
		return new ShapeCreationData(points)
	},
}
