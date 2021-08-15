import { defineComponent, Types } from 'bitecs'

const Vector2 = {
	x: Types.f32,
	y: Types.f32,
}

export const Player = defineComponent(Vector2)

export const MoveTo = defineComponent(Vector2)
