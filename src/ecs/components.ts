import { defineComponent, Types } from 'bitecs'

const Vector2 = {
	x: Types.f32,
	y: Types.f32,
}

export const Player = defineComponent({ painting: Types.ui16 })

export const Transform = defineComponent(Vector2)

export const Velocity = defineComponent({ ...Vector2, speed: Types.f32 })

export const Force = defineComponent({ ...Vector2, maxSpeed: Types.f32 })

export const Drag = defineComponent({ rate: Types.f32 })
