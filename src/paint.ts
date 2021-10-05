import { Container, Graphics } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { Vector2 } from './util'

const { stage } = PixiApp.shared

const LINE_POINT_DIST = 4

const paintContainer: Container = new Container()
stage.addChildAt(paintContainer, 1)

let currentLine: Graphics | null = null
let lastPoint: Vector2 | null = null

export function paintLine(
	{ x, y }: Vector2,
	newLine: boolean,
	thickness: number
) {
	if (newLine || !currentLine) {
		if (newLine || !currentLine) lastPoint = { x, y }
		currentLine = new Graphics()
		paintContainer.addChild(currentLine)
	} else if (
		Vector2.getMagnitude({ x: x - lastPoint!.x, y: y - lastPoint!.y }) >
		LINE_POINT_DIST
	) {
		currentLine.moveTo(lastPoint!.x, lastPoint!.y)
		currentLine.lineStyle({
			width: thickness,
			color: 0xff88aa,
			cap: PIXI.LINE_CAP.ROUND,
			join: PIXI.LINE_JOIN.ROUND,
		})
		currentLine.lineTo(x, y)
		lastPoint = { x, y }
	}
}

const SPLAT_SIZE = 6

const floorPaintContainer: Container = new Container()
floorPaintContainer.setTransform(SPLAT_SIZE / 2, SPLAT_SIZE / 2)
stage.addChildAt(floorPaintContainer, 0)
