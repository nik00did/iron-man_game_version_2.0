import { BLAST, SCORE_HUD } from "../../../constants.ts"
import { hudInkAt, hudRankColorsAt } from "../background"

function formatScore(score: number): string {
    return String(Math.floor(score))
}

function scoreText(score: number): string {
    return `${SCORE_HUD.SCORE_LABEL}: ${formatScore(score)}`
}

function blastText(ammo: number): string {
    return `${SCORE_HUD.BLAST_LABEL}: ${ammo}/${BLAST.MAX_AMMO}`
}

export class ScoreHud {
    drawScore(
        ctx: CanvasRenderingContext2D,
        score: number,
        elapsedMs = 0,
    ): void {
        ctx.font = SCORE_HUD.FONT
        ctx.textBaseline = "top"

        ctx.fillStyle = hudInkAt(elapsedMs)
        ctx.textAlign = "center"
        ctx.fillText(
            scoreText(score),
            ctx.canvas.width / 2,
            SCORE_HUD.SCORE_Y,
        )
    }

    drawBlasts(
        ctx: CanvasRenderingContext2D,
        score: number,
        ammo: number,
        elapsedMs = 0,
    ): void {
        ctx.font = SCORE_HUD.FONT
        ctx.textBaseline = "top"
        ctx.fillStyle = hudInkAt(elapsedMs)
        ctx.textAlign = "right"

        const scoreLeft =
            ctx.canvas.width / 2 - ctx.measureText(scoreText(score)).width / 2

        ctx.fillText(
            blastText(ammo),
            scoreLeft - SCORE_HUD.BLAST_GAP,
            SCORE_HUD.SCORE_Y,
        )
    }

    drawRating(
        ctx: CanvasRenderingContext2D,
        topScores: number[],
        elapsedMs = 0,
    ): void {
        ctx.textAlign = "left"
        const rankColors = hudRankColorsAt(elapsedMs)
        const ink = hudInkAt(elapsedMs)

        for (let index = 0; index < topScores.length; index += 1) {
            const score = topScores[index]
            ctx.fillStyle = rankColors[index] ?? ink
            ctx.fillText(
                `${index + 1}. ${formatScore(score)}`,
                SCORE_HUD.RANK_X,
                SCORE_HUD.RANK_Y +
                    index * (SCORE_HUD.FONT_SIZE + SCORE_HUD.RANK_GAP),
            )
        }
    }

    draw(
        ctx: CanvasRenderingContext2D,
        score: number,
        topScores: number[],
        ammo: number,
        elapsedMs = 0,
    ): void {
        ctx.save()

        this.drawScore(ctx, score, elapsedMs)
        this.drawBlasts(ctx, score, ammo, elapsedMs)
        this.drawRating(ctx, topScores, elapsedMs)

        ctx.restore()
    }
}
