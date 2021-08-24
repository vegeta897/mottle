export class Map2D {
	private readonly _data
	readonly width
	readonly height

	constructor(width: number, height: number) {
		this._data = new Uint32Array(width * height)
		this.width = width
		this.height = height
	}

	get(x: number, y: number): number {
		return this._data[x * this.width + y]
	}

	set(x: number, y: number, value: number) {
		this._data[x * this.width + y] = value
	}
}
