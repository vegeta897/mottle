import { AreaConstraint, componentToVector2, Transform } from './ecs/components'
import { PI_2 } from 'pixi.js'
import { differenceAngles } from 'yy-angle'

// When PIXI.Point doesn't cut it
export class Vector2 {
	x: number
	y: number
	static getMagnitude({ x, y }: Vector2) {
		return Math.sqrt(x ** 2 + y ** 2)
	}
	static getMagnitudeSquared({ x, y }: Vector2) {
		return x ** 2 + y ** 2
	}
	static normalize({ x, y }: Vector2, magnitude?: number, scalar = 1) {
		if (!magnitude) magnitude = Vector2.getMagnitude({ x, y })
		return { x: (x / magnitude) * scalar, y: (y / magnitude) * scalar }
	}
	static multiplyScalar({ x, y }: Vector2, scalar: number) {
		return { x: x * scalar, y: y * scalar }
	}
	static toString({ x, y }: Vector2) {
		return x + ':' + y
	}
	static equals({ x: x1, y: y1 }: Vector2, { x: x2, y: y2 }: Vector2) {
		return x1 === x2 && y1 === y2
	}
	static rotate({ x, y }: Vector2, radians: number) {
		return {
			x: x * Math.cos(radians) - y * Math.sin(radians),
			y: x * Math.sin(radians) + y * Math.cos(radians),
		}
	}
	static getAngle({ x, y }: Vector2) {
		return Math.atan2(y, x)
	}
	static subtract(v1: Vector2, v2: Vector2): Vector2 {
		return { x: v1.x - v2.x, y: v1.y - v2.y }
	}
	static add(...vectors: Vector2[]): Vector2 {
		const result = { ...vectors[0] }
		for (let i = 1; i < vectors.length; i++) {
			result.x += vectors[i].x
			result.y += vectors[i].y
		}
		return result
	}
	static applyAreaConstraint(vector: Vector2, eid: number) {
		return {
			x: clamp(vector.x, AreaConstraint.left[eid], AreaConstraint.right[eid]),
			y: clamp(vector.y, AreaConstraint.top[eid], AreaConstraint.bottom[eid]),
		}
	}
	static fromComponent = componentToVector2
}

export function clamp(val: number, min: number, max: number) {
	if (min > max) return Math.max(max, Math.min(min, val))
	else return Math.max(min, Math.min(max, val))
}

export function transformsCollide(eid1: number, eid2: number) {
	return aabbCollide(
		Transform.x[eid1],
		Transform.y[eid1],
		Transform.width[eid1],
		Transform.height[eid1],
		Transform.x[eid2],
		Transform.y[eid2],
		Transform.width[eid2],
		Transform.height[eid2]
	)
}

export function aabbCollide(
	x1: number,
	y1: number,
	w1: number,
	h1: number,
	x2: number,
	y2: number,
	w2: number,
	h2: number
) {
	return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
}

export class Angle {
	static add(a: number, b: number) {
		return (a + b) % PI_2
	}
	static flip(a: number) {
		return (a + Math.PI) % PI_2
	}
	static diff = differenceAngles
	static fromVector({ x, y }: Vector2) {
		return Math.atan2(y, x)
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
export function easeInExpo(x: number): number {
	return x === 0 ? 0 : 2 ** (10 * x - 10)
}
