import { BLAST, ENTITY_TYPE } from "../../../constants.ts"
import type { CanvasSize } from "../../../constants.ts"
import type { Box } from "../sceneEntity.ts"
import type { Obstacle } from "../obstacle.ts"
import { Blast } from "./blast.ts"

export class Shooting {
    blasts: Blast[]

    constructor() {
        this.blasts = []
    }

    fire(origin: Box): void {
        const size = BLAST.SIZE

        this.blasts.push(
            new Blast({
                x: origin.x + origin.width / 2 - size / 2,
                y: origin.y + origin.height / 2 - size / 2,
            }),
        )
    }

    move(): void {
        for (const blast of this.blasts)
            blast.move()
    }

    removeOffScreen(canvas: CanvasSize): void {
        this.blasts = this.blasts.filter(
            (blast): boolean => !blast.isOffScreen(canvas),
        )
    }

    hitObstacles(obstacles: Obstacle[]): Obstacle[] {
        const remainingObstacles = [...obstacles]
        const remainingBlasts: Blast[] = []

        for (const blast of this.blasts) {
            const hitIndex = remainingObstacles.findIndex(
                (obstacle): boolean =>
                    obstacle.type !== ENTITY_TYPE.BUILDING &&
                    blast.crashWith(obstacle),
            )

            if (hitIndex === -1) {
                remainingBlasts.push(blast)
                continue
            }

            remainingObstacles.splice(hitIndex, 1)
        }

        this.blasts = remainingBlasts

        return remainingObstacles
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const blast of this.blasts)
            blast.update(ctx)
    }

    clear(): void {
        this.blasts = []
    }
}
