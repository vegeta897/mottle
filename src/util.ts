// TODO: Use @pixi/math-extras

import { Transform } from './ecs/components'
import { PI_2 } from 'pixi.js'

export class Vector2 {
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
	static multiply({ x, y }: Vector2, scalar: number) {
		return { x: x * scalar, y: y * scalar }
	}
	x: number
	y: number
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
	static subtract(
		{ x: x1, y: y1 }: Vector2,
		{ x: x2, y: y2 }: Vector2
	): Vector2 {
		return { x: x1 - x2, y: y1 - y2 }
	}
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

// Modulo that always gives positive result
function mod(x: number, mod: number) {
	return ((x % mod) + mod) % mod
}

export class Angle {
	static add(a: number, b: number) {
		return (a + b) % PI_2
	}
	static flip(a: number) {
		return (a + Math.PI) % PI_2
	}
	// Normalize angle to [-Math.PI, Math.PI)
	// Adapted from https://github.com/infusion/Angles.js (see LICENSE file)
	static normalizeHalf(a: number) {
		return mod(a + Math.PI, PI_2) - Math.PI
	}
	// Smallest diff between 2 angles (result is always positive)
	// Adapted from https://github.com/infusion/Angles.js (see LICENSE file)
	static diff(a: number, b: number) {
		let diff = Angle.normalizeHalf(a - b)
		if (diff > Math.PI) diff = diff - Math.PI
		return Math.abs(diff)
	}
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
