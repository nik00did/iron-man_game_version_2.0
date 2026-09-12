import { SCORE_HUD } from "@src/constants.js"
import { getTopScores, saveScore } from "@src/logic/components/records.js"

type StorageMock = {
    getItem: jest.Mock
    setItem: jest.Mock
}

describe("records", () => {
    let storage: StorageMock

    beforeEach(() => {
        storage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
        }
        Object.defineProperty(globalThis, "localStorage", {
            configurable: true,
            value: storage,
        })
    })

    afterEach(() => {
        Reflect.deleteProperty(globalThis, "localStorage")
    })

    describe("getTopScores", () => {
        it("returns an empty list when nothing is stored", () => {
            storage.getItem.mockReturnValue(null)

            const result = getTopScores()

            expect(storage.getItem).toHaveBeenCalledWith(SCORE_HUD.STORAGE_KEY)
            expect(result).toEqual([])
        })

        it("returns an empty list when stored value is empty", () => {
            storage.getItem.mockReturnValue("")

            const result = getTopScores()

            expect(result).toEqual([])
        })

        it("returns an empty list when JSON is invalid", () => {
            storage.getItem.mockReturnValue("{not-json")

            const result = getTopScores()

            expect(result).toEqual([])
        })

        it("returns an empty list when stored JSON is not an array", () => {
            storage.getItem.mockReturnValue(JSON.stringify({ score: 1 }))

            const result = getTopScores()

            expect(result).toEqual([])
        })

        it("keeps finite numbers only and caps at max records", () => {
            storage.getItem.mockReturnValue(JSON.stringify([1, "x", 2, null, 3, 4]))

            const result = getTopScores()

            expect(result).toEqual([1, 2, 3])
        })
    })

    describe("saveScore", () => {
        it("appends, sorts descending, persists, and returns the top scores", () => {
            storage.getItem.mockReturnValue(JSON.stringify([10, 5]))

            const result = saveScore(8)

            expect(result).toEqual([10, 8, 5])
            expect(storage.setItem).toHaveBeenCalledWith(
                SCORE_HUD.STORAGE_KEY,
                JSON.stringify([10, 8, 5]),
            )
        })

        it("keeps only the top max records", () => {
            storage.getItem.mockReturnValue(JSON.stringify([10, 9, 8]))

            const result = saveScore(7)

            expect(result).toEqual([10, 9, 8])
        })

        it("allows duplicate scores", () => {
            storage.getItem.mockReturnValue(JSON.stringify([8]))

            const result = saveScore(8)

            expect(result).toEqual([8, 8])
        })

        it("still returns the list when setItem throws", () => {
            storage.getItem.mockReturnValue(JSON.stringify([10]))
            storage.setItem.mockImplementation((): never => {
                throw new Error("quota")
            })

            const result = saveScore(4)

            expect(result).toEqual([10, 4])
        })

        it("does not keep a non-finite score", () => {
            storage.getItem.mockReturnValue(JSON.stringify([10]))

            const result = saveScore(Number.NaN)

            expect(result).toEqual([10])
        })
    })
})
