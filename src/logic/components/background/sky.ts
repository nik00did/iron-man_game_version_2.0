import { BLAST, SCORE_HUD, SKY } from "../../../constants.ts"
import type { SkyStop } from "../../../constants.ts"

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

function channelToLinear(channel: number): number {
    const srgb = channel / 255

    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
    const { r, g, b } = parseHex(hex)

    return (
        0.2126 * channelToLinear(r) +
        0.7152 * channelToLinear(g) +
        0.0722 * channelToLinear(b)
    )
}

export function isLightSky(
    hex: string,
    threshold: number = SKY.LUMINANCE_THRESHOLD,
): boolean {
    return relativeLuminance(hex) > threshold
}

export function hudInkAt(elapsedMs: number): string {
    const { zenith } = skyColorsAt(elapsedMs)

    return isLightSky(zenith) ? SCORE_HUD.INK_DARK : SCORE_HUD.INK_LIGHT
}

export function hudRankColorsAt(elapsedMs: number): readonly string[] {
    const { zenith } = skyColorsAt(elapsedMs)

    return isLightSky(zenith)
        ? SCORE_HUD.RANK_COLORS_DARK
        : SCORE_HUD.RANK_COLORS_LIGHT
}

export function blastColorAt(
    elapsedMs: number,
    y: number,
    height: number,
): string {
    const { zenith, horizon } = skyColorsAt(elapsedMs)
    const t = height <= 0 ? 0 : Math.min(1, Math.max(0, y / height))
    const skyHex = lerpHex(zenith, horizon, t)

    return isLightSky(skyHex) ? BLAST.COLOR_DARK : BLAST.COLOR
}

export function timePeriodIndex(
    elapsedMs: number,
    periodMs: number = SKY.PERIOD_MS,
): number {
    if (elapsedMs <= 0 || periodMs <= 0)
        return 0

    return Math.floor(elapsedMs / periodMs)
}

export function skyColorsAt(
    elapsedMs: number,
    stops: readonly SkyStop[] = SKY.STOPS,
    periodMs: number = SKY.PERIOD_MS,
): SkyStop {
    const count = stops.length
    const cycleMs = periodMs * count
    const elapsed = ((elapsedMs % cycleMs) + cycleMs) % cycleMs
    const index = Math.min(timePeriodIndex(elapsed, periodMs), count - 1)
    const frac = (elapsed - index * periodMs) / periodMs
    const from = stops[index]
    const to = stops[(index + 1) % count]

    return {
        zenith: lerpHex(from.zenith, to.zenith, frac),
        horizon: lerpHex(from.horizon, to.horizon, frac),
    }
}
