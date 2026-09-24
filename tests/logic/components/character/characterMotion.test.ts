import {
    CANVAS,
    DIAGONAL_COLORS,
    ICONS,
    KEYS,
    OBSTACLE_SPAWN,
    PLAYER_SPEED,
    SKY,
} from "@src/constants.ts"
import {
    clampPlayerX,
    clampPlayerY,
    resolveCharacterMotion,
} from "@src/logic/components/character"

const DIAGONAL_SPEED = PLAYER_SPEED / Math.SQRT2
const FLY_RIGHT = { kind: "image", src: ICONS.MOVE_RIGHT } as const

describe("resolveCharacterMotion", () => {
    it("holds position with the fly-forward pose when no keys are pressed", () => {
        expect(resolveCharacterMotion({})).toEqual({
            speedX: 0,
            speedY: 0,
            appearance: FLY_RIGHT,
        })
    })

    it("holds position with the fly-forward pose when key state is missing", () => {
        expect(resolveCharacterMotion(null)).toEqual({
            speedX: 0,
            speedY: 0,
            appearance: FLY_RIGHT,
        })
    })

    it("uses right as forward acceleration and left as accel plus live building speed", () => {
        expect(resolveCharacterMotion({ [KEYS.RIGHT]: true })).toEqual({
            speedX: PLAYER_SPEED,
            speedY: 0,
            appearance: FLY_RIGHT,
        })
        expect(resolveCharacterMotion({ [KEYS.LEFT]: true })).toEqual({
            speedX: -PLAYER_SPEED + OBSTACLE_SPAWN.BUILDING_SPEED,
            speedY: 0,
            appearance: { kind: "image", src: ICONS.MOVE_LEFT },
        })
    })

    it("adds the live building speed-up to left movement", () => {
        expect(
            resolveCharacterMotion({ [KEYS.LEFT]: true }, SKY.SPEED_STEP),
        ).toEqual({
            speedX:
                -PLAYER_SPEED + OBSTACLE_SPAWN.BUILDING_SPEED - SKY.SPEED_STEP,
            speedY: 0,
            appearance: { kind: "image", src: ICONS.MOVE_LEFT },
        })
    })

    it("keeps the fly-forward pose when only a vertical key is held", () => {
        expect(resolveCharacterMotion({ [KEYS.UP]: true })).toEqual({
            speedX: 0,
            speedY: -PLAYER_SPEED,
            appearance: FLY_RIGHT,
        })
        expect(resolveCharacterMotion({ [KEYS.DOWN]: true })).toEqual({
            speedX: 0,
            speedY: PLAYER_SPEED,
            appearance: FLY_RIGHT,
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
        expect(leftThenUp.speedX).toBeCloseTo(
            -DIAGONAL_SPEED + OBSTACLE_SPAWN.BUILDING_SPEED,
        )
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

    it("cancels opposite keys on an axis and keeps flying forward", () => {
        expect(
            resolveCharacterMotion({
                [KEYS.LEFT]: true,
                [KEYS.RIGHT]: true,
                [KEYS.UP]: true,
            }),
        ).toEqual({
            speedX: 0,
            speedY: -PLAYER_SPEED,
            appearance: FLY_RIGHT,
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
