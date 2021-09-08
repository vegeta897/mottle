import { Vector2 } from './util'
import Prando from 'prando'
import { addComponent, addEntity, removeComponent } from 'bitecs'
import Game from './game'
import {
	AreaConstraint,
	DisplayObject,
	Drag,
	Force,
	PaintBucket,
	Transform,
	Velocity,
} from './ecs/components'
import { Sprite, Texture } from 'pixi.js'
import { DisplayObjects } from './pixi/object_manager'
import { PixiApp } from './pixi/pixi_app'
import { spillPaint } from './paint'

// TODO: We probably don't need sectors anymore

const SECTOR_SIZE = 432

const { spriteContainer } = PixiApp.shared

type Sector = {
	things: number[] // Entity IDs
}

const sectors: Map<string, Sector> = new Map()
const thingToSector: Sector[] = []

const rng = new Prando()

export enum PaintBucketStates {
	SLEEP,
	IDLE,
	WALK,
	SPILL,
}

export function createLevel() {
	for (let i = 0; i < 8; i++) {
		const bucketX = Math.floor(
			SECTOR_SIZE / 8 + i * SECTOR_SIZE + rng.next() * SECTOR_SIZE
		)
		const bucketY = Math.floor(SECTOR_SIZE / 4 + (rng.next() * SECTOR_SIZE) / 2)
		const bucket = addEntity(Game.shared.world)
		addComponent(Game.shared.world, Transform, bucket)
		Transform.x[bucket] = bucketX
		Transform.y[bucket] = bucketY
		Transform.width[bucket] = 14
		Transform.height[bucket] = 24
		const bucketSprite = new Sprite(Texture.from('bucket'))
		bucketSprite.setTransform(bucketX, bucketY)
		bucketSprite.anchor.set(1, 0.625)
		DisplayObjects[bucket] = bucketSprite
		spriteContainer.addChild(bucketSprite)
		addComponent(Game.shared.world, DisplayObject, bucket)
		addComponent(Game.shared.world, PaintBucket, bucket)
		PaintBucket.state[bucket] = PaintBucketStates.IDLE
		addComponent(Game.shared.world, Velocity, bucket)
		addComponent(Game.shared.world, Drag, bucket)
		Drag.rate[bucket] = 0.2
		addComponent(Game.shared.world, AreaConstraint, bucket)
		AreaConstraint.bottom[bucket] = 408
		AreaConstraint.right[bucket] = 4080
	}
}

export function spillBucket(
	bucket: number,
	velocityX: number,
	velocityY: number
) {
	PaintBucket.state[bucket] = PaintBucketStates.SPILL
	removeComponent(Game.shared.world, Force, bucket)
	Velocity.x[bucket] += velocityX * 2
	Velocity.y[bucket] += velocityY * 2
	Drag.rate[bucket] = 0.2
	DisplayObjects[bucket].rotation = Math.PI / 2
	spillPaint(Transform.x[bucket], Transform.y[bucket], velocityX, velocityY)
}

export function onViewportChange() {
	// const visibleSectors = getSectorsInBox(viewport, 4)
	// visibleSectors.forEach((sector) => {
	// 	const sectorGrid = Vector2.toString(sector)
	// 	if (sectors.has(sectorGrid)) return
	// 	const newSector: Sector = { things: [] }
	// 	sectors.set(sectorGrid, newSector)
	// 	const thingCount = 1
	// 	for (let i = 0; i < thingCount; i++) {
	// 		const thingX = sector.x * SECTOR_SIZE + rng.nextInt(0, SECTOR_SIZE - 1)
	// 		const thingY = sector.y * SECTOR_SIZE + rng.nextInt(0, SECTOR_SIZE - 1)
	// 		const thing = addEntity(Game.shared.world)
	// 		addComponent(Game.shared.world, Transform, thing)
	// 		Transform.x[thing] = thingX
	// 		Transform.y[thing] = thingY
	// 		Transform.width[thing] = 24
	// 		Transform.height[thing] = 24
	// 		const thingSprite = new Sprite(Texture.WHITE)
	// 		thingSprite.setTransform(thingX, thingY, 1.5, 1.5)
	// 		thingSprite.anchor.x = 0.5
	// 		thingSprite.anchor.y = 0.5
	// 		thingSprite.tint = 0x3366aa
	// 		DisplayObjects[thing] = thingSprite
	// 		spriteContainer.addChild(thingSprite)
	// 		newSector.things.push(thing)
	// 		thingToSector[thing] = newSector
	// 	}
	// })
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
