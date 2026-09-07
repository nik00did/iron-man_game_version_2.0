import { SceneEntity } from "@src/logic/components/sceneEntity.js"
import type { Box, SceneEntityProps } from "@src/logic/components/sceneEntity.js"

function createEntity(overrides: Partial<SceneEntityProps> = {}): SceneEntity {
    return new SceneEntity({
        width: 10,
        height: 10,
        color: "iron-man.png",
        x: 0,
        y: 0,
        type: "character",
        ...overrides,
    })
}

function box(x: number, y: number, width = 10, height = 10): Box {
    return { x, y, width, height }
}

describe("SceneEntity", () => {
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
        it("stores props, defaults speedX to 0, and sets image.src from color", () => {
            const props = {
                width: 50,
                height: 40,
                color: "hero.png",
                x: 3,
                y: 7,
                type: "plane",
            }

            const entity = createEntity(props)

            expect(Image).toHaveBeenCalledTimes(1)
            expect(entity).toMatchObject({
                width: 50,
                height: 40,
                color: "hero.png",
                x: 3,
                y: 7,
                type: "plane",
                speedX: 0,
                speedY: 0,
            })
            expect(entity.image.src).toBe("hero.png")
        })

        it("uses the given speedX", () => {
            const speedX = -4

            const entity = createEntity({ speedX })

            expect(entity.speedX).toBe(-4)
        })
    })

    describe("update", () => {
        it("draws the image at the entity position and size", () => {
            const entity = createEntity({ x: 8, y: 12, width: 20, height: 30 })
            const ctx = { drawImage: jest.fn() }

            entity.update(ctx as unknown as CanvasRenderingContext2D)

            expect(ctx.drawImage).toHaveBeenCalledTimes(1)
            expect(ctx.drawImage).toHaveBeenCalledWith(
                entity.image,
                8,
                12,
                20,
                30,
            )
        })
    })

    describe("newPos", () => {
        it("adds speedX and speedY to position", () => {
            const entity = createEntity({ x: 10, y: 20, speedX: 3 })
            entity.speedY = -2

            entity.newPos()

            expect(entity.x).toBe(13)
            expect(entity.y).toBe(18)
        })
    })

    describe("crashWith", () => {
        it("returns true when boxes overlap", () => {
            const entity = createEntity({ x: 0, y: 0 })
            const other = box(5, 5)

            const crashed = entity.crashWith(other)

            expect(crashed).toBe(true)
        })

        it("returns true when edges touch", () => {
            const entity = createEntity({ x: 0, y: 0 })
            const other = box(10, 0)

            const crashed = entity.crashWith(other)

            expect(crashed).toBe(true)
        })

        it("returns false when the other box is fully to the right", () => {
            const entity = createEntity({ x: 0, y: 0 })
            const other = box(11, 0)

            const crashed = entity.crashWith(other)

            expect(crashed).toBe(false)
        })

        it("returns false when the other box is fully to the left", () => {
            const entity = createEntity({ x: 20, y: 0 })
            const other = box(0, 0)

            const crashed = entity.crashWith(other)

            expect(crashed).toBe(false)
        })

        it("returns false when the other box is fully below", () => {
            const entity = createEntity({ x: 0, y: 0 })
            const other = box(0, 11)

            const crashed = entity.crashWith(other)

            expect(crashed).toBe(false)
        })

        it("returns false when the other box is fully above", () => {
            const entity = createEntity({ x: 0, y: 20 })
            const other = box(0, 0)

            const crashed = entity.crashWith(other)

            expect(crashed).toBe(false)
        })
    })
})
