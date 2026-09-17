export type Box = {
    x: number
    y: number
    width: number
    height: number
}

export type SceneEntityProps = {
    x: number
    y: number
    width: number
    height: number
    speedX?: number
}

export class SceneEntity {
    x: number
    y: number
    width: number
    height: number
    speedX: number

    constructor({ x, y, width, height, speedX = 0 }: SceneEntityProps) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speedX = speedX
    }

    move(): void {
        this.x += this.speedX
    }

    isOffScreen(): boolean {
        return this.x + this.width <= 0
    }
}
