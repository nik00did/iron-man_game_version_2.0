import { ENERGY_TOKEN } from "../../constants.js"
import { SceneEntity } from "./sceneEntity.js"

export type EnergyTokenProps = {
    x: number
    y: number
    speedX?: number
}

export class EnergyToken extends SceneEntity {
    constructor({ x, y, speedX = ENERGY_TOKEN.SPEED }: EnergyTokenProps) {
        super({
            x,
            y,
            width: ENERGY_TOKEN.SIZE,
            height: ENERGY_TOKEN.SIZE,
            speedX,
        })
    }

    update(ctx: CanvasRenderingContext2D): void {
        this.drawEnergyToken(ctx)
    }

    drawEnergyToken(ctx: CanvasRenderingContext2D): void {
        const radius = this.width / 2
        const cx = this.x + radius
        const cy = this.y + radius
        const gradient = ctx.createRadialGradient(
            cx,
            cy,
            radius * 0.15,
            cx,
            cy,
            radius,
        )

        gradient.addColorStop(0, ENERGY_TOKEN.CORE)
        gradient.addColorStop(0.45, ENERGY_TOKEN.MID)
        gradient.addColorStop(1, ENERGY_TOKEN.EDGE)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
    }
}
