import { SKY } from "../constants.js"
import type { SkyStop } from "../constants.js"

type Rgb = {
    r: number
    g: number
    b: number
}

function parseHex(hex: string): Rgb {
    const value = hex.startsWith("#") ? hex.slice(1) : hex

    return {
        r: Number.parseInt(value.slice(0, 2), 16),
        g: Number.parseInt(value.slice(2, 4), 16),
        b: Number.parseInt(value.slice(4, 6), 16),
    }
}

function toHex({ r, g, b }: Rgb): string {
    return `#${[r, g, b]
        .map((channel): string => channel.toString(16).padStart(2, "0"))
        .join("")}`
}

function lerpChannel(from: number, to: number, t: number): number {
    return Math.round(from + (to - from) * t)
}

function lerpHex(from: string, to: string, t: number): string {
    const start = parseHex(from)
    const end = parseHex(to)

    return toHex({
        r: lerpChannel(start.r, end.r, t),
        g: lerpChannel(start.g, end.g, t),
        b: lerpChannel(start.b, end.b, t),
    })
}

export function skyColorsAt(
    elapsedMs: number,
    stops: readonly SkyStop[] = SKY.STOPS,
    periodMs: number = SKY.PERIOD_MS,
): SkyStop {
    const count = stops.length
    const cycleMs = periodMs * count
    const elapsed = ((elapsedMs % cycleMs) + cycleMs) % cycleMs
    const index = Math.min(Math.floor(elapsed / periodMs), count - 1)
    const frac = (elapsed - index * periodMs) / periodMs
    const from = stops[index]
    const to = stops[(index + 1) % count]

    return {
        zenith: lerpHex(from.zenith, to.zenith, frac),
        horizon: lerpHex(from.horizon, to.horizon, frac),
    }
}
