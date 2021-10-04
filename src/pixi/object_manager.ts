import type { DisplayObject } from 'pixi.js'
import { Container, Graphics } from 'pixi.js'
import { PixiApp } from './pixi_app'

export const DisplayObjects: DisplayObject[] = [] // Indexed by entity ID

const splatContainer: Container = new Container()
PixiApp.shared.stage.addChildAt(splatContainer, 0)

// const { height } = PixiApp.shared.application.view

const axis = new Graphics()
axis.lineStyle({ width: 1, color: 0xaa9944, alignment: 0 })
axis.moveTo(-24, 0)
axis.lineTo(24, 0)
axis.moveTo(1, -24)
axis.lineTo(1, 24)
axis.beginFill(0x775522)
axis.lineStyle({ width: 0 })
axis.drawRect(0, 0, 1, 1)
splatContainer.addChild(axis)
