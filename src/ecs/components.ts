import { ComponentType, defineComponent, Types } from 'bitecs'
import { Vector2 } from '../util'

const Vector2C = {
	x: Types.f32,
	y: Types.f32,
}

export function setComponentXY(
	component: ComponentType<typeof Vector2C>,
	entity: number,
	{ x, y }: Vector2
): void {
	component.x[entity] = x
	component.y[entity] = y
}

export function componentToVector2(
	component: ComponentType<typeof Vector2C>,
	entity: number
): Vector2 {
	return { x: component.x[entity], y: component.y[entity] }
}

export function updateSpeed(eid: number) {
	Velocity.speed[eid] = Vector2.getMagnitude(componentToVector2(Velocity, eid))
}

// TODO: Move to singleton object
export const Player = defineComponent({
	pointerDelta: { magnitude: Types.f32, ...Vector2C },
})

export const Painting = defineComponent({
	ticks: Types.ui32,
	speed: Types.f32,
	drift: Types.f32,
})

export const Transform = defineComponent({
	...Vector2C,
	width: Types.f32,
	height: Types.f32,
	z: Types.f32,
})

export const Velocity = defineComponent({ ...Vector2C, speed: Types.f32 })

export const Force = defineComponent(Vector2C)

export const Drag = defineComponent({ rate: Types.f32 })

export const Jump = defineComponent({
	...Vector2C,
	height: Types.f32,
	duration: Types.ui32,
	progress: Types.ui32,
})

export const AreaConstraint = defineComponent({
	top: Types.i32,
	bottom: Types.i32,
	left: Types.i32,
	right: Types.i32,
})

export const DisplayObject = defineComponent()
