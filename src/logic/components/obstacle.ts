import { SceneEntity } from "./sceneEntity.ts"

export type ObstacleProps = {
    width: number
    height: number
    color: string
    x: number
    y: number
    type: string
    speedX?: number
}

export class Obstacle extends SceneEntity {
    type: string
    color: string
    image: HTMLImageElement

    constructor({
        width,
        height,
        color,
        x,
        y,
        type,
        speedX = 0,
    }: ObstacleProps) {
        super({ x, y, width, height, speedX })
        this.type = type
        this.color = color
        this.image = new Image()
        this.image.src = color
    }

    update(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
}
