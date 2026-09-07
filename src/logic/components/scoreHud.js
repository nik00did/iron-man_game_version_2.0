import { SCORE_HUD } from "../../constants.js"

function formatTime(seconds) {
    return `${seconds.toFixed(2)}s`
}

export class ScoreHud {
    drawScore(ctx, currentSeconds) {
        ctx.font = SCORE_HUD.FONT
        ctx.textBaseline = "top"

        ctx.fillStyle = SCORE_HUD.SCORE_COLOR
        ctx.textAlign = "center"
        ctx.fillText(
            `${SCORE_HUD.SCORE_LABEL}: ${formatTime(currentSeconds)}`,
            ctx.canvas.width / 2,
            SCORE_HUD.SCORE_Y,
        )
    }

    drawRating(ctx, topScores) {
        ctx.textAlign = "left"
        for (let index = 0; index < topScores.length; index += 1) {
            const score = topScores[index]
            ctx.fillStyle = SCORE_HUD.RANK_COLORS[index]
            ctx.fillText(
                `${index + 1}. ${formatTime(score)}`,
                SCORE_HUD.RANK_X,
                SCORE_HUD.RANK_Y + index * (SCORE_HUD.FONT_SIZE + SCORE_HUD.RANK_GAP),
            )
        }
    }

    draw(ctx, currentSeconds, topScores) {
        ctx.save()

        this.drawScore(ctx, currentSeconds)
        this.drawRating(ctx, topScores)

        ctx.restore()
    }
}
