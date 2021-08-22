import {
	addComponent,
	defineQuery,
	defineSystem,
	Not,
	removeComponent,
} from 'bitecs'
import { Drag, Force, Player, Transform, Velocity } from './components'
import { clamp, easeInCubic, Vector2 } from '../util'
import { paintLine, DisplayObjects } from '../pixi/object_manager'
import InputManager from '../input'
import { DEFAULT_ZOOM, PixiApp } from '../pixi/pixi_app'
import {
	easedPaintRemaining,
	player,
	playerSprite,
	updatePlayerColor,
} from '../'
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
	// TODO: Left/Right buttons aren't mobile-friendly, maybe always paint when moving
	if (mouse.rightButton) {
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
	} else {
		Player.painting[player] = 0
		if (!mouse.leftButton) {
			removeComponent(world, Force, player)
			return world
		}
	}
	const delta = {
		x: mouse.global.x - viewport.screenWidth / 2,
		y: mouse.global.y - viewport.screenHeight / 2,
	}
	const deltaMagnitude = Vector2.getMagnitude(delta)
	if (deltaMagnitude < 12 * viewport.scaled) {
		removeComponent(world, Force, player)
	} else {
		const momentumFactor = clamp(Velocity.speed[player] / 3, 0.3, 1)
		const paintFactor =
			mouse.rightButton && Player.paint[player] ? PAINT_FACTOR : 1
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
		const displayObject = DisplayObjects[eid]
		if (displayObject) {
			displayObject.x = Math.floor(Transform.x[eid])
			displayObject.y = Math.floor(Transform.y[eid])
		}
	}
	if (
		(Velocity.x[player] !== 0 || Velocity.y[player] !== 0) &&
		Player.painting[player] &&
		Player.paint[player]
	) {
		const paintRemaining = easedPaintRemaining()
		paintLine(playerSprite, Player.painting[player] === 1, paintRemaining)
	}
	return world
})

export const pickupSystem = defineSystem((world) => {
	getThings(playerSprite).forEach((thing) => {
		const thingX = Transform.x[thing]
		const thingY = Transform.y[thing]
		if (
			Math.abs(thingX - Transform.x[player]) < 12 + 12 &&
			Math.abs(thingY - Transform.y[player]) < 12 + 12
		) {
			Player.paint[player] += 75
			updatePlayerColor()
			deleteThing(thing)
		}
	})
	return world
})

const { viewport } = PixiApp.shared

export const cameraSystem = defineSystem((world) => {
	if (PixiApp.shared.dirtyView) {
		onViewportChange()
		PixiApp.shared.dirtyView = false
	}
	viewport.setZoom(
		clamp(
			DEFAULT_ZOOM -
				(DEFAULT_ZOOM - 1) *
					easeInCubic(
						Math.max(0, Velocity.speed[player] - RUN_SPEED) / RUN_SPEED
					),
			viewport.scaled - 0.005, // Zoom out slowly
			viewport.scaled + (DEFAULT_ZOOM - viewport.scaled) * 0.05 // Ease zoom back in
		),
		true
	)
	return world
})
