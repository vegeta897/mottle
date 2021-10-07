import { defineComponent, Types } from 'bitecs'

const Vector2 = {
	x: Types.f32,
	y: Types.f32,
}

// TODO: Move to singleton object
export const Player = defineComponent({ painting: Types.ui32 })

export const Transform = defineComponent({
	...Vector2,
	width: Types.f32,
	height: Types.f32,
})

export const Velocity = defineComponent({ ...Vector2, speed: Types.f32 })

export const Force = defineComponent(Vector2)

export const Drag = defineComponent({ rate: Types.f32 })

export const AreaConstraint = defineComponent({
	top: Types.i32,
	bottom: Types.i32,
	left: Types.i32,
	right: Types.i32,
})

export const DisplayObject = defineComponent()
