import { SCORE_HUD } from "../../../constants.ts"

function toScore(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value))
        return null

    return Math.floor(value)
}

export function getTopScores(): number[] {
    try {
        const stored = localStorage.getItem(SCORE_HUD.STORAGE_KEY)

        if (!stored)
            return []

        const parsed: unknown = JSON.parse(stored)

        if (!Array.isArray(parsed))
            return []

        return parsed
            .map(toScore)
            .filter((score): score is number => score !== null)
            .slice(0, SCORE_HUD.MAX_RECORDS)
    } catch {
        return []
    }
}

export function saveScore(score: number): number[] {
    const next = toScore(score)
    const topScores = [...getTopScores(), ...(next === null ? [] : [next])]
        .sort((a, b): number => b - a)
        .slice(0, SCORE_HUD.MAX_RECORDS)

    try {
        localStorage.setItem(SCORE_HUD.STORAGE_KEY, JSON.stringify(topScores))
    } catch {
        // private mode or quota — still return the in-memory list
    }

    return topScores
}
