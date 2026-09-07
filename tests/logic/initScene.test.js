const start = jest.fn()
const Scene = jest.fn(() => ({ start }))

jest.unstable_mockModule("@src/logic/components/scene.js", () => ({
    Scene,
}))

const { initScene } = await import("@src/logic/initScene.js")

describe("initScene", () => {
    beforeEach(() => {
        start.mockClear()
        Scene.mockClear()
    })

    it("creates a Scene and calls start once", () => {
        initScene()

        expect(Scene).toHaveBeenCalledTimes(1)
        expect(start).toHaveBeenCalledTimes(4)
    })
})
