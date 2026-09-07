import { Background } from "@src/logic/components/background.js"
import { SceneEntity } from "@src/logic/components/sceneEntity.js"
import type { SceneEntityProps } from "@src/logic/components/sceneEntity.js"

function createBackground(overrides: Partial<SceneEntityProps> = {}): Background {
    return new Background({
        width: 100,
        height: 50,
        color: "sky.png",
        x: 0,
        y: 0,
        type: "background",
        ...overrides,
    })
}

describe("Background", () => {
    beforeEach(() => {
        Object.defineProperty(globalThis, "Image", {
            configurable: true,
            value: jest.fn(() => ({ src: "" })),
        })
    })

    afterEach(() => {
        Reflect.deleteProperty(globalThis, "Image")
    })

    describe("update", () => {
        let superUpdate: jest.SpyInstance

        beforeEach(() => {
            superUpdate = jest
                .spyOn(SceneEntity.prototype, "update")
                .mockImplementation((): void => {})
        })

        afterEach(() => {
            superUpdate.mockRestore()
        })

        it("calls parent update then draws the image at x plus width", () => {
            const background = createBackground({
                x: -20,
                y: 4,
                width: 100,
                height: 50,
            })
            const ctx = { drawImage: jest.fn() }

            background.update(ctx as unknown as CanvasRenderingContext2D)

            expect(superUpdate).toHaveBeenCalledWith(ctx)
            expect(ctx.drawImage).toHaveBeenCalledTimes(1)
            expect(ctx.drawImage).toHaveBeenCalledWith(
                background.image,
                80,
                4,
                100,
                50,
            )
        })
    })

    describe("wrap", () => {
        it("resets x to 0 when the background has scrolled by its full width", () => {
            const background = createBackground({ x: -100, width: 100 })

            background.wrap()

            expect(background.x).toBe(0)
        })

        it("does not change x when the background has not scrolled by its full width", () => {
            const background = createBackground({ x: -99, width: 100 })

            background.wrap()

            expect(background.x).toBe(-99)
        })
    })
})
