import type { DisplayObject } from 'pixi.js'
import { alignToGrid, Vector2 } from '../util'
import { Container, Graphics, Circle } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { PixiApp } from './pixi_app'

export const DisplayObjects: DisplayObject[] = []

const SPLAT_SIZE = 4

const splatContainer = new Container()
PixiApp.shared.viewport.addChildAt(splatContainer, 0)

const splats: Map<string, DisplayObject> = new Map()

const splat = new Graphics()
splat.beginFill(0xff88aa)
splat.drawRect(0, 0, SPLAT_SIZE, SPLAT_SIZE)

let currentLine: Graphics | null = null
let lastPoint: Vector2 | null = null

export function paintLine({ x, y }: Vector2) {
	if (!currentLine) {
		currentLine = new Graphics()
		currentLine.lineStyle({
			width: 8,
			color: 0xff88aa,
			cap: PIXI.LINE_CAP.ROUND,
			join: PIXI.LINE_JOIN.ROUND,
		})
		lastPoint = { x, y }
		splatContainer.addChild(currentLine)
	} else if (
		Vector2.getMagnitude({ x: x - lastPoint!.x, y: y - lastPoint!.y }) > 6
	) {
		currentLine.moveTo(lastPoint!.x, lastPoint!.y)
		currentLine.lineTo(x, y)
		lastPoint = { x, y }
	}
}

export function addSplat({ x, y }: Vector2, brushSize = 12) {
	const brushCircle = new Circle(x, y, brushSize / 2)
	const brushRect = brushCircle.getBounds()
	const [left, top /*, right, bottom*/] = [
		brushRect.left,
		brushRect.top,
		// brushRect.right,
		// brushRect.bottom,
	].map((v) => alignToGrid(v, SPLAT_SIZE))
	let splatsAdded = 0
	for (let ix = 0; ix <= Math.ceil(brushSize / SPLAT_SIZE); ix++) {
		for (let iy = 0; iy <= Math.ceil(brushSize / SPLAT_SIZE); iy++) {
			const splatX = left + ix * SPLAT_SIZE
			const splatY = top + iy * SPLAT_SIZE
			if (!brushCircle.contains(splatX, splatY)) continue
			const grid = Vector2.toString({ x: splatX, y: splatY })
			if (!splats.has(grid)) {
				splatsAdded++
				splats.set(
					grid,
					splatContainer.addChild(
						splat
							.clone()
							.setTransform(splatX - SPLAT_SIZE / 2, splatY - SPLAT_SIZE / 2)
					)
				)
			}
		}
	}
	return splatsAdded
}
