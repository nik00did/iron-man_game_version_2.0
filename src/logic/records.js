import { SCORE_HUD } from "../constants.js"

function isScore(value) {
    return typeof value === "number" && Number.isFinite(value)
}

export function getTopScores() {
    try {
        const stored = localStorage.getItem(SCORE_HUD.STORAGE_KEY)
        if (!stored)
            return []

        const parsed = JSON.parse(stored)
        if (!Array.isArray(parsed))
            return []

        return parsed.filter(isScore).slice(0, SCORE_HUD.MAX_RECORDS)
    } catch {
        return []
    }
}

export function saveScore(seconds) {
    const topScores = [...getTopScores(), seconds]
        .filter(isScore)
        .sort((a, b) => b - a)
        .slice(0, SCORE_HUD.MAX_RECORDS)

    try {
        localStorage.setItem(SCORE_HUD.STORAGE_KEY, JSON.stringify(topScores))
    } catch {
        // private mode or quota — still return the in-memory list
    }

    return topScores
}
