import {
	addComponent,
	defineQuery,
	defineSystem,
	Not,
	removeComponent,
} from 'bitecs'
import {
	AreaConstraint,
	DisplayObject,
	Drag,
	Force,
	Player,
	Transform,
	Velocity,
} from './components'
import { clamp, transformsCollide, Vector2 } from '../util'
import { DisplayObjects } from '../pixi/object_manager'
import InputManager from '../input'
import { PixiApp } from '../pixi/pixi_app'
import { player, playerSprite, updatePlayerColor } from '../'
import { deleteThing, getThings, onViewportChange } from '../level'

const { mouse } = InputManager.shared

export const inputSystem = defineSystem((world) => {
	mouse.global = mouse.data.global
	mouse.local = PixiApp.shared.viewport.toLocal(mouse.global)
	mouse.leftButton = mouse.startedInBounds && !!(mouse.data.buttons & 1)
	mouse.rightButton = mouse.startedInBounds && !!(mouse.data.buttons & 2)
	return world
})

const RUN_SPEED = 3 // Pixels per tick
const ACCELERATION = 0.8
const PAINT_FACTOR = 1.5 // Speed and acceleration multiplier

export const playerSystem = defineSystem((world) => {
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
		Player.paint[player]--
		if (Player.paint[player] === 0) Player.painting[player] = 0
		updatePlayerColor()
	}
	const delta = {
		x: mouse.local.x - Transform.x[player],
		y: mouse.local.y - Transform.y[player],
	}
	const deltaMagnitude = Vector2.getMagnitude(delta)
	if (deltaMagnitude < 12 * viewport.scaled) {
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
})

// TODO: Turning while painting regains some momentum, like in roller-blading

const forceQuery = defineQuery([Force, Velocity])

export const forceSystem = defineSystem((world) => {
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
})

const dragQuery = defineQuery([Drag, Velocity, Not(Force)])

export const dragSystem = defineSystem((world) => {
	for (let eid of dragQuery(world)) {
		Velocity.x[eid] *= 1 - Drag.rate[eid]
		Velocity.y[eid] *= 1 - Drag.rate[eid]
		if (Math.abs(Velocity.x[eid]) < 0.1) Velocity.x[eid] = 0
		if (Math.abs(Velocity.y[eid]) < 0.1) Velocity.y[eid] = 0
	}
	return world
})

const velocityQuery = defineQuery([Transform, Velocity])

export const velocitySystem = defineSystem((world) => {
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
})

const areaConstraintQuery = defineQuery([Transform, AreaConstraint])

export const areaConstraintSystem = defineSystem((world) => {
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
})

export const pickupSystem = defineSystem((world) => {
	getThings({ x: Transform.x[player], y: Transform.y[player] }).forEach(
		(thing) => {
			if (transformsCollide(player, thing)) {
				Player.paint[player] += 75
				updatePlayerColor()
				deleteThing(thing)
			}
		}
	)
	return world
})

const spriteQuery = defineQuery([Transform, DisplayObject])

export const spriteSystem = defineSystem((world) => {
	for (let eid of spriteQuery(world)) {
		DisplayObjects[eid].x = Math.floor(Transform.x[eid])
		DisplayObjects[eid].y = Math.floor(Transform.y[eid])
	}
	return world
})

const { viewport } = PixiApp.shared

export const cameraSystem = defineSystem((world) => {
	onViewportChange()
	viewport.moveCenter(playerSprite.x + 192, viewport.worldScreenHeight / 2 - 12)
	return world
})
