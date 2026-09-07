import { SCORE_HUD } from "@src/constants.js"
import { getTopScores, saveScore } from "@src/logic/records.js"

describe("records", () => {
    beforeEach(() => {
        globalThis.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
        }
    })

    afterEach(() => {
        delete globalThis.localStorage
    })

    describe("getTopScores", () => {
        it("returns an empty list when nothing is stored", () => {
            localStorage.getItem.mockReturnValue(null)

            const result = getTopScores()

            expect(localStorage.getItem).toHaveBeenCalledWith(
                SCORE_HUD.STORAGE_KEY,
            )
            expect(result).toEqual([])
        })

        it("returns an empty list when stored value is empty", () => {
            localStorage.getItem.mockReturnValue("")

            const result = getTopScores()

            expect(result).toEqual([])
        })

        it("returns an empty list when JSON is invalid", () => {
            localStorage.getItem.mockReturnValue("{not-json")

            const result = getTopScores()

            expect(result).toEqual([])
        })

        it("returns an empty list when stored JSON is not an array", () => {
            localStorage.getItem.mockReturnValue(JSON.stringify({ score: 1 }))

            const result = getTopScores()

            expect(result).toEqual([])
        })

        it("keeps finite numbers only and caps at max records", () => {
            localStorage.getItem.mockReturnValue(
                JSON.stringify([1, "x", 2, null, 3, 4]),
            )

            const result = getTopScores()

            expect(result).toEqual([1, 2, 3])
        })
    })

    describe("saveScore", () => {
        it("appends, sorts descending, persists, and returns the top scores", () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([10, 5]))

            const result = saveScore(8)

            expect(result).toEqual([10, 8, 5])
            expect(localStorage.setItem).toHaveBeenCalledWith(
                SCORE_HUD.STORAGE_KEY,
                JSON.stringify([10, 8, 5]),
            )
        })

        it("keeps only the top max records", () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([10, 9, 8]))

            const result = saveScore(7)

            expect(result).toEqual([10, 9, 8])
        })

        it("allows duplicate scores", () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([8]))

            const result = saveScore(8)

            expect(result).toEqual([8, 8])
        })

        it("still returns the list when setItem throws", () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([10]))
            localStorage.setItem.mockImplementation(() => {
                throw new Error("quota")
            })

            const result = saveScore(4)

            expect(result).toEqual([10, 4])
        })

        it("does not keep a non-finite score", () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([10]))

            const result = saveScore(Number.NaN)

            expect(result).toEqual([10])
        })
    })
})
