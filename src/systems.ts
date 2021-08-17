import {
	addComponent,
	defineQuery,
	defineSystem,
	Not,
	removeComponent,
} from 'bitecs'
import { Drag, Force, Player, Velocity } from './components'
import { easeOutSine, Vector2 } from './util'
import { addSplat, DisplayObjects } from './pixi/object_manager'
import InputManager from './input'
import { PixiApp } from './pixi/pixi_app'

const { mouse } = InputManager.shared

export const inputSystem = defineSystem((world) => {
	mouse.local = PixiApp.shared.viewport.toLocal(mouse.data.global)
	mouse.leftButton = !!(mouse.data.buttons & 1)
	mouse.rightButton = !!(mouse.data.buttons & 2)
	return world
})

const MAX_SPEED = 3 // Pixels per tick
const ACCELERATION = 0.8
const PAINT_FACTOR = 1.5

const playerQuery = defineQuery([Player])

export const playerSystem = defineSystem((world) => {
	for (let eid of playerQuery(world)) {
		if ((mouse.leftButton || mouse.rightButton) && mouse.startedInBounds) {
			Player.painting[eid] = mouse.rightButton ? 1 : 0
			const delta = {
				x: mouse.local.x - Player.x[eid],
				y: mouse.local.y - Player.y[eid],
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
			Force.maxSpeed[eid] = MAX_SPEED * accelerationFactor * paintFactor
			Force.x[eid] = force.x
			Force.y[eid] = force.y
		} else if (!mouse.leftButton) {
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

const velocityQuery = defineQuery([Player, Velocity])

export const velocitySystem = defineSystem((world) => {
	for (let eid of velocityQuery(world)) {
		Player.x[eid] += Velocity.x[eid]
		Player.y[eid] += Velocity.y[eid]
		const displayObject = DisplayObjects[eid]
		displayObject.x = Player.x[eid]
		displayObject.y = Player.y[eid]
		if (Player.painting[eid])
			addSplat({
				x: Math.round(Player.x[eid] / 8) * 8,
				y: Math.round(Player.y[eid] / 8) * 8,
			})
	}
	return world
})
