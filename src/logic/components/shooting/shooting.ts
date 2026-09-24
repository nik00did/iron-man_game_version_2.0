import { BLAST, ENTITY_TYPE } from "../../../constants.ts"
import type { CanvasSize } from "../../../constants.ts"
import type { Box } from "../sceneEntity.ts"
import type { Obstacle } from "../obstacle.ts"
import { Blast } from "./blast.ts"

export class Shooting {
    blasts: Blast[]
    ammo: number

    constructor() {
        this.blasts = []
        this.ammo = 0
    }

    addAmmo(): boolean {
        if (this.ammo >= BLAST.MAX_AMMO)
            return false

        this.ammo += 1

        return true
    }

    fire(origin: Box): boolean {
        if (this.ammo <= 0)
            return false

        this.ammo -= 1
        const size = BLAST.SIZE

        this.blasts.push(
            new Blast({
                x: origin.x + origin.width / 2 - size / 2,
                y: origin.y + origin.height / 2 - size / 2,
            }),
        )

        return true
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

    draw(ctx: CanvasRenderingContext2D, elapsedMs = 0): void {
        for (const blast of this.blasts)
            blast.update(ctx, elapsedMs)
    }

    clear(): void {
        this.blasts = []
        this.ammo = 0
    }
}
