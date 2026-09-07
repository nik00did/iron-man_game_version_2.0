import {
    CANVAS,
    ENTITY_TYPE,
    ICONS,
    KEYS,
    OBSTACLE_SPAWNS,
    SOUNDS,
    TICK_MS,
} from "@src/constants.js"

const Sound = jest.fn()
const SceneEntity = jest.fn()
const Background = jest.fn()
const ScoreHud = jest.fn()
const getTopScores = jest.fn()
const saveScore = jest.fn()

jest.unstable_mockModule("@src/logic/components/sound.js", () => ({
    Sound,
}))
jest.unstable_mockModule("@src/logic/components/sceneEntity.js", () => ({
    SceneEntity,
}))
jest.unstable_mockModule("@src/logic/components/background.js", () => ({
    Background,
}))
jest.unstable_mockModule("@src/logic/components/scoreHud.js", () => ({
    ScoreHud,
}))
jest.unstable_mockModule("@src/logic/records.js", () => ({
    getTopScores,
    saveScore,
}))

const { Scene } = await import("@src/logic/components/scene.js")

function getListener(mockFn, type) {
    return mockFn.mock.calls.find(([name]) => name === type)[1]
}

describe("Scene", () => {
    let context
    let canvas

    beforeEach(() => {
        context = { clearRect: jest.fn() }
        canvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(() => context),
            addEventListener: jest.fn(),
        }

        Sound.mockImplementation(() => ({
            play: jest.fn(),
            stop: jest.fn(),
        }))
        SceneEntity.mockImplementation((props = {}) => ({
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
        Background.mockImplementation(() => ({
            wrap: jest.fn(),
            update: jest.fn(),
        }))
        ScoreHud.mockImplementation(() => ({
            draw: jest.fn(),
        }))
        getTopScores.mockReset()
        saveScore.mockReset()
        getTopScores.mockReturnValue([12.5, 8, 3])
        saveScore.mockReturnValue([12.5, 8, 3])

        Sound.mockClear()
        SceneEntity.mockClear()
        Background.mockClear()
        ScoreHud.mockClear()

        globalThis.document = {
            createElement: jest.fn(() => canvas),
            body: {
                insertBefore: jest.fn(),
                childNodes: [null],
            },
        }
        globalThis.window = {
            addEventListener: jest.fn(),
        }
        globalThis.requestAnimationFrame = jest.fn(() => 77)
        globalThis.cancelAnimationFrame = jest.fn()
    })

    afterEach(() => {
        delete globalThis.document
        delete globalThis.window
        delete globalThis.requestAnimationFrame
        delete globalThis.cancelAnimationFrame
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
            expect(SceneEntity).toHaveBeenCalledWith({
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
            const keydown = getListener(window.addEventListener, "keydown")

            keydown({ key: KEYS.LEFT, preventDefault })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(scene.key[KEYS.LEFT]).toBe(true)
            expect(scene.music.play).toHaveBeenCalledTimes(1)
        })

        it("does not prevent default for non-arrow keys", () => {
            const scene = new Scene()
            scene.start()
            const preventDefault = jest.fn()
            const keydown = getListener(window.addEventListener, "keydown")

            keydown({ key: "a", preventDefault })

            expect(preventDefault).not.toHaveBeenCalled()
            expect(scene.key.a).toBe(true)
        })

        it("clears the key on keyup", () => {
            const scene = new Scene()
            scene.start()
            scene.key[KEYS.RIGHT] = true
            const keyup = getListener(window.addEventListener, "keyup")

            keyup({ key: KEYS.RIGHT })

            expect(scene.key[KEYS.RIGHT]).toBe(false)
        })

        it("starts music on canvas pointerdown", () => {
            const scene = new Scene()
            scene.start()
            const pointerdown = getListener(canvas.addEventListener, "pointerdown")

            pointerdown()

            expect(scene.music.play).toHaveBeenCalledTimes(1)
        })
    })

    describe("startMusic", () => {
        it("plays music once", () => {
            const scene = new Scene()

            scene.startMusic()
            scene.startMusic()

            expect(scene.musicStarted).toBe(true)
            expect(scene.music.play).toHaveBeenCalledTimes(1)
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

            expect(scene.music.stop).toHaveBeenCalledTimes(1)
            expect(scene.collisionSound.play).toHaveBeenCalledTimes(1)
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
            scene.obstacles = [obstacle]
            const stopOnCollision = jest.spyOn(scene, "stopOnCollision")

            scene.handleObstacleCollision()

            expect(scene.character.crashWith).toHaveBeenCalledWith(obstacle)
            expect(stopOnCollision).not.toHaveBeenCalled()
        })

        it("stops on the first crashing obstacle", () => {
            const scene = new Scene()
            const first = {}
            const second = {}
            scene.obstacles = [first, second]
            scene.character.crashWith
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
            const stopOnCollision = jest.spyOn(scene, "stopOnCollision")

            scene.handleObstacleCollision()

            expect(scene.character.crashWith).toHaveBeenCalledTimes(2)
            expect(stopOnCollision).toHaveBeenCalledTimes(1)
        })
    })

    describe("generateNewObstacles", () => {
        it("pushes a SceneEntity for each spawn when shouldAddObstacle is true", () => {
            const scene = new Scene()
            scene.frameNo = 1

            scene.generateNewObstacles()

            expect(scene.obstacles).toHaveLength(OBSTACLE_SPAWNS.length)
            expect(SceneEntity).toHaveBeenCalledWith({
                width: 100,
                height: 60,
                color: ICONS.CLOUD,
                x: CANVAS.width,
                y: CANVAS.height - 320,
                type: ENTITY_TYPE.CLOUD,
                speedX: -3,
            })
            const buildingProps =
                SceneEntity.mock.calls[SceneEntity.mock.calls.length - 1][0]
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
            scene.obstacles = [kept, dropped]

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
            const update = jest.spyOn(scene, "update").mockImplementation(() => {})

            scene.tick(1000 + TICK_MS)

            expect(update).toHaveBeenCalledTimes(1)
        })
    })

    describe("update", () => {
        it("runs collision, draw, spawn, and character steps in order", () => {
            const scene = new Scene()
            const order = []
            jest.spyOn(scene, "handleObstacleCollision").mockImplementation(() =>
                order.push("collision"),
            )
            jest.spyOn(scene, "clear").mockImplementation(() => order.push("clear"))
            jest.spyOn(scene, "generateNewObstacles").mockImplementation(() =>
                order.push("generate"),
            )
            jest.spyOn(scene, "updateObstacles").mockImplementation(() =>
                order.push("obstacles"),
            )
            jest.spyOn(scene, "moveCharacter").mockImplementation(() =>
                order.push("move"),
            )
            scene.background.wrap.mockImplementation(() => order.push("wrap"))
            scene.background.update.mockImplementation(() => order.push("bg"))
            scene.character.newPos.mockImplementation(() => order.push("newPos"))
            scene.character.update.mockImplementation(() => order.push("char"))
            scene.character.speedX = 4
            scene.character.speedY = -2
            scene.running = true
            scene.scoreHud.draw.mockImplementation(() => order.push("hud"))

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
            expect(scene.background.update).toHaveBeenCalledWith(scene.context)
            expect(scene.character.update).toHaveBeenCalledWith(scene.context)
            expect(scene.scoreHud.draw).toHaveBeenCalledWith(
                scene.context,
                scene.scoreSeconds,
                scene.topScores,
            )
        })
    })
})
