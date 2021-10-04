import { Container, Graphics } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'
import { Vector2 } from './util'

const { viewport } = PixiApp.shared

const MAX_LINE_POINTS = 24
const LINE_POINT_DIST = 4

const paintContainer: Container = new Container()
viewport.addChildAt(paintContainer, 1)

let currentLine: Graphics | null = null
let currentLinePoints = 0
let lastPoint: Vector2 | null = null

export function paintLine(
	{ x, y }: Vector2,
	newLine: boolean,
	thickness: number
) {
	if (newLine || currentLinePoints > MAX_LINE_POINTS || !currentLine) {
		if (newLine || !currentLine) lastPoint = { x, y }
		currentLine = new Graphics()
		paintContainer.addChild(currentLine)
		currentLinePoints = 0
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
		currentLinePoints++
		lastPoint = { x, y }
	}
}

const SPLAT_SIZE = 6

const floorPaintContainer: Container = new Container()
floorPaintContainer.setTransform(SPLAT_SIZE / 2, SPLAT_SIZE / 2)
viewport.addChildAt(floorPaintContainer, 0)
