import { Changed, defineQuery, defineSystem } from 'bitecs'
import { DisplayObject, Transform } from './components'
import { DisplayObjects } from '../pixi/object_manager'
import { PixiApp } from '../pixi/pixi_app'
import { onViewportChange } from '../level'
import { playerSprite } from '../index'

const spriteQuery = defineQuery([Changed(Transform), DisplayObject])

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
	viewport.moveCenter(playerSprite.x + 144, viewport.worldScreenHeight / 2 - 12)
	return world
})
