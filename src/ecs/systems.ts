import {
	addComponent,
	defineQuery,
	defineSystem,
	Not,
	removeComponent,
} from 'bitecs'
import { Drag, Force, Player, Transform, Velocity } from './components'
import { clamp, easeInCubic, easeOutCubic, easeOutSine, Vector2 } from '../util'
import { paintLine, DisplayObjects } from '../pixi/object_manager'
import InputManager from '../input'
import { DEFAULT_ZOOM, PixiApp } from '../pixi/pixi_app'
import { player } from '../'
import { deleteThing, getThings, onViewportChange } from '../level'

const { mouse } = InputManager.shared

export const inputSystem = defineSystem((world) => {
	mouse.local = PixiApp.shared.viewport.toLocal(mouse.data.global)
	mouse.leftButton = !!(mouse.data.buttons & 1)
	mouse.rightButton = !!(mouse.data.buttons & 2)
	return world
})

const RUN_SPEED = 3 // Pixels per tick
const ACCELERATION = 0.8
const PAINT_FACTOR = 1.5

const playerQuery = defineQuery([Player])

// Maybe ignore deltaMagnitude, just use constant speeds
export const playerSystem = defineSystem((world) => {
	for (let eid of playerQuery(world)) {
		if ((mouse.leftButton || mouse.rightButton) && mouse.startedInBounds) {
			Player.painting[eid] = mouse.rightButton ? 1 : 0
			const delta = {
				x: mouse.local.x - Transform.x[eid],
				y: mouse.local.y - Transform.y[eid],
			}
			const deltaMagnitude = Vector2.getMagnitude(delta)
			const accelerationFactor = easeOutSine(
				Math.max(0, Math.min(1, (deltaMagnitude - 8) / 64))
			)
			if (accelerationFactor === 0) {
				removeComponent(world, Force, eid)
				continue
			}
			const paintFactor = mouse.rightButton ? PAINT_FACTOR : 1
			const force = Vector2.normalize(
				delta,
				deltaMagnitude,
				ACCELERATION * paintFactor
			)
			addComponent(world, Force, eid)
			Force.maxSpeed[eid] = RUN_SPEED * accelerationFactor * paintFactor
			Force.x[eid] = force.x
			Force.y[eid] = force.y
		} else {
			removeComponent(world, Force, eid)
		}
	}
	return world
})

const forceQuery = defineQuery([Force, Velocity])

export const forceSystem = defineSystem((world) => {
	for (let eid of forceQuery(world)) {
		let velocity = {
			x: Velocity.x[eid] + Force.x[eid],
			y: Velocity.y[eid] + Force.y[eid],
		}
		const magnitude = Vector2.getMagnitude(velocity)
		if (magnitude > Force.maxSpeed[eid]) {
			velocity = Vector2.multiply(velocity, Force.maxSpeed[eid] / magnitude)
		}
		Velocity.x[eid] = velocity.x
		Velocity.y[eid] = velocity.y
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
		Transform.x[eid] += Velocity.x[eid]
		Transform.y[eid] += Velocity.y[eid]
		const displayObject = DisplayObjects[eid]
		if (displayObject) {
			displayObject.x = Math.floor(Transform.x[eid])
			displayObject.y = Math.floor(Transform.y[eid])
		}
		if (Velocity.x[eid] !== 0 || Velocity.y[eid] !== 0) {
			if (Player.painting[eid]) paintLine(displayObject)
		}
	}
	return world
})

export const pickupSystem = defineSystem((world) => {
	// Get list of things from sector(s), check distance of each thing
	const playerSprite = DisplayObjects[player]
	getThings(playerSprite).forEach((thing) => {
		const thingX = Transform.x[thing]
		const thingY = Transform.y[thing]
		if (
			Math.abs(thingX - Transform.x[player]) < 8 + 4 &&
			Math.abs(thingY - Transform.y[player]) < 8 + 4
		) {
			console.log('picked up thing', thing)
			deleteThing(thing)
		}
	})
	return world
})

let viewFollowSpeed = 0
const FOLLOW_ACCELERATION = 0.8
const { viewport } = PixiApp.shared

export const cameraSystem = defineSystem((world) => {
	if (PixiApp.shared.dirtyView) {
		onViewportChange()
		PixiApp.shared.dirtyView = false
	}
	const velocityMagnitude = Vector2.getMagnitude({
		x: Velocity.x[player],
		y: Velocity.y[player],
	})
	viewport.setZoom(
		clamp(
			DEFAULT_ZOOM -
				(DEFAULT_ZOOM - 1) *
					easeInCubic(Math.max(0, velocityMagnitude - RUN_SPEED) / RUN_SPEED),
			viewport.scaled - 0.005, // Zoom out slowly
			viewport.scaled + (DEFAULT_ZOOM - viewport.scaled) * 0.05 // Ease zoom back in
		),
		true
	)
	if (
		viewFollowSpeed - velocityMagnitude <
		-viewFollowSpeed * FOLLOW_ACCELERATION
	) {
		viewFollowSpeed++
	} else if (
		viewFollowSpeed - velocityMagnitude >
		viewFollowSpeed * FOLLOW_ACCELERATION
	) {
		viewFollowSpeed--
	}
	const thisFollowSpeed = viewFollowSpeed * FOLLOW_ACCELERATION
	const playerSprite = DisplayObjects[player]
	let cameraDistance = Vector2.getMagnitude({
		x: viewport.center.x - playerSprite.x,
		y: viewport.center.y - playerSprite.y,
	})
	if (cameraDistance < 0.5) cameraDistance = 0
	const minimumSpeed = easeOutCubic(Math.min(100, cameraDistance) / 100)
	viewport.follow(playerSprite, {
		speed: Math.max(minimumSpeed * 5, thisFollowSpeed),
	})
	return world
})
