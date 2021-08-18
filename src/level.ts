import { Vector2 } from './util'
import Prando from 'prando'
import { addComponent, addEntity } from 'bitecs'
import Game from './game'
import { Transform } from './ecs/components'
import { Sprite, Texture } from 'pixi.js'
import { DisplayObjects } from './pixi/object_manager'
import { PixiApp } from './pixi/pixi_app'

const SECTOR_SIZE = 240

type Sector = {
	things: number[] // Entity IDs
}

const sectors: Map<string, Sector> = new Map()

const rng = new Prando()

const { spriteContainer, viewport } = PixiApp.shared

viewport.on('moved', onViewportChange)
viewport.on('zoomed', onViewportChange)

export function onViewportChange() {
	const [leftSector, rightSector, topSector, bottomSector] = [
		viewport.left,
		viewport.right,
		viewport.top,
		viewport.bottom,
	].map((v) => Math.floor(v / SECTOR_SIZE))
	for (let sx = 0; sx <= rightSector - leftSector; sx++) {
		for (let sy = 0; sy <= bottomSector - topSector; sy++) {
			const sectorXY = { x: leftSector + sx, y: topSector + sy }
			const sectorGrid = Vector2.toString(sectorXY)
			if (sectors.has(sectorGrid)) continue
			const newSector: Sector = { things: [] }
			sectors.set(sectorGrid, newSector)
			const thingCount = rng.nextInt(1, 2)
			for (let i = 0; i < thingCount; i++) {
				const thingX =
					sectorXY.x * SECTOR_SIZE + rng.nextInt(0, SECTOR_SIZE - 1)
				const thingY =
					sectorXY.y * SECTOR_SIZE + rng.nextInt(0, SECTOR_SIZE - 1)
				const thing = addEntity(Game.shared.world)
				addComponent(Game.shared.world, Transform, thing)
				Transform.x[thing] = thingX
				Transform.y[thing] = thingY
				const thingSprite = new Sprite(Texture.WHITE)
				thingSprite.setTransform(thingX, thingY, 0.5, 0.5)
				thingSprite.anchor.x = 0.5
				thingSprite.anchor.y = 0.5
				thingSprite.tint = 0x3366aa
				DisplayObjects[thing] = thingSprite
				spriteContainer.addChild(thingSprite)
				newSector.things.push(thing)
			}
		}
	}
}
