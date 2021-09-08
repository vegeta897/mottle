import {
	addComponent,
	Changed,
	defineQuery,
	Not,
	removeComponent,
	removeEntity,
	System,
} from 'bitecs'
import {
	AreaConstraint,
	DisplayObject,
	Drag,
	Force,
	PaintBall,
	PaintBucket,
	Player,
	Transform,
	Velocity,
} from './components'
import { clamp, transformsCollide, Vector2 } from '../util'
import InputManager from '../input'
import { PixiApp } from '../pixi/pixi_app'
import { player } from '../'
import { PaintBucketStates, spillBucket } from '../level'
import Prando from 'prando'
import { DisplayObjects } from '../pixi/object_manager'
import { paintGround } from '../paint'

const { mouse } = InputManager.shared

export const inputSystem: System = (world) => {
	mouse.global = mouse.data.global
	mouse.local = PixiApp.shared.viewport.toLocal(mouse.global)
	mouse.leftButton = mouse.startedInBounds && !!(mouse.data.buttons & 1)
	mouse.rightButton = mouse.startedInBounds && !!(mouse.data.buttons & 2)
	return world
}

const RUN_SPEED = 3 // Pixels per tick
const ACCELERATION = 0.8
const PAINT_FACTOR = 1.5 // Speed and acceleration multiplier

export const playerSystem: System = (world) => {
	if (!mouse.leftButton) {
		removeComponent(world, Force, player)
		return world
	}
	if (Player.paint[player] > 0) {
		if (Player.painting[player] === 0) {
			// Not already painting
		} else {
			Player.painting[player]++
		}
		Player.painting[player]++
		// Player.paint[player]--
		if (Player.paint[player] === 0) Player.painting[player] = 0
	}
	const delta = {
		x: mouse.local.x - Transform.x[player],
		y: mouse.local.y - Transform.y[player],
	}
	const deltaMagnitude = Vector2.getMagnitude(delta)
	if (deltaMagnitude < 12 * PixiApp.shared.viewport.scaled) {
		removeComponent(world, Force, player)
	} else {
		const momentumFactor = clamp(Velocity.speed[player] / 3, 0.3, 1)
		const paintFactor = Player.paint[player] ? PAINT_FACTOR : 1
		const force = Vector2.normalize(
			delta,
			deltaMagnitude,
			ACCELERATION * paintFactor
		)
		addComponent(world, Force, player)
		Force.maxSpeed[player] = RUN_SPEED * paintFactor
		Force.x[player] = force.x * momentumFactor
		Force.y[player] = force.y * momentumFactor
	}
	return world
}

const rng = new Prando()

const paintBucketQuery = defineQuery([PaintBucket])

// TODO: Slo-mo right before and during impact?
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
			Force.maxSpeed[eid] = 0.7
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

// TODO: Turning while painting regains some momentum, like in roller-blading

const forceQuery = defineQuery([Force, Velocity])

export const forceSystem: System = (world) => {
	for (let eid of forceQuery(world)) {
		let newVelocity = {
			x: Velocity.x[eid] + Force.x[eid],
			y: Velocity.y[eid] + Force.y[eid],
		}
		const newSpeed = Vector2.getMagnitude(newVelocity)
		if (newSpeed > Force.maxSpeed[eid]) {
			newVelocity = Vector2.multiply(
				newVelocity,
				Force.maxSpeed[eid] / newSpeed
			)
		}
		Velocity.x[eid] = newVelocity.x
		Velocity.y[eid] = newVelocity.y
	}
	return world
}

const dragQuery = defineQuery([Drag, Velocity, Not(Force)])

export const dragSystem: System = (world) => {
	for (let eid of dragQuery(world)) {
		if (Velocity.x[eid] === 0 && Velocity.y[eid] === 0) continue
		Velocity.x[eid] *= 1 - Drag.rate[eid]
		Velocity.y[eid] *= 1 - Drag.rate[eid]
		if (Math.abs(Velocity.x[eid]) < 0.01) Velocity.x[eid] = 0
		if (Math.abs(Velocity.y[eid]) < 0.01) Velocity.y[eid] = 0
	}
	return world
}

const velocityQuery = defineQuery([Transform, Velocity])

export const velocitySystem: System = (world) => {
	for (let eid of velocityQuery(world)) {
		Velocity.speed[eid] = Vector2.getMagnitude({
			x: Velocity.x[eid],
			y: Velocity.y[eid],
		})
		Transform.x[eid] += Velocity.x[eid]
		Transform.y[eid] += Velocity.y[eid]
	}
	// if (
	// 	(Velocity.x[player] !== 0 || Velocity.y[player] !== 0) &&
	// 	Player.painting[player] &&
	// 	Player.paint[player]
	// ) {
	// 	const paintRemaining = easedPaintRemaining()
	// 	paintLine(playerSprite, Player.painting[player] === 1, paintRemaining)
	// }
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

export const collisionSystem: System = (world) => {
	if (Velocity.speed[player] < 3) return world
	for (let eid of paintBucketQuery(world)) {
		if (
			PaintBucket.state[eid] !== PaintBucketStates.SPILL &&
			transformsCollide(player, eid)
		) {
			Player.paint[player] += 75
			spillBucket(eid, Velocity.x[player], Velocity.y[player])
		}
	}
	return world
}

const paintBallQuery = defineQuery([PaintBall, DisplayObject])

export const paintBallSystem: System = (world) => {
	for (let eid of paintBallQuery(world)) {
		const tilesPainted = paintGround(
			{ x: Transform.x[eid], y: Transform.y[eid] },
			PaintBall.paint[eid] * 2
		)
		Drag.rate[eid] = tilesPainted ? 0.05 : 0.01
		PaintBall.paint[eid] = Math.max(0, PaintBall.paint[eid] - tilesPainted)
		if (PaintBall.paint[eid] === 0 || Velocity.speed[eid] === 0) {
			DisplayObjects[eid].destroy()
			delete DisplayObjects[eid]
			removeEntity(world, eid)
		} else {
			DisplayObjects[eid].scale.x = PaintBall.paint[eid] * 0.1
			DisplayObjects[eid].scale.y = PaintBall.paint[eid] * 0.1
		}
	}
	return world
}
