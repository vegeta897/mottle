import { defineComponent, Types } from 'bitecs'

const Vector2 = {
	x: Types.f32,
	y: Types.f32,
}

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

export const PaintBucket = defineComponent({
	state: Types.ui8,
	stateTime: Types.ui32,
})

// TODO: Make this a singleton, it doesn't need to be a component
// Same for Player too probably
export const OnPath = defineComponent({
	shapeIndex: Types.ui32,
	segmentIndex: Types.ui32,
	startX: Types.f32,
	startY: Types.f32,
	endX: Types.f32,
	endY: Types.f32,
	segmentLength: Types.f32,
})
