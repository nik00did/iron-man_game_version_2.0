import {
    DIAGONAL_COLORS,
    ICONS,
    KEYS,
    OBSTACLE_SPAWN,
    PLAYER_SPEED,
} from "../../../constants.ts"
import type { CanvasSize, MovablePiece } from "../../../constants.ts"

export type CharacterAppearance =
    { kind: "image"; src: string } | { kind: "fill"; color: string }

export type CharacterMotion = {
    speedX: number
    speedY: number
    appearance: CharacterAppearance | null
}

export function clampPlayerX(piece: MovablePiece, canvas: CanvasSize): number {
    return Math.min(Math.max(piece.x, 0), canvas.width - piece.width)
}

export function clampPlayerY(piece: MovablePiece, canvas: CanvasSize): number {
    return Math.min(Math.max(piece.y, 0), canvas.height - piece.height)
}

export function resolveCharacterMotion(
    keys: Record<string, boolean> | null,
    scrollSpeedBonus = 0,
): CharacterMotion {
    if (!keys)
        return idleMotion()

    const left = Boolean(keys[KEYS.LEFT])
    const right = Boolean(keys[KEYS.RIGHT])
    const up = Boolean(keys[KEYS.UP])
    const down = Boolean(keys[KEYS.DOWN])
    const dirX = axisDirection(left, right)
    const dirY = axisDirection(up, down)

    if (dirX === 0 && dirY === 0) {
        if (!(left || right || up || down))
            return idleMotion()

        return {
            speedX: 0,
            speedY: 0,
            appearance: null,
        }
    }

    const length = Math.hypot(dirX, dirY)

    return {
        speedX: horizontalSpeed(dirX, length, scrollSpeedBonus),
        speedY: (PLAYER_SPEED * dirY) / length,
        appearance: appearanceFor(dirX, dirY),
    }
}

function idleMotion(): CharacterMotion {
    return {
        speedX: 0,
        speedY: 0,
        appearance: { kind: "image", src: ICONS.MOVE_RIGHT },
    }
}

function horizontalSpeed(
    dirX: number,
    length: number,
    scrollSpeedBonus: number,
): number {
    if (dirX === 0)
        return 0

    const accel = (PLAYER_SPEED * dirX) / length

    if (dirX < 0)
        return accel + OBSTACLE_SPAWN.BUILDING_SPEED - scrollSpeedBonus

    return accel
}

function axisDirection(negative: boolean, positive: boolean): number {
    if (negative === positive)
        return 0

    return positive ? 1 : -1
}

function appearanceFor(dirX: number, dirY: number): CharacterAppearance {
    if (dirX > 0 && dirY < 0)
        return { kind: "fill", color: DIAGONAL_COLORS.UP_RIGHT }

    if (dirX < 0 && dirY < 0)
        return { kind: "fill", color: DIAGONAL_COLORS.UP_LEFT }

    if (dirX > 0 && dirY > 0)
        return { kind: "fill", color: DIAGONAL_COLORS.DOWN_RIGHT }

    if (dirX < 0 && dirY > 0)
        return { kind: "fill", color: DIAGONAL_COLORS.DOWN_LEFT }

    if (dirX < 0)
        return { kind: "image", src: ICONS.MOVE_LEFT }

    return { kind: "image", src: ICONS.MOVE_RIGHT }
}
