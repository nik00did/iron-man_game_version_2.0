import { BLAST, SCORE_HUD, SKY } from "@src/constants.ts"
import type { SkyStop } from "@src/constants.ts"
import {
    blastColorAt,
    hudInkAt,
    hudRankColorsAt,
    isLightSky,
    relativeLuminance,
    skyColorsAt,
    timePeriodIndex,
} from "@src/logic/components/background"

const STOPS: readonly SkyStop[] = [
    { zenith: "#000000", horizon: "#000000" },
    { zenith: "#020202", horizon: "#040404" },
    { zenith: "#0000ff", horizon: "#ff0000" },
]

const PERIOD_MS = 1000

describe("timePeriodIndex", () => {
    it("is 0 at the start of play", () => {
        expect(timePeriodIndex(0)).toBe(0)
    })

    it("stays on the current period until the next boundary", () => {
        expect(timePeriodIndex(SKY.PERIOD_MS - 1)).toBe(0)
        expect(timePeriodIndex(SKY.PERIOD_MS)).toBe(1)
    })

    it("keeps climbing after a full sky cycle", () => {
        expect(timePeriodIndex(SKY.PERIOD_MS * SKY.STOPS.length)).toBe(
            SKY.STOPS.length,
        )
    })
})

describe("skyColorsAt", () => {
    it("returns the first stop at the start of the cycle", () => {
        const colors = skyColorsAt(0)

        expect(colors).toEqual(SKY.STOPS[0])
    })

    it("returns the next stop when a period has elapsed", () => {
        const colors = skyColorsAt(SKY.PERIOD_MS)

        expect(colors).toEqual(SKY.STOPS[1])
    })

    it("wraps to the first stop after a full cycle", () => {
        const colors = skyColorsAt(SKY.PERIOD_MS * SKY.STOPS.length)

        expect(colors).toEqual(SKY.STOPS[0])
    })

    it("lerps halfway between adjacent stops", () => {
        const colors = skyColorsAt(PERIOD_MS / 2, STOPS, PERIOD_MS)

        expect(colors).toEqual({
            zenith: "#010101",
            horizon: "#020202",
        })
    })

    it("lerps from the last stop back to the first", () => {
        const colors = skyColorsAt(PERIOD_MS * 2.5, STOPS, PERIOD_MS)

        expect(colors).toEqual({
            zenith: "#000080",
            horizon: "#800000",
        })
    })
})

describe("relativeLuminance", () => {
    it("is 0 for black and 1 for white", () => {
        expect(relativeLuminance("#000000")).toBe(0)
        expect(relativeLuminance("#ffffff")).toBe(1)
    })
})

describe("isLightSky", () => {
    it("treats the bright-day zenith as light and night as dark", () => {
        expect(isLightSky("#4aa3de")).toBe(true)
        expect(isLightSky("#0b1026")).toBe(false)
    })
})

describe("hudInkAt", () => {
    it("uses light ink on a dark zenith and dark ink on a bright zenith", () => {
        expect(hudInkAt(0)).toBe(SCORE_HUD.INK_LIGHT)
        expect(hudInkAt(SKY.PERIOD_MS * 7)).toBe(SCORE_HUD.INK_DARK)
    })
})

describe("hudRankColorsAt", () => {
    it("switches rank palettes with the zenith", () => {
        expect(hudRankColorsAt(SKY.PERIOD_MS * 3)).toEqual(
            SCORE_HUD.RANK_COLORS_LIGHT,
        )
        expect(hudRankColorsAt(SKY.PERIOD_MS * 7)).toEqual(
            SCORE_HUD.RANK_COLORS_DARK,
        )
    })
})

describe("blastColorAt", () => {
    it("uses gold on a dark sky and dark fill on a light horizon", () => {
        expect(blastColorAt(SKY.PERIOD_MS * 3, 12, 500)).toBe(BLAST.COLOR)
        expect(blastColorAt(0, 500, 500)).toBe(BLAST.COLOR_DARK)
    })
})
