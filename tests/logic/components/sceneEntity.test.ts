import { SceneEntity } from "@src/logic/components/sceneEntity.ts"
import type { SceneEntityProps } from "@src/logic/components/sceneEntity.ts"

function createEntity(
    overrides: Partial<SceneEntityProps> = {},
): SceneEntity {
    return new SceneEntity({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        ...overrides,
    })
}

describe("SceneEntity", () => {
    describe("constructor", () => {
        it("stores position, size, and defaults speedX to 0", () => {
            const entity = createEntity({ x: 3, y: 7, width: 50, height: 40 })

            expect(entity).toMatchObject({
                x: 3,
                y: 7,
                width: 50,
                height: 40,
                speedX: 0,
            })
        })

        it("uses the given speedX", () => {
            const entity = createEntity({ speedX: -4 })

            expect(entity.speedX).toBe(-4)
        })
    })

    describe("move", () => {
        it("adds speedX to x", () => {
            const entity = createEntity({ x: 10, y: 20, speedX: -3 })

            entity.move()

            expect(entity.x).toBe(7)
            expect(entity.y).toBe(20)
        })
    })

    describe("isOffScreen", () => {
        it("returns false while the entity is still visible", () => {
            const entity = createEntity({ x: 10, width: 10 })

            expect(entity.isOffScreen()).toBe(false)
        })

        it("returns true when the entity has fully left the left edge", () => {
            const entity = createEntity({ x: -10, width: 10 })

            expect(entity.isOffScreen()).toBe(true)
        })
    })
})
