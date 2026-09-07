const mount = jest.fn()
const Scene = jest.fn((): { mount: jest.Mock } => ({ mount }))

jest.unstable_mockModule("@src/logic/components/scene.js", (): { Scene: jest.Mock } => ({
    Scene,
}))

const { initScene } = await import("@src/logic/initScene.js")

describe("initScene", () => {
    beforeEach(() => {
        mount.mockClear()
        Scene.mockClear()
    })

    it("creates a Scene and calls mount once", () => {
        initScene()

        expect(Scene).toHaveBeenCalledTimes(1)
        expect(mount).toHaveBeenCalledTimes(1)
    })
})
