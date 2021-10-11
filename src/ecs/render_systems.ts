import { Changed, defineQuery, enterQuery, System } from 'bitecs'
import { DisplayObject, Transform } from './components'
import { DisplayObjects } from '../pixi/object_manager'

const spriteQuery = defineQuery([Changed(Transform), DisplayObject])
const newSprites = enterQuery(spriteQuery)

function updateSprite(eid: number) {
	DisplayObjects[eid].x = Math.floor(Transform.x[eid])
	DisplayObjects[eid].y = Math.floor(Transform.y[eid] - Transform.z[eid])
}

export const spriteSystem: System = (world) => {
	newSprites(world).forEach(updateSprite)
	spriteQuery(world).forEach(updateSprite)
	return world
}

export const cameraSystem: System = (world) => {
	return world
}
