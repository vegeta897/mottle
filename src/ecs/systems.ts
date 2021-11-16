import {
	addComponent,
	defineQuery,
	enterQuery,
	hasComponent,
	Not,
	removeComponent,
	System,
} from 'bitecs'
import {
	AreaConstraint,
	componentToVector2,
	Drag,
	Force,
	Jump,
	Painting,
	Player,
	setComponentXY,
	Transform,
	updateSpeed,
	Velocity,
} from './components'
import { Vector2 } from '../util'
import { circIn, circOut, cubicOut } from '@gamestdio/easing'
import InputManager from '../input'
import { PixiApp } from '../pixi/pixi_app'
import {
	cursorGraphic,
	player,
	playerLeft,
	playerRight,
	playerSprite,
} from '../'
import {
	getNextSegment,
	getSegmentEnd,
	getSegmentStart,
	getShapeAt,
	Level,
	updateLevel,
} from '../level'
import { paintLine } from '../paint'
import '@pixi/math-extras'
import { Point } from '@pixi/math'

const { spriteContainer } = PixiApp.shared

let levelScrollSpeed = 1 / 2
let ticksPerScroll = Math.round(1 / levelScrollSpeed)
let ticks = 0

export const scrollSystem: System = (world) => {
	ticks++
	if (ticks % ticksPerScroll === 0) {
		spriteContainer.x--
		updateLevel()
	}
	return world
}

const { mouse } = InputManager.shared

export const inputSystem: System = (world) => {
	mouse.global = mouse.data.global
	mouse.local = spriteContainer.toLocal(mouse.data.global)
	mouse.leftButton = mouse.startedInBounds && !!(mouse.data.buttons & 1)
	mouse.rightButton = mouse.startedInBounds && !!(mouse.data.buttons & 2)
	return world
}

const ACCELERATION = 1
const PAINT_ACCEL = 0.5
const MAX_PAINT_SPEED = 7

// Certain things cause camera to speed up, slow down, or stop
// Risk of starting to trace a shape that you don't have time to complete
// Canvas is like a big conveyor belt?

export const playerSystem: System = (world) => {
	const deltaPoint = new Point(
		mouse.local.x - Transform.x[player],
		mouse.local.y - Transform.y[player]
	)
	cursorGraphic.visible = false
	setComponentXY(Player.pointerDelta, player, deltaPoint)
	Player.pointerDelta.magnitude[player] = deltaPoint.magnitude()
	if (!mouse.leftButton || hasComponent(world, Jump, player)) {
		removeComponent(world, Force, player)
		return world
	}
	const aim = Level.segment ? getSegmentEnd().x : deltaPoint.x
	const middle = Level.segment ? Transform.x[player] : 0
	playerSprite.texture = aim > middle ? playerRight : playerLeft
	const deltaMagnitude = Player.pointerDelta.magnitude[player]
	if (deltaMagnitude < 16) {
		removeComponent(world, Force, player)
	} else if (!hasComponent(world, Painting, player)) {
		addComponent(world, Force, player)
		deltaPoint.multiplyScalar(1 / deltaMagnitude, deltaPoint) // Normalize
		const cursorPoint = new Point()
		deltaPoint.multiplyScalar(Math.min(40, deltaMagnitude), cursorPoint)
		cursorGraphic.setTransform(
			Transform.x[player] + cursorPoint.x,
			Transform.y[player] + cursorPoint.y
		)
		cursorGraphic.alpha = Math.min(1, (deltaMagnitude - 16) / 28)
		cursorGraphic.visible = true
		const deltaFactor = Math.min(1, (deltaMagnitude - 12) / 32)
		const force = deltaPoint.multiplyScalar(ACCELERATION * deltaFactor)
		setComponentXY(Force, player, force)
	}
	return world
}

export const paintingSystem: System = (world) => {
	if (!hasComponent(world, Painting, player) || !Level.segment) return world
	if (mouse.leftButton) {
		const deltaPoint = new Point(
			Player.pointerDelta.x[player],
			Player.pointerDelta.y[player]
		)
		const deltaMagnitude = Player.pointerDelta.magnitude[player]
		deltaPoint.multiplyScalar(1 / deltaMagnitude, deltaPoint) // Normalize
		const deltaFactor = Math.min(1, (deltaMagnitude - 12) / 32)
		const forward = Math.max(
			0,
			Level.segment.parallelPoint.dot(deltaPoint) *
				(Level.shape!.reverse ? -1 : 1)
		)
		const drift = Level.segment.perpendicularPoint.dot(deltaPoint)
		const driftAmount = cubicOut(Math.abs(drift) * deltaFactor)
		Painting.drift[player] += drift * driftAmount
		Painting.speed[player] = Math.min(
			Painting.speed[player] + PAINT_ACCEL * forward * deltaFactor,
			MAX_PAINT_SPEED
		)
	}

	Level.segment.progress = Math.min(
		1,
		Level.segment.progress + Painting.speed[player] / Level.segment.length
	)
	Painting.speed[player] = Math.max(0, Painting.speed[player] - PAINT_ACCEL / 3)
	const driftPoint = Level.segment.perpendicularPoint.multiplyScalar(
		Painting.drift[player]
	)
	Painting.drift[player] *= 0.8
	setComponentXY(
		Transform,
		player,
		Vector2.add(
			getSegmentStart(),
			Level.segment.parallelPoint.multiplyScalar(
				Level.segment.length *
					Level.segment.progress *
					(Level.shape!.reverse ? -1 : 1)
			),
			driftPoint
		)
	)
	return world
}

const forceQuery = defineQuery([Force, Velocity])

export const forceSystem: System = (world) => {
	for (let eid of forceQuery(world)) {
		let newVelocity = {
			x: Velocity.x[eid] + Force.x[eid],
			y: Velocity.y[eid] + Force.y[eid],
		}
		setComponentXY(Velocity, eid, newVelocity)
		updateSpeed(eid)
	}
	return world
}

const jumpQuery = defineQuery([Jump, Transform])
const enterJump = enterQuery(jumpQuery)

export const jumpSystem: System = (world) => {
	for (let eid of enterJump(world)) {
		addComponent(world, Velocity, eid)
		const delta = Vector2.subtract(
			componentToVector2(Jump, eid),
			componentToVector2(Transform, eid)
		)
		setComponentXY(
			Velocity,
			eid,
			Vector2.multiplyScalar(delta, 1 / Jump.duration[eid])
		)
		updateSpeed(eid)
	}
	for (let eid of jumpQuery(world)) {
		const progressFloat = (Jump.progress[eid] / Jump.duration[eid]) * 2
		if (progressFloat < 1) {
			Transform.z[eid] = circOut(progressFloat) * Jump.height[eid]
		} else {
			Transform.z[eid] =
				Jump.height[eid] - circIn(progressFloat - 1) * Jump.height[eid]
		}
		if (Jump.progress[eid] === Jump.duration[eid]) {
			removeComponent(world, Jump, eid)
			Transform.z[eid] = 0
		}
		Jump.progress[eid]++
	}
	return world
}

const velocityQuery = defineQuery([Transform, Velocity])

export const velocitySystem: System = (world) => {
	for (let eid of velocityQuery(world)) {
		Transform.x[eid] += Velocity.x[eid]
		Transform.y[eid] += Velocity.y[eid]
	}
	return world
}

const MIN_SPEED = 0.2

const dragQuery = defineQuery([Drag, Velocity, Not(Jump)])

export const dragSystem: System = (world) => {
	for (let eid of dragQuery(world)) {
		if (Velocity.speed[eid] === 0) continue
		if (Velocity.speed[eid] < MIN_SPEED) {
			setComponentXY(Velocity, eid, { x: 0, y: 0 })
			Velocity.speed[eid] = 0
		} else {
			Velocity.x[eid] *= 1 - Drag.rate[eid]
			Velocity.y[eid] *= 1 - Drag.rate[eid]
			updateSpeed(eid)
		}
	}
	return world
}

const areaConstraintQuery = defineQuery([Transform, AreaConstraint])

export const areaConstraintSystem: System = (world) => {
	for (let eid of areaConstraintQuery(world)) {
		const global = spriteContainer.toGlobal(componentToVector2(Transform, eid))
		const clamped = Vector2.applyAreaConstraint(global, eid)
		if (!Vector2.equals(global, clamped)) {
			if (eid === player && Level.shape && global.x < clamped.x) {
				// Fallen behind while painting
				Level.shape.complete = true
				Level.shape = null
				Level.segment = null
				removeComponent(world, Painting, player)
				addComponent(world, Velocity, player)
			}
			if (global.x > clamped.x) {
				// Ahead
				spriteContainer.x -= Math.ceil(global.x - clamped.x)
			}
			if (hasComponent(world, Velocity, eid)) {
				if (global.x < clamped.x) Velocity.x[eid] = levelScrollSpeed
				if (clamped.y !== global.y) Velocity.y[eid] = 0
				updateSpeed(eid)
			}
		}
		setComponentXY(Transform, eid, spriteContainer.toLocal(clamped))
	}
	return world
}

// TODO: Highlight nodes near cursor, use this for choosing start node

export const shapeSystem: System = (world) => {
	const inverseSpeedFactor = 1 - Math.min(1, Velocity.speed[player] / 4)
	if (Level.shape && Level.segment) {
		if (Level.segment.progress === 1) {
			Level.segment.complete = true
			const nextSegment = getNextSegment()
			if (nextSegment && !nextSegment.complete) {
				Level.segment = nextSegment
				setComponentXY(Transform, player, getSegmentStart())
				Painting.speed[player] *= 0.5
				Painting.drift[player] = 0
			} else {
				// Shape complete
				Level.shape.complete = true
				paintLine(componentToVector2(Transform, player), false, 20, true)
				Painting.ticks[player] = 0
				removeComponent(world, Painting, player)
				Level.shape = null
				Level.segment = null
			}
		} else if (
			Painting.ticks[player] === 0 &&
			!hasComponent(world, Jump, player)
		) {
			// Begin painting
			addComponent(world, Painting, player)
			Painting.speed[player] = 0
			Painting.drift[player] = 0
			Painting.ticks[player] = 1
		}
	} else if (
		mouse.leftButton &&
		Velocity.speed[player] > 0 &&
		getShapeAt(
			componentToVector2(Transform, player),
			componentToVector2(Velocity, player),
			(1 - inverseSpeedFactor) * 30
		)
	) {
		// Start shape
		removeComponent(world, Force, player)
		addComponent(world, Jump, player)
		setComponentXY(Jump, player, Level.shape!.start)
		Jump.duration[player] = 8 + inverseSpeedFactor * 16 // Ticks
		Jump.height[player] = 10 + inverseSpeedFactor * 10
		Jump.progress[player] = 0
	}

	if (Painting.ticks[player] > 0) {
		paintLine(
			componentToVector2(Transform, player),
			Painting.ticks[player] === 1,
			20
		)
		Painting.ticks[player]++
	}
	return world
}
