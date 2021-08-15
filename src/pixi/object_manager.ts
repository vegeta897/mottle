import type { DisplayObject } from 'pixi.js'
import { Vector2 } from '../util'
import { Container, Graphics } from 'pixi.js'
import { PixiApp } from './pixi_app'

export const DisplayObjects: DisplayObject[] = []

const splatContainer = new Container()
PixiApp.shared.viewport.addChildAt(splatContainer, 0)

const splats: Map<string, DisplayObject> = new Map()

const splat = new Graphics()
splat.beginFill(0xff88aa)
splat.drawRect(0, 0, 8, 8)

export function addSplat({ x, y }: Vector2) {
	const grid = Vector2.toString({ x, y })
	if (!splats.has(grid)) {
		splats.set(
			grid,
			splatContainer.addChild(splat.clone().setTransform(x - 4, y - 4))
		)
	}
}
