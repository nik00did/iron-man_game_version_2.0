import {
    CANVAS,
    ENTITY_TYPE,
    ICONS,
    KEYS,
    OBSTACLE_SPAWNS,
    SOUNDS,
    TICK_MS,
} from "@src/constants.js"
import type { SceneEntity } from "@src/logic/components/sceneEntity.js"
import type { SceneEntityProps } from "@src/logic/components/sceneEntity.js"

type KeyEvent = { key: string; preventDefault?: () => void }

type CanvasMock = {
    width: number
    height: number
    getContext: jest.Mock
    addEventListener: jest.Mock
}

const Sound = jest.fn()
const SceneEntityMock = jest.fn()
const Background = jest.fn()
const ScoreHud = jest.fn()
const getTopScores = jest.fn()
const saveScore = jest.fn()

jest.unstable_mockModule("@src/logic/components/sound.js", (): { Sound: jest.Mock } => ({
    Sound,
}))
jest.unstable_mockModule("@src/logic/components/sceneEntity.js", (): { SceneEntity: jest.Mock } => ({
    SceneEntity: SceneEntityMock,
}))
jest.unstable_mockModule("@src/logic/components/background.js", (): { Background: jest.Mock } => ({
    Background,
}))
jest.unstable_mockModule("@src/logic/components/scoreHud.js", (): { ScoreHud: jest.Mock } => ({
    ScoreHud,
}))
jest.unstable_mockModule("@src/logic/records.js", (): {
    getTopScores: jest.Mock
    saveScore: jest.Mock
} => ({
    getTopScores,
    saveScore,
}))

const { Scene } = await import("@src/logic/components/scene.js")

function getListener(mockFn: jest.Mock, type: string): (event?: KeyEvent) => void {
    const matched = mockFn.mock.calls.find((call) => call[0] === type)
    return matched[1] as (event?: KeyEvent) => void
}

function asMock(fn: unknown): jest.Mock {
    return fn as jest.Mock
}

function asEntity(value: unknown): SceneEntity {
    return value as SceneEntity
}

describe("Scene", () => {
    let context: { clearRect: jest.Mock }
    let canvas: CanvasMock

    beforeEach(() => {
        context = { clearRect: jest.fn() }
        canvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(() => context),
            addEventListener: jest.fn(),
        }

        Sound.mockImplementation((): { play: jest.Mock; stop: jest.Mock } => ({
            play: jest.fn(),
            stop: jest.fn(),
        }))
        SceneEntityMock.mockImplementation((props: Partial<SceneEntityProps> = {}) => ({
            width: props.width,
            height: props.height,
            color: props.color,
            x: props.x,
            y: props.y,
            type: props.type,
            speedX: props.speedX ?? 0,
            speedY: 0,
            image: { src: props.color ?? "" },
            crashWith: jest.fn(() => false),
            newPos: jest.fn(),
            update: jest.fn(),
        }))
        Background.mockImplementation((): { wrap: jest.Mock; update: jest.Mock } => ({
            wrap: jest.fn(),
            update: jest.fn(),
        }))
        ScoreHud.mockImplementation((): { draw: jest.Mock } => ({
            draw: jest.fn(),
        }))
        getTopScores.mockReset()
        saveScore.mockReset()
        getTopScores.mockReturnValue([12.5, 8, 3])
        saveScore.mockReturnValue([12.5, 8, 3])

        Sound.mockClear()
        SceneEntityMock.mockClear()
        Background.mockClear()
        ScoreHud.mockClear()

        Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {
                createElement: jest.fn(() => canvas),
                body: {
                    insertBefore: jest.fn(),
                    childNodes: [null],
                },
            },
        })
        Object.defineProperty(globalThis, "window", {
            configurable: true,
            value: {
                addEventListener: jest.fn(),
            },
        })
        Object.defineProperty(globalThis, "requestAnimationFrame", {
            configurable: true,
            value: jest.fn(() => 77),
        })
        Object.defineProperty(globalThis, "cancelAnimationFrame", {
            configurable: true,
            value: jest.fn(),
        })
    })

    afterEach(() => {
        Reflect.deleteProperty(globalThis, "document")
        Reflect.deleteProperty(globalThis, "window")
        Reflect.deleteProperty(globalThis, "requestAnimationFrame")
        Reflect.deleteProperty(globalThis, "cancelAnimationFrame")
    })

    describe("constructor", () => {
        it("creates the canvas, context, sounds, character, and background", () => {
            const scene = new Scene()

            expect(document.createElement).toHaveBeenCalledWith("canvas")
            expect(scene.canvas.width).toBe(CANVAS.width)
            expect(scene.canvas.height).toBe(CANVAS.height)
            expect(canvas.getContext).toHaveBeenCalledWith("2d")
            expect(Sound).toHaveBeenCalledWith(SOUNDS.FIRST_FIGHT)
            expect(Sound).toHaveBeenCalledWith(SOUNDS.LOVE_ME_AGAIN)
            expect(SceneEntityMock).toHaveBeenCalledWith({
                width: 50,
                height: 50,
                color: ICONS.IRON_MAN,
                x: 0,
                y: CANVAS.height / 2,
                type: ENTITY_TYPE.CHARACTER,
            })
            expect(Background).toHaveBeenCalledWith({
                width: CANVAS.width,
                height: CANVAS.height,
                color: ICONS.BACKGROUND,
                x: 0,
                y: 0,
                type: ENTITY_TYPE.BACKGROUND,
            })
            expect(ScoreHud).toHaveBeenCalledTimes(1)
            expect(getTopScores).toHaveBeenCalledTimes(1)
            expect(scene.topScores).toEqual([12.5, 8, 3])
            expect(scene.scoreSeconds).toBe(0)
            expect(scene.obstacles).toEqual([])
            expect(scene.running).toBe(false)
            expect(scene.musicStarted).toBe(false)
        })
    })

    describe("start", () => {
        it("mounts the canvas, starts the loop, and binds input listeners", () => {
            const scene = new Scene()

            scene.start()

            expect(document.body.insertBefore).toHaveBeenCalledWith(
                scene.canvas,
                document.body.childNodes[0],
            )
            expect(scene.running).toBe(true)
            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
            expect(window.addEventListener).toHaveBeenCalledWith(
                "keydown",
                expect.any(Function),
            )
            expect(window.addEventListener).toHaveBeenCalledWith(
                "keyup",
                expect.any(Function),
            )
            expect(canvas.addEventListener).toHaveBeenCalledWith(
                "pointerdown",
                expect.any(Function),
            )
        })

        it("prevents default on arrow keys, stores the key, and starts music", () => {
            const scene = new Scene()
            scene.start()
            const preventDefault = jest.fn()
            const keydown = getListener(asMock(window.addEventListener), "keydown")

            keydown({ key: KEYS.LEFT, preventDefault })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(scene.key?.[KEYS.LEFT]).toBe(true)
            expect(asMock(scene.music.play)).toHaveBeenCalledTimes(1)
        })

        it("does not prevent default for non-arrow keys", () => {
            const scene = new Scene()
            scene.start()
            const preventDefault = jest.fn()
            const keydown = getListener(asMock(window.addEventListener), "keydown")

            keydown({ key: "a", preventDefault })

            expect(preventDefault).not.toHaveBeenCalled()
            expect(scene.key?.a).toBe(true)
        })

        it("clears the key on keyup", () => {
            const scene = new Scene()
            scene.start()
            if (scene.key)
                scene.key[KEYS.RIGHT] = true
            const keyup = getListener(asMock(window.addEventListener), "keyup")

            keyup({ key: KEYS.RIGHT })

            expect(scene.key?.[KEYS.RIGHT]).toBe(false)
        })

        it("starts music on canvas pointerdown", () => {
            const scene = new Scene()
            scene.start()
            const pointerdown = getListener(canvas.addEventListener, "pointerdown")

            pointerdown()

            expect(asMock(scene.music.play)).toHaveBeenCalledTimes(1)
        })
    })

    describe("startMusic", () => {
        it("plays music once", () => {
            const scene = new Scene()

            scene.startMusic()
            scene.startMusic()

            expect(scene.musicStarted).toBe(true)
            expect(asMock(scene.music.play)).toHaveBeenCalledTimes(1)
        })
    })

    describe("stop", () => {
        it("stops the loop and cancels the animation frame", () => {
            const scene = new Scene()
            scene.running = true
            scene.rafId = 77

            scene.stop()

            expect(scene.running).toBe(false)
            expect(cancelAnimationFrame).toHaveBeenCalledWith(77)
        })
    })

    describe("stopOnCollision", () => {
        it("stops music, plays the collision sound, and stops the scene", () => {
            const scene = new Scene()
            scene.running = true
            scene.rafId = 77

            scene.stopOnCollision()

            expect(asMock(scene.music.stop)).toHaveBeenCalledTimes(1)
            expect(asMock(scene.collisionSound.play)).toHaveBeenCalledTimes(1)
            expect(saveScore).toHaveBeenCalledWith(scene.scoreSeconds)
            expect(scene.running).toBe(false)
            expect(cancelAnimationFrame).toHaveBeenCalledWith(77)
        })
    })

    describe("clear", () => {
        it("clears the canvas", () => {
            const scene = new Scene()

            scene.clear()

            expect(context.clearRect).toHaveBeenCalledWith(
                0,
                0,
                CANVAS.width,
                CANVAS.height,
            )
        })
    })

    describe("everyInterval", () => {
        it("returns true when frameNo is a multiple of n", () => {
            const scene = new Scene()
            scene.frameNo = 10

            const result = scene.everyInterval(5)

            expect(result).toBe(true)
        })

        it("returns false when frameNo is not a multiple of n", () => {
            const scene = new Scene()
            scene.frameNo = 11

            const result = scene.everyInterval(5)

            expect(result).toBe(false)
        })
    })

    describe("shouldAddObstacle", () => {
        it("returns true on the first frame", () => {
            const scene = new Scene()
            scene.frameNo = 1

            const result = scene.shouldAddObstacle(999)

            expect(result).toBe(true)
        })

        it("returns true when the interval matches", () => {
            const scene = new Scene()
            scene.frameNo = 10

            const result = scene.shouldAddObstacle(5)

            expect(result).toBe(true)
        })
    })

    describe("handleObstacleCollision", () => {
        it("does not stop when no obstacle crashes", () => {
            const scene = new Scene()
            const obstacle = {}
            scene.obstacles = [asEntity(obstacle)]
            const stopOnCollision = jest.spyOn(scene, "stopOnCollision")

            scene.handleObstacleCollision()

            expect(asMock(scene.character.crashWith)).toHaveBeenCalledWith(obstacle)
            expect(stopOnCollision).not.toHaveBeenCalled()
        })

        it("stops on the first crashing obstacle", () => {
            const scene = new Scene()
            const first = {}
            const second = {}
            scene.obstacles = [asEntity(first), asEntity(second)]
            asMock(scene.character.crashWith)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
            const stopOnCollision = jest.spyOn(scene, "stopOnCollision")

            scene.handleObstacleCollision()

            expect(asMock(scene.character.crashWith)).toHaveBeenCalledTimes(2)
            expect(stopOnCollision).toHaveBeenCalledTimes(1)
        })
    })

    describe("generateNewObstacles", () => {
        it("pushes a SceneEntity for each spawn when shouldAddObstacle is true", () => {
            const scene = new Scene()
            scene.frameNo = 1

            scene.generateNewObstacles()

            expect(scene.obstacles).toHaveLength(OBSTACLE_SPAWNS.length)
            expect(SceneEntityMock).toHaveBeenCalledWith({
                width: 100,
                height: 60,
                color: ICONS.CLOUD,
                x: CANVAS.width,
                y: CANVAS.height - 320,
                type: ENTITY_TYPE.CLOUD,
                speedX: -3,
            })
            const buildingProps = SceneEntityMock.mock.calls[
                SceneEntityMock.mock.calls.length - 1
            ][0] as SceneEntityProps
            expect(buildingProps).toMatchObject({
                width: 60,
                color: ICONS.BUILDING,
                x: CANVAS.width,
                type: ENTITY_TYPE.BUILDING,
                speedX: -2,
            })
            expect(buildingProps.y).toBe(CANVAS.height - buildingProps.height)
        })

        it("does not push obstacles when shouldAddObstacle is false", () => {
            const scene = new Scene()
            jest.spyOn(scene, "shouldAddObstacle").mockReturnValue(false)

            scene.generateNewObstacles()

            expect(scene.obstacles).toEqual([])
        })
    })

    describe("updateObstacles", () => {
        it("moves obstacles, drops those off screen, and updates the rest", () => {
            const scene = new Scene()
            const kept = { x: 10, speedX: -3, width: 5, update: jest.fn() }
            const dropped = { x: -10, speedX: -3, width: 5, update: jest.fn() }
            scene.obstacles = [asEntity(kept), asEntity(dropped)]

            scene.updateObstacles()

            expect(kept.x).toBe(7)
            expect(scene.obstacles).toEqual([kept])
            expect(kept.update).toHaveBeenCalledWith(scene.context)
            expect(dropped.update).not.toHaveBeenCalled()
        })
    })

    describe("moveCharacter", () => {
        it("returns when key state is missing", () => {
            const scene = new Scene()
            scene.key = null

            scene.moveCharacter()

            expect(scene.character.speedX).toBe(0)
        })

        it("applies the matching player move", () => {
            const scene = new Scene()
            if (scene.key)
                scene.key[KEYS.RIGHT] = true

            scene.moveCharacter()

            expect(scene.character.image.src).toBe(ICONS.MOVE_RIGHT)
            expect(scene.character.x).toBe(0)
            expect(scene.character.speedX).toBe(4)
        })
    })

    describe("tick", () => {
        it("returns without scheduling a frame when the scene is not running", () => {
            const scene = new Scene()

            scene.tick(100)

            expect(requestAnimationFrame).not.toHaveBeenCalled()
        })

        it("sets lastTime on the first running tick and does not update", () => {
            const scene = new Scene()
            scene.running = true
            const update = jest.spyOn(scene, "update")

            scene.tick(1000)

            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
            expect(scene.lastTime).toBe(1000)
            expect(update).not.toHaveBeenCalled()
        })

        it("calls update once per tick interval", () => {
            const scene = new Scene()
            scene.running = true
            scene.lastTime = 1000
            const update = jest.spyOn(scene, "update").mockImplementation((): void => {})

            scene.tick(1000 + TICK_MS)

            expect(update).toHaveBeenCalledTimes(1)
        })
    })

    describe("update", () => {
        it("runs collision, draw, spawn, and character steps in order", () => {
            const scene = new Scene()
            const order: string[] = []
            jest.spyOn(scene, "handleObstacleCollision").mockImplementation((): void => {
                order.push("collision")
            })
            jest.spyOn(scene, "clear").mockImplementation((): void => {
                order.push("clear")
            })
            jest.spyOn(scene, "generateNewObstacles").mockImplementation((): void => {
                order.push("generate")
            })
            jest.spyOn(scene, "updateObstacles").mockImplementation((): void => {
                order.push("obstacles")
            })
            jest.spyOn(scene, "moveCharacter").mockImplementation((): void => {
                order.push("move")
            })
            asMock(scene.background.wrap).mockImplementation((): void => {
                order.push("wrap")
            })
            asMock(scene.background.update).mockImplementation((): void => {
                order.push("bg")
            })
            asMock(scene.character.newPos).mockImplementation((): void => {
                order.push("newPos")
            })
            asMock(scene.character.update).mockImplementation((): void => {
                order.push("char")
            })
            scene.character.speedX = 4
            scene.character.speedY = -2
            scene.running = true
            asMock(scene.scoreHud.draw).mockImplementation((): void => {
                order.push("hud")
            })

            scene.update()

            expect(order).toEqual([
                "collision",
                "clear",
                "wrap",
                "bg",
                "generate",
                "obstacles",
                "newPos",
                "move",
                "char",
                "hud",
            ])
            expect(scene.frameNo).toBe(1)
            expect(scene.scoreSeconds).toBe(TICK_MS / 1000)
            expect(scene.character.speedX).toBe(0)
            expect(scene.character.speedY).toBe(0)
            expect(asMock(scene.background.update)).toHaveBeenCalledWith(scene.context)
            expect(asMock(scene.character.update)).toHaveBeenCalledWith(scene.context)
            expect(asMock(scene.scoreHud.draw)).toHaveBeenCalledWith(
                scene.context,
                scene.scoreSeconds,
                scene.topScores,
            )
        })
    })
})
