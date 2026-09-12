import {
    CANVAS,
    DIAGONAL_COLORS,
    ICONS,
    KEYS,
    PLAYER_SPEED,
} from "@src/constants.js"
import {
    clampPlayerX,
    clampPlayerY,
    resolveCharacterMotion,
} from "@src/logic/components/characterMotion.js"

const DIAGONAL_SPEED = PLAYER_SPEED / Math.SQRT2

describe("resolveCharacterMotion", () => {
    it("returns the default pose when no keys are pressed", () => {
        expect(resolveCharacterMotion({})).toEqual({
            speedX: 0,
            speedY: 0,
            appearance: { kind: "image", src: ICONS.IRON_MAN },
        })
    })

    it("returns the default pose when key state is missing", () => {
        expect(resolveCharacterMotion(null)).toEqual({
            speedX: 0,
            speedY: 0,
            appearance: { kind: "image", src: ICONS.IRON_MAN },
        })
    })

    it("uses the cardinal pose and speed for a single arrow", () => {
        expect(resolveCharacterMotion({ [KEYS.RIGHT]: true })).toEqual({
            speedX: PLAYER_SPEED,
            speedY: 0,
            appearance: { kind: "image", src: ICONS.MOVE_RIGHT },
        })
    })

    it("uses the same diagonal pose regardless of press order", () => {
        const leftThenUp = resolveCharacterMotion({
            [KEYS.LEFT]: true,
            [KEYS.UP]: true,
        })
        const upThenLeft = resolveCharacterMotion({
            [KEYS.UP]: true,
            [KEYS.LEFT]: true,
        })

        expect(leftThenUp).toEqual(upThenLeft)
        expect(leftThenUp.appearance).toEqual({
            kind: "fill",
            color: DIAGONAL_COLORS.UP_LEFT,
        })
        expect(leftThenUp.speedX).toBeCloseTo(-DIAGONAL_SPEED)
        expect(leftThenUp.speedY).toBeCloseTo(-DIAGONAL_SPEED)
    })

    it("maps each diagonal combination to its placeholder color", () => {
        expect(
            resolveCharacterMotion({
                [KEYS.RIGHT]: true,
                [KEYS.UP]: true,
            }).appearance,
        ).toEqual({ kind: "fill", color: DIAGONAL_COLORS.UP_RIGHT })
        expect(
            resolveCharacterMotion({
                [KEYS.RIGHT]: true,
                [KEYS.DOWN]: true,
            }).appearance,
        ).toEqual({ kind: "fill", color: DIAGONAL_COLORS.DOWN_RIGHT })
        expect(
            resolveCharacterMotion({
                [KEYS.LEFT]: true,
                [KEYS.DOWN]: true,
            }).appearance,
        ).toEqual({ kind: "fill", color: DIAGONAL_COLORS.DOWN_LEFT })
    })

    it("cancels opposite keys on an axis and keeps the other axis", () => {
        expect(
            resolveCharacterMotion({
                [KEYS.LEFT]: true,
                [KEYS.RIGHT]: true,
                [KEYS.UP]: true,
            }),
        ).toEqual({
            speedX: 0,
            speedY: -PLAYER_SPEED,
            appearance: { kind: "image", src: ICONS.MOVE_UP },
        })
    })

    it("keeps the last pose when opposite keys cancel all movement", () => {
        expect(
            resolveCharacterMotion({
                [KEYS.LEFT]: true,
                [KEYS.RIGHT]: true,
            }),
        ).toEqual({
            speedX: 0,
            speedY: 0,
            appearance: null,
        })
    })
})

describe("clampPlayerX and clampPlayerY", () => {
    const piece = { x: -10, y: -4, width: 50, height: 50 }

    it("clamps the player inside the canvas", () => {
        expect(clampPlayerX(piece, CANVAS)).toBe(0)
        expect(clampPlayerY(piece, CANVAS)).toBe(0)
        expect(clampPlayerX({ ...piece, x: 2000 }, CANVAS)).toBe(
            CANVAS.width - piece.width,
        )
        expect(clampPlayerY({ ...piece, y: 2000 }, CANVAS)).toBe(
            CANVAS.height - piece.height,
        )
    })
})
