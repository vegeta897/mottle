// TODO: Use @pixi/math and @pixi/math-extras

import { Transform } from './ecs/components'

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
	static equals({ x: x1, y: y1 }: Vector2, { x: x2, y: y2 }: Vector2) {
		return x1 === x2 && y1 === y2
	}
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

export function clamp(val: number, min: number, max: number) {
	return Math.max(min, Math.min(max, val))
}

export function alignToGrid(val: number, gridSize: number): number {
	return Math.floor(val / gridSize) * gridSize
}
