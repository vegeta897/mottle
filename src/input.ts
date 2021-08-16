import { InteractionEvent, Rectangle } from 'pixi.js'
import { PixiApp } from './pixi/pixi_app'

const { viewport, application } = PixiApp.shared

export default class InputManager {
	static shared = new InputManager()
	mouse = {
		local: { x: 0, y: 0 },
		leftButton: false,
		inBounds: false,
		startedInBounds: false,
		data: application.renderer.plugins.interaction.mouse,
	}
}

const viewportRectangle = new Rectangle()
viewportRectangle.width = viewport.screenWidth
viewportRectangle.height = viewport.screenHeight

const { mouse } = InputManager.shared

application.renderer.plugins.interaction.on(
	'mousemove',
	({ data }: InteractionEvent) => {
		mouse.inBounds = viewportRectangle.contains(data.global.x, data.global.y)
	}
)

application.renderer.plugins.interaction.on(
	'mousedown',
	({ data }: InteractionEvent) => {
		if (data.buttons & 1) {
			mouse.startedInBounds = true
		}
	}
)

function onMouseUp({ data }: InteractionEvent) {
	if (!(data.buttons & 1)) {
		mouse.startedInBounds = false
	}
}

application.renderer.plugins.interaction.on('mouseup', onMouseUp)
application.renderer.plugins.interaction.on('mouseupoutside', onMouseUp)
