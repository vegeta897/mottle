import { defineComponent, Types } from 'bitecs'

const Vector2 = {
	x: Types.f32,
	y: Types.f32,
}

export const Player = defineComponent({ ...Vector2, painting: Types.i8 })

export const Velocity = defineComponent(Vector2)

export const Force = defineComponent({ ...Vector2, maxSpeed: Types.f32 })

export const Drag = defineComponent({ rate: Types.f32 })
