import { ENERGY_TOKEN } from "@src/constants.js"
import { EnergyToken } from "@src/logic/components/energyToken.js"

describe("EnergyToken", () => {
    describe("constructor", () => {
        it("stores position and uses token size and speed", () => {
            const token = new EnergyToken({ x: 100, y: 80 })

            expect(token).toMatchObject({
                x: 100,
                y: 80,
                width: ENERGY_TOKEN.SIZE,
                height: ENERGY_TOKEN.SIZE,
                speedX: ENERGY_TOKEN.SPEED,
            })
        })

        it("uses the given speedX", () => {
            const token = new EnergyToken({ x: 0, y: 0, speedX: -4 })

            expect(token.speedX).toBe(-4)
        })
    })

    describe("update", () => {
        it("draws a cyan radial gradient circle", () => {
            const token = new EnergyToken({ x: 10, y: 20 })
            const gradient = { addColorStop: jest.fn() }
            const ctx = {
                drawImage: jest.fn(),
                fillRect: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                createRadialGradient: jest.fn(() => gradient),
                fillStyle: "",
            }

            token.update(ctx as unknown as CanvasRenderingContext2D)

            expect(ctx.createRadialGradient).toHaveBeenCalledWith(
                35,
                45,
                (ENERGY_TOKEN.SIZE / 2) * 0.15,
                35,
                45,
                ENERGY_TOKEN.SIZE / 2,
            )
            expect(gradient.addColorStop).toHaveBeenCalledWith(
                0,
                ENERGY_TOKEN.CORE,
            )
            expect(gradient.addColorStop).toHaveBeenCalledWith(
                0.45,
                ENERGY_TOKEN.MID,
            )
            expect(gradient.addColorStop).toHaveBeenCalledWith(
                1,
                ENERGY_TOKEN.EDGE,
            )
            expect(ctx.arc).toHaveBeenCalledWith(
                35,
                45,
                ENERGY_TOKEN.SIZE / 2,
                0,
                Math.PI * 2,
            )
            expect(ctx.fill).toHaveBeenCalledTimes(1)
            expect(ctx.drawImage).not.toHaveBeenCalled()
            expect(ctx.fillRect).not.toHaveBeenCalled()
        })
    })

    describe("move", () => {
        it("adds speedX to x", () => {
            const token = new EnergyToken({ x: 10, y: 20, speedX: -2 })

            token.move()

            expect(token.x).toBe(8)
            expect(token.y).toBe(20)
        })
    })

    describe("isOffScreen", () => {
        it("returns false while the token is still visible", () => {
            const token = new EnergyToken({ x: 10, y: 0 })

            expect(token.isOffScreen()).toBe(false)
        })

        it("returns true when the token has fully left the left edge", () => {
            const token = new EnergyToken({ x: -ENERGY_TOKEN.SIZE, y: 0 })

            expect(token.isOffScreen()).toBe(true)
        })
    })
})
