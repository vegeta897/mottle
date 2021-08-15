export class Vector2 {
	static getMagnitude({ x, y }: Vector2) {
		return Math.sqrt(x ** 2 + y ** 2)
	}
	static normalize({ x, y }: Vector2, magnitude?: number, scalar = 1) {
		if (!magnitude) magnitude = Vector2.getMagnitude({ x, y })
		return { x: (x / magnitude) * scalar, y: (y / magnitude) * scalar }
	}
	static multiply({ x, y }: Vector2, scalar: number) {
		return { x: x * scalar, y: y * scalar }
	}
	x: number
	y: number
	static toString({ x, y }: Vector2) {
		return x + ':' + y
	}
}
