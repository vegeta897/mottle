import {
	addComponent,
	Changed,
	defineQuery,
	removeComponent,
	System,
} from 'bitecs'
import {
	AreaConstraint,
	Drag,
	Force,
	Player,
	Transform,
	Velocity,
} from './components'
import { clamp, Vector2 } from '../util'
import InputManager from '../input'
import { PixiApp } from '../pixi/pixi_app'
import { player, playerLeft, playerRight, playerSprite } from '../'
import {
	getNextSegment,
	getSegmentEnd,
	getSegmentStart,
	getShapeAt,
	Level,
} from '../level'
import { paintLine } from '../paint'
import '@pixi/math-extras'
import { Point } from '@pixi/math'

const { mouse } = InputManager.shared

export const inputSystem: System = (world) => {
	mouse.global = mouse.data.global
	mouse.local = PixiApp.shared.toLocal(mouse.data.global)
	mouse.leftButton = mouse.startedInBounds && !!(mouse.data.buttons & 1)
	mouse.rightButton = mouse.startedInBounds && !!(mouse.data.buttons & 2)
	return world
}

const ACCELERATION = 1

export const playerSystem: System = (world) => {
	if (!mouse.leftButton) {
		removeComponent(world, Force, player)
		return world
	}
	const delta = {
		x: mouse.local.x - Transform.x[player],
		y: mouse.local.y - Transform.y[player],
	}
	if (delta.x > 0) {
		playerSprite.texture = playerRight
	} else {
		playerSprite.texture = playerLeft
	}
	const deltaMagnitude = Vector2.getMagnitude(delta)
	if (deltaMagnitude < 16) {
		removeComponent(world, Force, player)
	} else {
		const force = Vector2.normalize(
			delta,
			deltaMagnitude,
			ACCELERATION * Math.min(1, (deltaMagnitude - 12) / 32)
		)
		addComponent(world, Force, player)
		Force.x[player] = force.x
		Force.y[player] = force.y
	}
	return world
}

const forceQuery = defineQuery([Force, Velocity])

export const forceSystem: System = (world) => {
	for (let eid of forceQuery(world)) {
		let newVelocity = {
			x: Velocity.x[eid] + Force.x[eid],
			y: Velocity.y[eid] + Force.y[eid],
		}
		Velocity.speed[eid] = Vector2.getMagnitude(newVelocity)
		Velocity.x[eid] = newVelocity.x
		Velocity.y[eid] = newVelocity.y
	}
	return world
}

const velocityQuery = defineQuery([Transform, Velocity])

export const velocitySystem: System = (world) => {
	for (let eid of velocityQuery(world)) {
		if (eid === player && Level.segment) {
			// TODO: Allow slight deviation from path
			const toNextPoint = Vector2.subtract(getSegmentEnd(), {
				x: Transform.x[eid],
				y: Transform.y[eid],
			})
			const velocityPoint = new Point(Velocity.x[eid], Velocity.y[eid])
			const projected = velocityPoint.project(toNextPoint)
			Velocity.x[eid] = clamp(projected.x, 0, toNextPoint.x)
			Velocity.y[eid] = clamp(projected.y, 0, toNextPoint.y)
			Velocity.speed[eid] = Vector2.getMagnitude({
				x: Velocity.x[eid],
				y: Velocity.y[eid],
			})
		}
		Transform.x[eid] += Velocity.x[eid]
		Transform.y[eid] += Velocity.y[eid]
	}
	return world
}

const MIN_SPEED = 0.2

const dragQuery = defineQuery([Drag, Velocity])

export const dragSystem: System = (world) => {
	for (let eid of dragQuery(world)) {
		if (Velocity.speed[eid] === 0) continue
		if (Velocity.speed[eid] < MIN_SPEED) {
			Velocity.x[eid] = 0
			Velocity.y[eid] = 0
			Velocity.speed[eid] = 0
		} else {
			Velocity.x[eid] *= 1 - Drag.rate[eid]
			Velocity.y[eid] *= 1 - Drag.rate[eid]
			Velocity.speed[eid] = Vector2.getMagnitude({
				x: Velocity.x[eid],
				y: Velocity.y[eid],
			})
		}
	}
	return world
}

const areaConstraintQuery = defineQuery([Changed(Transform), AreaConstraint])

export const areaConstraintSystem: System = (world) => {
	for (let eid of areaConstraintQuery(world)) {
		Transform.x[eid] = clamp(
			Transform.x[eid],
			AreaConstraint.left[eid] + Transform.width[eid] / 2,
			AreaConstraint.right[eid] - Transform.width[eid] / 2
		)
		Transform.y[eid] = clamp(
			Transform.y[eid],
			AreaConstraint.top[eid] + Transform.height[eid] / 2,
			AreaConstraint.bottom[eid] - Transform.height[eid] / 2
		)
	}
	return world
}

export const shapeSystem: System = (world) => {
	if (Level.shape && Level.segment) {
		// Replace this with length travelled check
		const nextPoint = new Point().copyFrom(getSegmentEnd())
		const pointFromPlayer = nextPoint.subtract({
			x: Transform.x[player],
			y: Transform.y[player],
		})
		if (pointFromPlayer.magnitudeSquared() < 4) {
			Level.segment.complete = true
			const nextSegment = getNextSegment()
			if (nextSegment && !nextSegment.complete) {
				Level.segment = nextSegment
				Transform.x[player] = getSegmentStart().x
				Transform.y[player] = getSegmentStart().y
			} else {
				// Shape complete
				Level.shape.complete = true
				paintLine(getSegmentEnd(), false, 20)
				Player.painting[player] = 0
				Drag.rate[player] = 0.2
				Level.shape = null
				Level.segment = null
			}
		}
	} else if (
		Velocity.speed[player] > 0 &&
		getShapeAt(
			{ x: Transform.x[player], y: Transform.y[player] },
			{ x: Velocity.x[player], y: Velocity.y[player] }
		)
	) {
		Player.painting[player] = 1
		Drag.rate[player] = 0.1
		Transform.x[player] = Level.shape!.start.x
		Transform.y[player] = Level.shape!.start.y
	}

	if (Player.painting[player] > 0) {
		paintLine(
			{ x: Transform.x[player], y: Transform.y[player] },
			Player.painting[player] === 1,
			20
		)
		Player.painting[player]++
	}
	return world
}
