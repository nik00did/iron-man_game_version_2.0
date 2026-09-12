import { skyColorsAt } from "./sky.js"

export class Background {
    update(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
        const { zenith, horizon } = skyColorsAt(elapsedMs)
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)

        gradient.addColorStop(0, zenith)
        gradient.addColorStop(1, horizon)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
}
