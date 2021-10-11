import type { DisplayObject } from 'pixi.js'
import { Graphics } from 'pixi.js'
import { PixiApp } from './pixi_app'

export const DisplayObjects: DisplayObject[] = [] // Indexed by entity ID

// const { height } = PixiApp.shared.application.view

const axis = new Graphics()
axis.lineStyle({ width: 1, color: 0xeecda0, alignment: 0 })
axis.moveTo(-24, 0)
axis.lineTo(24, 0)
axis.moveTo(1, -24)
axis.lineTo(1, 24)
axis.beginFill(0xe6a67c)
axis.lineStyle({ width: 0 })
axis.drawRect(0, 0, 1, 1)
PixiApp.shared.stage.addChild(axis)
