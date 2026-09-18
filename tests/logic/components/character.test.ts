import { ENTITY_TYPE, ICONS } from "@src/constants.ts"
import { Character } from "@src/logic/components/character.ts"
import type { Box } from "@src/logic/components/sceneEntity.ts"
import type { CharacterProps } from "@src/logic/components/character.ts"

function createCharacter(overrides: Partial<CharacterProps> = {}): Character {
    return new Character({
        width: 10,
        height: 10,
        color: "iron-man.png",
        x: 0,
        y: 0,
        ...overrides,
    })
}

function box(x: number, y: number, width = 10, height = 10): Box {
    return { x, y, width, height }
}

describe("Character", () => {
    beforeEach(() => {
        Object.defineProperty(globalThis, "Image", {
            configurable: true,
            value: jest.fn(() => ({ src: "" })),
        })
    })

    afterEach(() => {
        Reflect.deleteProperty(globalThis, "Image")
    })

    describe("constructor", () => {
        it("stores props, defaults speed, and sets image.src from color", () => {
            const character = createCharacter({
                width: 50,
                height: 40,
                color: "hero.png",
                x: 3,
                y: 7,
            })

            expect(Image).toHaveBeenCalledTimes(1)
            expect(character).toMatchObject({
                width: 50,
                height: 40,
                color: "hero.png",
                x: 3,
                y: 7,
                type: ENTITY_TYPE.CHARACTER,
                speedX: 0,
                speedY: 0,
            })
            expect(character.image.src).toBe("hero.png")
            expect(character.fillColor).toBeNull()
        })
    })

    describe("whenReady", () => {
        it("resolves immediately when the image is already complete", async () => {
            const decode = jest.fn()
            Object.defineProperty(globalThis, "Image", {
                configurable: true,
                value: jest.fn(() => ({ src: "", complete: true, decode })),
            })
            const character = createCharacter()

            await character.whenReady()

            expect(decode).not.toHaveBeenCalled()
        })

        it("waits for decode when the image is not complete", async () => {
            const decode = jest.fn((): Promise<void> => Promise.resolve())
            Object.defineProperty(globalThis, "Image", {
                configurable: true,
                value: jest.fn(() => ({ src: "", complete: false, decode })),
            })
            const character = createCharacter()

            await character.whenReady()

            expect(decode).toHaveBeenCalledTimes(1)
        })

        it("resolves when decode fails", async () => {
            const decode = jest.fn((): Promise<void> =>
                Promise.reject(new Error("bad image")),
            )
            Object.defineProperty(globalThis, "Image", {
                configurable: true,
                value: jest.fn(() => ({ src: "", complete: false, decode })),
            })
            const character = createCharacter()

            await expect(character.whenReady()).resolves.toBeUndefined()
        })
    })

    describe("update", () => {
        it("draws the image at the character position and size", () => {
            const character = createCharacter({
                x: 8,
                y: 12,
                width: 20,
                height: 30,
            })
            const ctx = { drawImage: jest.fn() }

            character.update(ctx as unknown as CanvasRenderingContext2D)

            expect(ctx.drawImage).toHaveBeenCalledTimes(1)
            expect(ctx.drawImage).toHaveBeenCalledWith(
                character.image,
                8,
                12,
                20,
                30,
            )
        })

        it("fills a rectangle when fillColor is set", () => {
            const character = createCharacter({
                x: 8,
                y: 12,
                width: 20,
                height: 30,
            })
            character.fillColor = "#4aa3de"
            const ctx = {
                drawImage: jest.fn(),
                fillRect: jest.fn(),
                fillStyle: "",
            }

            character.update(ctx as unknown as CanvasRenderingContext2D)

            expect(ctx.fillStyle).toBe("#4aa3de")
            expect(ctx.fillRect).toHaveBeenCalledWith(8, 12, 20, 30)
            expect(ctx.drawImage).not.toHaveBeenCalled()
        })
    })

    describe("newPos", () => {
        it("adds speedX and speedY to position", () => {
            const character = createCharacter({ x: 10, y: 20 })
            character.speedX = 3
            character.speedY = -2

            character.newPos()

            expect(character.x).toBe(13)
            expect(character.y).toBe(18)
        })
    })

    describe("applyAppearance", () => {
        it("sets fillColor for a fill appearance", () => {
            const character = createCharacter()

            character.applyAppearance({ kind: "fill", color: "#4aa3de" })

            expect(character.fillColor).toBe("#4aa3de")
        })

        it("sets the pose image and clears fillColor", () => {
            const character = createCharacter()
            character.fillColor = "#4aa3de"

            character.applyAppearance({ kind: "image", src: ICONS.MOVE_RIGHT })

            expect(character.fillColor).toBeNull()
            expect(character.image.src).toBe(ICONS.MOVE_RIGHT)
        })

        it("does nothing when appearance is null", () => {
            const character = createCharacter()
            character.image.src = ICONS.IRON_MAN

            character.applyAppearance(null)

            expect(character.image.src).toBe(ICONS.IRON_MAN)
            expect(character.fillColor).toBeNull()
        })
    })

    describe("crashWith", () => {
        it("returns true when boxes overlap", () => {
            const character = createCharacter({ x: 0, y: 0 })

            expect(character.crashWith(box(5, 5))).toBe(true)
        })

        it("returns true when edges touch", () => {
            const character = createCharacter({ x: 0, y: 0 })

            expect(character.crashWith(box(10, 0))).toBe(true)
        })

        it("returns false when the other box is fully to the right", () => {
            const character = createCharacter({ x: 0, y: 0 })

            expect(character.crashWith(box(11, 0))).toBe(false)
        })

        it("returns false when the other box is fully to the left", () => {
            const character = createCharacter({ x: 20, y: 0 })

            expect(character.crashWith(box(0, 0))).toBe(false)
        })

        it("returns false when the other box is fully below", () => {
            const character = createCharacter({ x: 0, y: 0 })

            expect(character.crashWith(box(0, 11))).toBe(false)
        })

        it("returns false when the other box is fully above", () => {
            const character = createCharacter({ x: 0, y: 20 })

            expect(character.crashWith(box(0, 0))).toBe(false)
        })
    })
})
