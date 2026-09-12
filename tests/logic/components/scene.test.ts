import {
    CANVAS,
    ENTITY_TYPE,
    GAME_CONTROLS,
    GAME_KEYS,
    GAME_STATUS,
    ICONS,
    KEYS,
    OBSTACLES,
    DIAGONAL_COLORS,
    PLAYER_SPEED,
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
}

type WrapperMock = {
    className: string
    appendChild: jest.Mock
}

const Sound = jest.fn()
const SceneEntityMock = jest.fn()
const Background = jest.fn()
const ScoreHud = jest.fn()
const GameControls = jest.fn()
const getTopScores = jest.fn()
const saveScore = jest.fn()

jest.unstable_mockModule(
    "@src/logic/components/sound.js",
    (): { Sound: jest.Mock } => ({
        Sound,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/sceneEntity.js",
    (): { SceneEntity: jest.Mock } => ({
        SceneEntity: SceneEntityMock,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/background.js",
    (): { Background: jest.Mock } => ({
        Background,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/scoreHud.js",
    (): { ScoreHud: jest.Mock } => ({
        ScoreHud,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/gameControls.js",
    (): { GameControls: jest.Mock } => ({
        GameControls,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/records.js",
    (): {
        getTopScores: jest.Mock
        saveScore: jest.Mock
    } => ({
        getTopScores,
        saveScore,
    }),
)

const { Scene } = await import("@src/logic/components/scene.js")

function getListener(
    mockFn: jest.Mock,
    type: string,
): (event?: KeyEvent) => void {
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
    let wrapper: WrapperMock
    let controls: { sync: jest.Mock }

    beforeEach(() => {
        context = { clearRect: jest.fn() }
        canvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(() => context),
        }
        wrapper = {
            className: "",
            appendChild: jest.fn(),
        }
        controls = { sync: jest.fn() }

        Sound.mockImplementation(
            (): {
                play: jest.Mock
                playFromStart: jest.Mock
                stop: jest.Mock
            } => ({
                play: jest.fn(),
                playFromStart: jest.fn(),
                stop: jest.fn(),
            }),
        )
        SceneEntityMock.mockImplementation(
            (props: Partial<SceneEntityProps> = {}) => ({
                width: props.width,
                height: props.height,
                color: props.color,
                x: props.x,
                y: props.y,
                type: props.type,
                speedX: props.speedX ?? 0,
                speedY: 0,
                image: { src: props.color ?? "" },
                fillColor: null,
                crashWith: jest.fn(() => false),
                newPos: jest.fn(),
                update: jest.fn(),
                whenReady: jest.fn((): Promise<void> => Promise.resolve()),
            }),
        )
        Background.mockImplementation((): { update: jest.Mock } => ({
            update: jest.fn(),
        }))
        ScoreHud.mockImplementation((): { draw: jest.Mock } => ({
            draw: jest.fn(),
        }))
        GameControls.mockImplementation(() => controls)
        getTopScores.mockReset()
        saveScore.mockReset()
        getTopScores.mockReturnValue([12.5, 8, 3])
        saveScore.mockReturnValue([12.5, 8, 3])

        Sound.mockClear()
        SceneEntityMock.mockClear()
        Background.mockClear()
        ScoreHud.mockClear()
        GameControls.mockClear()
        controls.sync.mockClear()

        Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {
                createElement: jest.fn((tag: string) =>
                    tag === "canvas" ? canvas : wrapper,
                ),
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
        OBSTACLES.ENABLED = false
        Reflect.deleteProperty(globalThis, "document")
        Reflect.deleteProperty(globalThis, "window")
        Reflect.deleteProperty(globalThis, "requestAnimationFrame")
        Reflect.deleteProperty(globalThis, "cancelAnimationFrame")
    })

    describe("constructor", () => {
        it("creates the canvas, wrapper, sounds, character, and background", () => {
            const scene = new Scene()

            expect(document.createElement).toHaveBeenCalledWith("canvas")
            expect(document.createElement).toHaveBeenCalledWith("div")
            expect(scene.canvas.width).toBe(CANVAS.width)
            expect(scene.canvas.height).toBe(CANVAS.height)
            expect(wrapper.className).toBe(GAME_CONTROLS.WRAPPER_CLASS)
            expect(wrapper.appendChild).toHaveBeenCalledWith(canvas)
            expect(canvas.getContext).toHaveBeenCalledWith("2d")
            expect(Sound).toHaveBeenCalledWith(SOUNDS.FIRST_FIGHT)
            expect(Sound).toHaveBeenCalledWith(SOUNDS.LOVE_ME_AGAIN)
            expect(GameControls).toHaveBeenCalledTimes(1)
            expect(SceneEntityMock).toHaveBeenCalledWith({
                width: 50,
                height: 50,
                color: ICONS.IRON_MAN,
                x: 0,
                y: CANVAS.height / 2,
                type: ENTITY_TYPE.CHARACTER,
            })
            expect(Background).toHaveBeenCalledTimes(1)
            expect(ScoreHud).toHaveBeenCalledTimes(1)
            expect(getTopScores).toHaveBeenCalledTimes(1)
            expect(scene.topScores).toEqual([12.5, 8, 3])
            expect(scene.scoreSeconds).toBe(0)
            expect(scene.obstacles).toEqual([])
            expect(scene.status).toBe(GAME_STATUS.IDLE)
            expect(scene.musicStarted).toBe(false)
        })
    })

    describe("mount", () => {
        it("inserts the wrapper, syncs idle UI, and binds input", () => {
            const scene = new Scene()

            scene.mount()

            expect(document.body.insertBefore).toHaveBeenCalledWith(
                scene.wrapper,
                document.body.childNodes[0],
            )
            expect(scene.status).toBe(GAME_STATUS.IDLE)
            expect(requestAnimationFrame).not.toHaveBeenCalled()
            expect(asMock(scene.character.whenReady)).toHaveBeenCalledTimes(1)
            expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.IDLE)
            expect(window.addEventListener).toHaveBeenCalledWith(
                "keydown",
                expect.any(Function),
            )
            expect(window.addEventListener).toHaveBeenCalledWith(
                "keyup",
                expect.any(Function),
            )
        })

        it("does not store arrow keys or start music while idle", () => {
            const scene = new Scene()
            scene.mount()
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({ key: KEYS.LEFT, preventDefault })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(scene.key?.[KEYS.LEFT]).toBeUndefined()
            expect(asMock(scene.music.play)).not.toHaveBeenCalled()
        })

        it("starts the game on Enter while idle", () => {
            const scene = new Scene()
            scene.mount()
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({ key: GAME_KEYS.START, preventDefault })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(scene.status).toBe(GAME_STATUS.PLAYING)
            expect(asMock(scene.music.play)).toHaveBeenCalledTimes(1)
        })

        it("clears the key on keyup", () => {
            const scene = new Scene()
            scene.mount()

            if (scene.key) 
                scene.key[KEYS.RIGHT] = true

            const keyup = getListener(asMock(window.addEventListener), "keyup")

            keyup({ key: KEYS.RIGHT })

            expect(scene.key?.[KEYS.RIGHT]).toBe(false)
        })
    })

    describe("paintIdle", () => {
        it("draws after the character image is ready", async () => {
            const scene = new Scene()

            await scene.paintIdle()

            expect(asMock(scene.background.update)).toHaveBeenCalledWith(
                scene.context,
                0,
            )
            expect(asMock(scene.character.update)).toHaveBeenCalledWith(
                scene.context,
            )
            expect(asMock(scene.scoreHud.draw)).toHaveBeenCalled()
        })

        it("does not paint if the game started before images loaded", async () => {
            const scene = new Scene()
            let release!: () => void
            const gate = new Promise<void>((resolve): void => {
                release = resolve
            })
            asMock(scene.character.whenReady).mockReturnValue(gate)
            scene.play()
            release()

            await scene.paintIdle()

            expect(asMock(scene.background.update)).not.toHaveBeenCalled()
        })
    })

    describe("play", () => {
        it("starts the loop, music, and playing UI", () => {
            const scene = new Scene()

            scene.play()

            expect(scene.status).toBe(GAME_STATUS.PLAYING)
            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
            expect(asMock(scene.music.play)).toHaveBeenCalledTimes(1)
            expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.PLAYING)
        })

        it("stores arrow keys while playing", () => {
            const scene = new Scene()
            scene.mount()
            scene.play()
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({ key: KEYS.LEFT, preventDefault })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(scene.key?.[KEYS.LEFT]).toBe(true)
        })
    })

    describe("pause and resume", () => {
        it("freezes the loop without stopping music", () => {
            const scene = new Scene()
            scene.play()

            if (scene.key) 
                scene.key[KEYS.RIGHT] = true

            scene.rafId = 77

            scene.pause()

            expect(scene.status).toBe(GAME_STATUS.PAUSED)
            expect(scene.key).toEqual({})
            expect(cancelAnimationFrame).toHaveBeenCalledWith(77)
            expect(asMock(scene.music.stop)).not.toHaveBeenCalled()
            expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.PAUSED)
        })

        it("does nothing when pause is called while idle", () => {
            const scene = new Scene()

            scene.pause()

            expect(scene.status).toBe(GAME_STATUS.IDLE)
            expect(cancelAnimationFrame).not.toHaveBeenCalled()
        })

        it("resumes the loop without starting music again", () => {
            const scene = new Scene()
            scene.play()
            scene.pause()
            asMock(requestAnimationFrame).mockClear()

            scene.resume()

            expect(scene.status).toBe(GAME_STATUS.PLAYING)
            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
            expect(asMock(scene.music.play)).toHaveBeenCalledTimes(1)
            expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.PLAYING)
        })

        it("toggles pause with p and Escape", () => {
            const scene = new Scene()
            scene.mount()
            scene.play()
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({ key: GAME_KEYS.PAUSE, preventDefault })

            expect(scene.status).toBe(GAME_STATUS.PAUSED)

            keydown({ key: GAME_KEYS.PAUSE_ALT, preventDefault })

            expect(scene.status).toBe(GAME_STATUS.PLAYING)
        })
    })

    describe("restart", () => {
        it("resets the world and starts playing after a crash", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.CRASHED
            scene.frameNo = 40
            scene.scoreSeconds = 8
            scene.obstacles = [asEntity({})]
            scene.character.x = 90
            scene.character.y = 12
            scene.character.speedX = 4

            if (scene.key) 
                scene.key[KEYS.LEFT] = true

            scene.restart()

            expect(asMock(scene.collisionSound.stop)).toHaveBeenCalledTimes(1)
            expect(asMock(scene.music.playFromStart)).toHaveBeenCalledTimes(1)
            expect(scene.status).toBe(GAME_STATUS.PLAYING)
            expect(scene.frameNo).toBe(0)
            expect(scene.scoreSeconds).toBe(0)
            expect(scene.obstacles).toEqual([])
            expect(scene.character.x).toBe(0)
            expect(scene.character.y).toBe(CANVAS.height / 2)
            expect(scene.character.speedX).toBe(0)
            expect(scene.character.image.src).toBe(ICONS.IRON_MAN)
            expect(scene.key).toEqual({})
            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
            expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.PLAYING)
        })

        it("does not restart unless the scene has crashed", () => {
            const scene = new Scene()
            scene.play()
            asMock(requestAnimationFrame).mockClear()

            scene.restart()

            expect(scene.status).toBe(GAME_STATUS.PLAYING)
            expect(asMock(scene.music.playFromStart)).not.toHaveBeenCalled()
            expect(requestAnimationFrame).not.toHaveBeenCalled()
        })

        it("restarts on Enter after a crash", () => {
            const scene = new Scene()
            scene.mount()
            scene.status = GAME_STATUS.CRASHED
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({ key: GAME_KEYS.START, preventDefault })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(scene.status).toBe(GAME_STATUS.PLAYING)
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
        it("cancels the animation frame", () => {
            const scene = new Scene()
            scene.rafId = 77

            scene.stop()

            expect(cancelAnimationFrame).toHaveBeenCalledWith(77)
            expect(scene.rafId).toBeNull()
        })
    })

    describe("stopOnCollision", () => {
        it("saves the score, plays collision audio, and shows restart", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING
            scene.rafId = 77

            if (scene.key) 
                scene.key[KEYS.RIGHT] = true

            scene.stopOnCollision()

            expect(asMock(scene.music.stop)).toHaveBeenCalledTimes(1)
            expect(
                asMock(scene.collisionSound.playFromStart),
            ).toHaveBeenCalledTimes(1)
            expect(saveScore).toHaveBeenCalledWith(scene.scoreSeconds)
            expect(scene.status).toBe(GAME_STATUS.CRASHED)
            expect(scene.key).toEqual({})
            expect(cancelAnimationFrame).toHaveBeenCalledWith(77)
            expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.CRASHED)
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

            expect(asMock(scene.character.crashWith)).toHaveBeenCalledWith(
                obstacle,
            )
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

            expect(scene.obstacles).toHaveLength(OBSTACLES.SPAWNS.length)
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

    describe("updateObstaclesPosition", () => {
        it("moves obstacles and drops those off screen", () => {
            const scene = new Scene()
            const kept = { x: 10, speedX: -3, width: 5, update: jest.fn() }
            const dropped = { x: -10, speedX: -3, width: 5, update: jest.fn() }
            scene.obstacles = [asEntity(kept), asEntity(dropped)]

            scene.updateObstaclesPosition()

            expect(kept.x).toBe(7)
            expect(scene.obstacles).toEqual([kept])
            expect(kept.update).not.toHaveBeenCalled()
            expect(dropped.update).not.toHaveBeenCalled()
        })
    })

    describe("moveCharacter", () => {
        it("returns when key state is missing", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING
            scene.key = null

            scene.moveCharacter()

            expect(scene.character.speedX).toBe(0)
        })

        it("does not apply moves when the scene is not playing", () => {
            const scene = new Scene()

            if (scene.key) 
                scene.key[KEYS.RIGHT] = true

            scene.moveCharacter()

            expect(scene.character.speedX).toBe(0)
        })

        it("applies the matching player move while playing", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING

            if (scene.key) 
                scene.key[KEYS.RIGHT] = true

            scene.moveCharacter()

            expect(scene.character.image.src).toBe(ICONS.MOVE_RIGHT)
            expect(scene.character.fillColor).toBeNull()
            expect(scene.character.x).toBe(0)
            expect(scene.character.speedX).toBe(PLAYER_SPEED)
        })

        it("restores the default pose when no arrow keys are held", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING

            if (scene.key) 
                scene.key[KEYS.RIGHT] = true

            scene.moveCharacter()

            if (scene.key) 
                scene.key[KEYS.RIGHT] = false

            scene.moveCharacter()

            expect(scene.character.image.src).toBe(ICONS.IRON_MAN)
            expect(scene.character.fillColor).toBeNull()
            expect(scene.character.speedX).toBe(0)
        })

        it("uses a diagonal fill and normalized speed for combined arrows", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING
            const diagonalSpeed = PLAYER_SPEED / Math.SQRT2

            if (scene.key) {
                scene.key[KEYS.RIGHT] = true
                scene.key[KEYS.UP] = true
            }

            scene.moveCharacter()

            expect(scene.character.fillColor).toBe(DIAGONAL_COLORS.UP_RIGHT)
            expect(scene.character.speedX).toBeCloseTo(diagonalSpeed)
            expect(scene.character.speedY).toBeCloseTo(-diagonalSpeed)
        })

        it("uses the same diagonal whether left or up is pressed first", () => {
            const leftThenUp = new Scene()
            leftThenUp.status = GAME_STATUS.PLAYING

            if (leftThenUp.key) {
                leftThenUp.key[KEYS.LEFT] = true
                leftThenUp.key[KEYS.UP] = true
            }

            leftThenUp.moveCharacter()

            const upThenLeft = new Scene()
            upThenLeft.status = GAME_STATUS.PLAYING

            if (upThenLeft.key) {
                upThenLeft.key[KEYS.UP] = true
                upThenLeft.key[KEYS.LEFT] = true
            }

            upThenLeft.moveCharacter()

            expect(leftThenUp.character.fillColor).toBe(DIAGONAL_COLORS.UP_LEFT)
            expect(upThenLeft.character.fillColor).toBe(
                leftThenUp.character.fillColor,
            )
        })

        it("cancels opposite keys and keeps the previous pose", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING

            if (scene.key) 
                scene.key[KEYS.RIGHT] = true

            scene.moveCharacter()

            if (scene.key) 
                scene.key[KEYS.LEFT] = true

            scene.moveCharacter()

            expect(scene.character.speedX).toBe(0)
            expect(scene.character.image.src).toBe(ICONS.MOVE_RIGHT)
            expect(scene.character.fillColor).toBeNull()
        })
    })

    describe("tick", () => {
        it("returns without scheduling a frame when the scene is not playing", () => {
            const scene = new Scene()

            scene.tick(100)

            expect(requestAnimationFrame).not.toHaveBeenCalled()
        })

        it("sets lastTime on the first playing tick and does not update", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING
            const update = jest.spyOn(scene, "update")

            scene.tick(1000)

            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
            expect(scene.lastTime).toBe(1000)
            expect(update).not.toHaveBeenCalled()
        })

        it("calls update once per tick interval", () => {
            const scene = new Scene()
            scene.status = GAME_STATUS.PLAYING
            scene.lastTime = 1000
            const update = jest
                .spyOn(scene, "update")
                .mockImplementation((): void => {})

            scene.tick(1000 + TICK_MS)

            expect(update).toHaveBeenCalledTimes(1)
        })

        it("does not catch up ticks after a long pause", () => {
            const scene = new Scene()
            scene.play()
            scene.lastTime = 1000
            scene.pause()
            const update = jest
                .spyOn(scene, "update")
                .mockImplementation((): void => {})

            scene.resume()
            scene.tick(5000)

            expect(update).not.toHaveBeenCalled()
            expect(scene.lastTime).toBe(5000)
        })
    })

    describe("update", () => {
        it("runs collision, spawn, character, and draw steps in order", () => {
            jest.replaceProperty(OBSTACLES, "ENABLED", true)
            const scene = new Scene()
            const order: string[] = []
            jest.spyOn(scene, "handleObstacleCollision").mockImplementation(
                (): void => {
                    order.push("collision")
                },
            )
            jest.spyOn(scene, "clear").mockImplementation((): void => {
                order.push("clear")
            })
            jest.spyOn(scene, "generateNewObstacles").mockImplementation(
                (): void => {
                    order.push("generate")
                },
            )
            jest.spyOn(scene, "updateObstaclesPosition").mockImplementation(
                (): void => {
                    order.push("obstacles")
                },
            )
            jest.spyOn(scene, "moveCharacter").mockImplementation((): void => {
                order.push("move")
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
            scene.status = GAME_STATUS.PLAYING
            asMock(scene.scoreHud.draw).mockImplementation((): void => {
                order.push("hud")
            })

            scene.update()

            expect(order).toEqual([
                "collision",
                "generate",
                "obstacles",
                "newPos",
                "move",
                "clear",
                "bg",
                "char",
                "hud",
            ])
            expect(scene.frameNo).toBe(1)
            expect(scene.scoreSeconds).toBe(TICK_MS / 1000)
            expect(scene.character.speedX).toBe(0)
            expect(scene.character.speedY).toBe(0)
            expect(asMock(scene.background.update)).toHaveBeenCalledWith(
                scene.context,
                TICK_MS,
            )
            expect(asMock(scene.character.update)).toHaveBeenCalledWith(
                scene.context,
            )
            expect(asMock(scene.scoreHud.draw)).toHaveBeenCalledWith(
                scene.context,
                scene.scoreSeconds,
                scene.topScores,
            )
        })

        it("does not generate obstacles when they are disabled", () => {
            const scene = new Scene()
            const generateNewObstacles = jest
                .spyOn(scene, "generateNewObstacles")
                .mockImplementation((): void => {})

            scene.update()

            expect(generateNewObstacles).not.toHaveBeenCalled()
        })
    })
})
