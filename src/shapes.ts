export class AngledPoint {
	constructor(public degrees: number, public distance: number) {}
}

export class XYPoint {
	constructor(public x: number, public y: number) {}
}

export type PointLocation = AngledPoint | XYPoint

export const Shapes = {
	triangleIso(width: number, height: number) {
		return [
			new XYPoint(width, -height),
			new XYPoint(width, height),
			new XYPoint(-height, 0),
		]
	},
	square(size: number) {
		return [
			new XYPoint(size, 0),
			new XYPoint(0, size),
			new XYPoint(-size, 0),
			new XYPoint(0, -size),
		]
	},
	star(size: number) {
		return [
			new AngledPoint(36, size),
			new AngledPoint(36 * 2 - 180, size),
			new AngledPoint(36 * 3, size),
			new AngledPoint(36 * 4 - 180, size),
			new AngledPoint(36 * 5, size),
		]
	},
	zigZag(segments: number, segmentLength: number) {
		const points: XYPoint[] = []
		for (let i = 0; i < segments; i++) {
			points.push(
				new XYPoint(segmentLength, segmentLength * (i % 2 === 0 ? 1 : -1))
			)
		}
		return points
	},
}
