import { Changed, defineQuery, System } from 'bitecs'
import { DisplayObject, Transform } from './components'
import { DisplayObjects } from '../pixi/object_manager'

const spriteQuery = defineQuery([Changed(Transform), DisplayObject])

export const spriteSystem: System = (world) => {
	for (let eid of spriteQuery(world)) {
		DisplayObjects[eid].x = Math.floor(Transform.x[eid])
		DisplayObjects[eid].y = Math.floor(Transform.y[eid])
	}
	return world
}

export const cameraSystem: System = (world) => {
	return world
}
