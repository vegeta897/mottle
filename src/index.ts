import { Application, Container } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import './style.css'

export const WIDTH = 960
export const HEIGHT = 720
export const DEFAULT_ZOOM = 3

const { view, stage } = new Application({
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: 0xf7ffeb,
    sharedTicker: true,
})
view.id = 'viewport'
document.body.appendChild(view)

const viewport = new Viewport({
    screenWidth: view.width,
    screenHeight: view.height,
})
viewport.setZoom(DEFAULT_ZOOM)
stage.addChild(viewport)

const spriteContainer = new Container()
viewport.addChild(spriteContainer)
