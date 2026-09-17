import { SCORE_HUD } from "../../constants.js"

function formatScore(score: number): string {
    return String(Math.floor(score))
}

export class ScoreHud {
    drawScore(ctx: CanvasRenderingContext2D, score: number): void {
        ctx.font = SCORE_HUD.FONT
        ctx.textBaseline = "top"

        ctx.fillStyle = SCORE_HUD.SCORE_COLOR
        ctx.textAlign = "center"
        ctx.fillText(
            `${SCORE_HUD.SCORE_LABEL}: ${formatScore(score)}`,
            ctx.canvas.width / 2,
            SCORE_HUD.SCORE_Y,
        )
    }

    drawRating(ctx: CanvasRenderingContext2D, topScores: number[]): void {
        ctx.textAlign = "left"

        for (let index = 0; index < topScores.length; index += 1) {
            const score = topScores[index]
            ctx.fillStyle =
                SCORE_HUD.RANK_COLORS[index] ?? SCORE_HUD.SCORE_COLOR
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
    ): void {
        ctx.save()

        this.drawScore(ctx, score)
        this.drawRating(ctx, topScores)

        ctx.restore()
    }
}
