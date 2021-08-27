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
		return this._data[x * this.height + y]
	}

	set(x: number, y: number, value: number) {
		this._data[x * this.height + y] = value
	}

	inBounds(x: number, y: number) {
		return x >= 0 && y >= 0 && x < this.width && y < this.height
	}
}
