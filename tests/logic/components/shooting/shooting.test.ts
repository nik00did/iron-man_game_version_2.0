import { BLAST, CANVAS, ENTITY_TYPE } from "@src/constants.ts"
import Shooting, { Blast } from "@src/logic/components/shooting"
import type { Obstacle } from "@src/logic/components/obstacle.ts"

function box(
    x: number,
    y: number,
    type = ENTITY_TYPE.CLOUD,
): Obstacle {
    return {
        x,
        y,
        width: 20,
        height: 20,
        type,
    } as Obstacle
}

describe("Shooting", () => {
    describe("addAmmo", () => {
        it("increments ammo up to the max", () => {
            const shooting = new Shooting()

            expect(shooting.addAmmo()).toBe(true)
            expect(shooting.addAmmo()).toBe(true)
            expect(shooting.addAmmo()).toBe(true)
            expect(shooting.addAmmo()).toBe(false)
            expect(shooting.ammo).toBe(BLAST.MAX_AMMO)
        })
    })

    describe("fire", () => {
        it("spawns a blast at the origin center and spends one ammo", () => {
            const shooting = new Shooting()
            shooting.addAmmo()

            const fired = shooting.fire({ x: 100, y: 50, width: 50, height: 50 })

            expect(fired).toBe(true)
            expect(shooting.ammo).toBe(0)
            expect(shooting.blasts).toHaveLength(1)
            expect(shooting.blasts[0]).toMatchObject({
                x: 120,
                y: 70,
                width: BLAST.SIZE,
                height: BLAST.SIZE,
                speedX: BLAST.SPEED,
            })
            expect(shooting.blasts[0]).toBeInstanceOf(Blast)
        })

        it("does not fire when ammo is empty", () => {
            const shooting = new Shooting()

            expect(shooting.fire({ x: 0, y: 0, width: 10, height: 10 })).toBe(
                false,
            )
            expect(shooting.blasts).toHaveLength(0)
            expect(shooting.ammo).toBe(0)
        })

        it("allows more than one blast on screen", () => {
            const shooting = new Shooting()
            const origin = { x: 0, y: 0, width: 50, height: 50 }
            shooting.addAmmo()
            shooting.addAmmo()

            shooting.fire(origin)
            shooting.fire(origin)

            expect(shooting.blasts).toHaveLength(2)
            expect(shooting.ammo).toBe(0)
        })
    })

    describe("move", () => {
        it("moves every blast to the right", () => {
            const shooting = new Shooting()
            shooting.addAmmo()
            shooting.addAmmo()
            shooting.fire({ x: 0, y: 0, width: 10, height: 10 })
            shooting.fire({ x: 20, y: 0, width: 10, height: 10 })

            shooting.move()

            expect(shooting.blasts[0].x).toBe(BLAST.SPEED)
            expect(shooting.blasts[1].x).toBe(20 + BLAST.SPEED)
        })
    })

    describe("removeOffScreen", () => {
        it("keeps blasts that are still on the canvas", () => {
            const shooting = new Shooting()
            shooting.blasts.push(new Blast({ x: 10, y: 20 }))

            shooting.removeOffScreen(CANVAS)

            expect(shooting.blasts).toHaveLength(1)
        })

        it("removes blasts that have left the canvas", () => {
            const shooting = new Shooting()
            shooting.blasts.push(new Blast({ x: CANVAS.width, y: 20 }))

            shooting.removeOffScreen(CANVAS)

            expect(shooting.blasts).toHaveLength(0)
        })
    })

    describe("hitObstacles", () => {
        it("removes a cloud and the blast that hit it", () => {
            const shooting = new Shooting()
            shooting.blasts.push(new Blast({ x: 10, y: 10 }))
            const cloud = box(10, 10)
            const leftover = box(200, 10)

            const remaining = shooting.hitObstacles([cloud, leftover])

            expect(remaining).toEqual([leftover])
            expect(shooting.blasts).toHaveLength(0)
        })

        it("destroys a plane on contact", () => {
            const shooting = new Shooting()
            shooting.blasts.push(new Blast({ x: 8, y: 8 }))
            const plane = box(10, 10, ENTITY_TYPE.PLANE)

            const remaining = shooting.hitObstacles([plane])

            expect(remaining).toEqual([])
            expect(shooting.blasts).toHaveLength(0)
        })

        it("passes through buildings without destroying them", () => {
            const shooting = new Shooting()
            const blast = new Blast({ x: 10, y: 10 })
            shooting.blasts.push(blast)
            const building = box(10, 10, ENTITY_TYPE.BUILDING)

            const remaining = shooting.hitObstacles([building])

            expect(remaining).toEqual([building])
            expect(shooting.blasts).toEqual([blast])
        })

        it("does not hit obstacles that do not overlap", () => {
            const shooting = new Shooting()
            const blast = new Blast({ x: 0, y: 0 })
            shooting.blasts.push(blast)
            const cloud = box(100, 100)

            const remaining = shooting.hitObstacles([cloud])

            expect(remaining).toEqual([cloud])
            expect(shooting.blasts).toEqual([blast])
        })
    })

    describe("draw", () => {
        it("draws every blast", () => {
            const shooting = new Shooting()
            const first = new Blast({ x: 1, y: 2 })
            const second = new Blast({ x: 3, y: 4 })
            shooting.blasts.push(first, second)
            const update = jest
                .spyOn(Blast.prototype, "update")
                .mockImplementation((): void => {})
            const ctx = {} as CanvasRenderingContext2D

            shooting.draw(ctx)

            expect(update).toHaveBeenNthCalledWith(1, ctx)
            expect(update).toHaveBeenNthCalledWith(2, ctx)
            update.mockRestore()
        })
    })

    describe("clear", () => {
        it("removes every blast and resets ammo", () => {
            const shooting = new Shooting()
            shooting.addAmmo()
            shooting.fire({ x: 0, y: 0, width: 10, height: 10 })
            shooting.addAmmo()

            shooting.clear()

            expect(shooting.blasts).toEqual([])
            expect(shooting.ammo).toBe(0)
        })
    })
})
