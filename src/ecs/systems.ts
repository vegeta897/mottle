import {
	addComponent,
	Changed,
	defineQuery,
	hasComponent,
	removeComponent,
	System,
} from 'bitecs'
import {
	AreaConstraint,
	Drag,
	Force,
	OnPath,
	PaintBucket,
	Player,
	Transform,
	Velocity,
} from './components'
import { clamp, Vector2 } from '../util'
import InputManager from '../input'
import { PixiApp } from '../pixi/pixi_app'
import { player, playerLeft, playerRight, playerSprite } from '../'
import { getShapeAt, PaintBucketStates, shapes } from '../level'
import Prando from 'prando'
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

const rng = new Prando()

const paintBucketQuery = defineQuery([PaintBucket])

export const paintBucketSystem: System = (world) => {
	for (let eid of paintBucketQuery(world)) {
		if (PaintBucket.state[eid] === PaintBucketStates.SLEEP) continue
		if (
			PaintBucket.state[eid] === PaintBucketStates.IDLE &&
			PaintBucket.stateTime[eid] === 60
		) {
			PaintBucket.state[eid] = PaintBucketStates.WALK
			PaintBucket.stateTime[eid] = 0
			addComponent(world, Force, eid)
			Force.x[eid] = (rng.nextBoolean() ? 1 : -1) * 0.1
			Force.y[eid] = (rng.nextBoolean() ? 1 : -1) * 0.1
		} else if (
			PaintBucket.state[eid] === PaintBucketStates.WALK &&
			PaintBucket.stateTime[eid] === 100
		) {
			PaintBucket.state[eid] = PaintBucketStates.IDLE
			PaintBucket.stateTime[eid] = 0
			removeComponent(world, Force, eid)
		}
		PaintBucket.stateTime[eid]++
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
		if (eid === player && hasComponent(world, OnPath, eid)) {
			const toNextPoint = Vector2.subtract(
				{ x: OnPath.endX[eid], y: OnPath.endY[eid] },
				{ x: Transform.x[eid], y: Transform.y[eid] }
			)
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

function setSegment(shape: typeof shapes[number]) {
	const segment = shape.segments[OnPath.segmentIndex[player]]
	Transform.x[player] = segment.start.x
	Transform.y[player] = segment.start.y
	OnPath.startX[player] = segment.start.x
	OnPath.startY[player] = segment.start.y
	OnPath.endX[player] = segment.end.x
	OnPath.endY[player] = segment.end.y
	OnPath.segmentLength[player] = segment.length
}

export const shapeSystem: System = (world) => {
	if (hasComponent(world, OnPath, player)) {
		// Replace this with length travelled check
		const nextPoint = new Point(OnPath.endX[player], OnPath.endY[player])
		const pointFromPlayer = nextPoint.subtract({
			x: Transform.x[player],
			y: Transform.y[player],
		})
		if (pointFromPlayer.magnitudeSquared() < 4) {
			OnPath.segmentIndex[player]++
			const shape = shapes[OnPath.shapeIndex[player]]
			if (OnPath.segmentIndex[player] === shape.segments.length) {
				// Shape complete
				shape.complete = true
				paintLine({ x: OnPath.endX[player], y: OnPath.endY[player] }, false, 20)
				Player.painting[player] = 0
				Drag.rate[player] = 0.2
				removeComponent(world, OnPath, player)
			} else {
				setSegment(shape)
			}
		}
	} else {
		const shape = getShapeAt({ x: Transform.x[player], y: Transform.y[player] })
		if (shape) {
			Player.painting[player] = 1
			Drag.rate[player] = 0.1
			addComponent(world, OnPath, player)
			OnPath.shapeIndex[player] = shape.index
			OnPath.segmentIndex[player] = 0
			setSegment(shape)
		}
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
