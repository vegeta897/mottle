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

// https://easings.net/
export function easeInCubic(x: number): number {
	return x * x * x
}
export function easeOutCubic(x: number): number {
	return 1 - Math.pow(1 - x, 3)
}
export function easeInSine(x: number): number {
	return 1 - Math.cos((x * Math.PI) / 2)
}
export function easeOutSine(x: number): number {
	return Math.sin((x * Math.PI) / 2)
}
