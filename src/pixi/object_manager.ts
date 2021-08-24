import type { DisplayObject } from 'pixi.js'
import { Vector2 } from '../util'
import { Container, Graphics } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { PixiApp } from './pixi_app'

export const DisplayObjects: DisplayObject[] = []

const splatContainer: Container = new Container()
PixiApp.shared.viewport.addChildAt(splatContainer, 0)

const axis = new Graphics()
axis.lineStyle({ width: 1, color: 0xaa9944, alignment: 0 })
axis.moveTo(-24, 0)
axis.lineTo(24, 0)
axis.moveTo(1, -24)
axis.lineTo(1, 24)
axis.beginFill(0x775522)
axis.lineStyle({ width: 0 })
axis.drawRect(0, 0, 1, 1)
axis.y = PixiApp.shared.viewport.worldScreenHeight / 2
splatContainer.addChild(axis)

let currentLine: Graphics | null = null
let currentLinePoints = 0
let lastPoint: Vector2 | null = null

export function paintLine(
	{ x, y }: Vector2,
	newLine: boolean,
	thickness: number
) {
	if (newLine || currentLinePoints > 16 || !currentLine) {
		if (newLine || !currentLine) lastPoint = { x, y }
		currentLine = new Graphics()
		splatContainer.addChild(currentLine)
		currentLinePoints = 0
	} else if (
		Vector2.getMagnitude({ x: x - lastPoint!.x, y: y - lastPoint!.y }) > 6
	) {
		currentLine.moveTo(lastPoint!.x, lastPoint!.y)
		currentLine.lineStyle({
			width: 4 + 8 * thickness,
			color: 0xff88aa,
			cap: PIXI.LINE_CAP.ROUND,
			join: PIXI.LINE_JOIN.ROUND,
		})
		currentLine.lineTo(x, y)
		currentLinePoints++
		lastPoint = { x, y }
	}
}
