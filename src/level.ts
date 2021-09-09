import Prando from 'prando'
import { addComponent, addEntity, removeComponent } from 'bitecs'
import Game from './game'
import {
	AreaConstraint,
	DisplayObject,
	Drag,
	Force,
	PaintBucket,
	Transform,
	Velocity,
} from './ecs/components'
import { Sprite, Texture } from 'pixi.js'
import { DisplayObjects } from './pixi/object_manager'
import { PixiApp } from './pixi/pixi_app'
import { spillPaint } from './paint'

// TODO: We probably don't need sectors anymore

const SECTOR_SIZE = 288

const { spriteContainer } = PixiApp.shared

const rng = new Prando()

export enum PaintBucketStates {
	SLEEP,
	IDLE,
	WALK,
	SPILL,
}

export function createLevel() {
	for (let i = 0; i < 16; i++) {
		const bucketX = Math.floor(
			SECTOR_SIZE / 8 + i * SECTOR_SIZE + rng.next() * SECTOR_SIZE
		)
		const bucketY = Math.floor(SECTOR_SIZE / 4 + (rng.next() * SECTOR_SIZE) / 2)
		const bucket = addEntity(Game.shared.world)
		addComponent(Game.shared.world, Transform, bucket)
		Transform.x[bucket] = bucketX
		Transform.y[bucket] = bucketY
		Transform.width[bucket] = 14
		Transform.height[bucket] = 24
		const bucketSprite = new Sprite(Texture.from('bucket'))
		bucketSprite.setTransform(bucketX, bucketY)
		bucketSprite.anchor.set(1, 0.625)
		DisplayObjects[bucket] = bucketSprite
		spriteContainer.addChild(bucketSprite)
		addComponent(Game.shared.world, DisplayObject, bucket)
		addComponent(Game.shared.world, PaintBucket, bucket)
		PaintBucket.state[bucket] = PaintBucketStates.IDLE
		addComponent(Game.shared.world, Velocity, bucket)
		addComponent(Game.shared.world, Drag, bucket)
		Drag.rate[bucket] = 0.2
		addComponent(Game.shared.world, AreaConstraint, bucket)
		AreaConstraint.bottom[bucket] = 264
		AreaConstraint.right[bucket] = 4080
	}
}

export function spillBucket(
	bucket: number,
	velocityX: number,
	velocityY: number
) {
	PaintBucket.state[bucket] = PaintBucketStates.SPILL
	removeComponent(Game.shared.world, Force, bucket)
	Velocity.x[bucket] += velocityX * 2
	Velocity.y[bucket] += velocityY * 2
	Drag.rate[bucket] = 0.2
	DisplayObjects[bucket].rotation = Math.PI / 2
	spillPaint(Transform.x[bucket], Transform.y[bucket], velocityX, velocityY)
}
