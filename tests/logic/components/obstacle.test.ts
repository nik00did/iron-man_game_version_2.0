import { Obstacle } from "@src/logic/components/obstacle.js"
import type { ObstacleProps } from "@src/logic/components/obstacle.js"

function createObstacle(overrides: Partial<ObstacleProps> = {}): Obstacle {
    return new Obstacle({
        width: 10,
        height: 10,
        color: "building.svg",
        x: 0,
        y: 0,
        type: "building",
        ...overrides,
    })
}

describe("Obstacle", () => {
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
        it("stores props and sets image.src from color", () => {
            const obstacle = createObstacle({
                width: 60,
                height: 80,
                color: "cloud.svg",
                x: 1000,
                y: 20,
                type: "cloud",
                speedX: -3,
            })

            expect(Image).toHaveBeenCalledTimes(1)
            expect(obstacle).toMatchObject({
                width: 60,
                height: 80,
                color: "cloud.svg",
                x: 1000,
                y: 20,
                type: "cloud",
                speedX: -3,
            })
            expect(obstacle.image.src).toBe("cloud.svg")
        })

        it("defaults speedX to 0", () => {
            const obstacle = createObstacle()

            expect(obstacle.speedX).toBe(0)
        })
    })

    describe("update", () => {
        it("draws the image at the obstacle position and size", () => {
            const obstacle = createObstacle({
                x: 8,
                y: 12,
                width: 20,
                height: 30,
            })
            const ctx = { drawImage: jest.fn() }

            obstacle.update(ctx as unknown as CanvasRenderingContext2D)

            expect(ctx.drawImage).toHaveBeenCalledWith(
                obstacle.image,
                8,
                12,
                20,
                30,
            )
        })
    })
})
