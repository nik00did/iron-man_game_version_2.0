import { BLAST, CANVAS } from "../../../constants.ts"
import type { CanvasSize } from "../../../constants.ts"
import { SceneEntity } from "../sceneEntity.ts"

export type BlastProps = {
    x: number
    y: number
    speedX?: number
}

export class Blast extends SceneEntity {
    constructor({ x, y, speedX = BLAST.SPEED }: BlastProps) {
        super({
            x,
            y,
            width: BLAST.SIZE,
            height: BLAST.SIZE,
            speedX,
        })
    }

    update(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = BLAST.COLOR
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    isOffScreen(canvas: CanvasSize = CANVAS): boolean {
        return (
            this.x + this.width <= 0 ||
            this.x >= canvas.width ||
            this.y + this.height <= 0 ||
            this.y >= canvas.height
        )
    }
}
