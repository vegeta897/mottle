import { Vector2 } from './util'
import Prando from 'prando'
import { addComponent, addEntity } from 'bitecs'
import Game from './game'
import { Transform } from './ecs/components'
import { Sprite, Texture } from 'pixi.js'
import { DisplayObjects } from './pixi/object_manager'
import { PixiApp } from './pixi/pixi_app'

const SECTOR_SIZE = 240

const { spriteContainer, viewport } = PixiApp.shared

type Sector = {
	things: number[] // Entity IDs
}

const sectors: Map<string, Sector> = new Map()
const thingToSector: Sector[] = []

const rng = new Prando()

export function onViewportChange() {
	const visibleSectors = getSectorsInBox(viewport, 4)
	visibleSectors.forEach((sector) => {
		const sectorGrid = Vector2.toString(sector)
		if (sectors.has(sectorGrid)) return
		const newSector: Sector = { things: [] }
		sectors.set(sectorGrid, newSector)
		const thingCount = rng.nextInt(0, 2)
		for (let i = 0; i < thingCount; i++) {
			const thingX = sector.x * SECTOR_SIZE + rng.nextInt(0, SECTOR_SIZE - 1)
			const thingY = sector.y * SECTOR_SIZE + rng.nextInt(0, SECTOR_SIZE - 1)
			const thing = addEntity(Game.shared.world)
			addComponent(Game.shared.world, Transform, thing)
			Transform.x[thing] = thingX
			Transform.y[thing] = thingY
			const thingSprite = new Sprite(Texture.WHITE)
			thingSprite.setTransform(thingX, thingY, 1.5, 1.5)
			thingSprite.anchor.x = 0.5
			thingSprite.anchor.y = 0.5
			thingSprite.tint = 0x3366aa
			DisplayObjects[thing] = thingSprite
			spriteContainer.addChild(thingSprite)
			newSector.things.push(thing)
			thingToSector[thing] = newSector
		}
	})
}

type Box = {
	left: number
	right: number
	top: number
	bottom: number
}

function getSectorsInBox({ left, right, top, bottom }: Box, padding = 0) {
	let [leftSector, rightSector, topSector, bottomSector] = [
		left - padding,
		right + padding,
		top - padding,
		bottom + padding,
	].map((v) => Math.floor(v / SECTOR_SIZE))
	const sectors = []
	for (let sx = 0; sx <= rightSector - leftSector; sx++) {
		for (let sy = 0; sy <= bottomSector - topSector; sy++) {
			sectors.push({ x: leftSector + sx, y: topSector + sy })
		}
	}
	return sectors
}

export function getThings({ x, y }: Vector2) {
	const things: number[] = []
	getSectorsInBox({ left: x, right: x, top: y, bottom: y }, 12 + 12).forEach(
		(sector) => {
			const sectorGrid = Vector2.toString(sector)
			if (!sectors.has(sectorGrid)) return
			const sectorThings = sectors.get(sectorGrid)!.things
			things.push(...sectorThings)
		}
	)
	return things
}

export function deleteThing(thing: number) {
	DisplayObjects[thing].destroy()
	delete DisplayObjects[thing]
	thingToSector[thing].things = thingToSector[thing].things.filter(
		(t) => t !== thing
	)
}
