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
    CHARACTER_START_X,
    PLAYER_IDLE_SPEED,
    PLAYER_SPEED,
    OBSTACLE_SPAWN,
    ENERGY_TOKEN,
    SOUNDS,
    TICK_MS,
} from "@src/constants.ts"
import type { Obstacle } from "@src/logic/components/obstacle.ts"
import type { ObstacleProps } from "@src/logic/components/obstacle.ts"
import type {
    CharacterAppearance,
    CharacterProps,
} from "@src/logic/components/character"
import type { EnergyToken } from "@src/logic/components/energyToken.ts"
import type { EnergyTokenProps } from "@src/logic/components/energyToken.ts"

type KeyEvent = {
    key: string
    code?: string
    repeat?: boolean
    preventDefault?: () => void
}

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
const CharacterMock = jest.fn()
const ObstacleMock = jest.fn()
const EnergyTokenMock = jest.fn()
const Background = jest.fn()
const ScoreHud = jest.fn()
const Shooting = jest.fn()
const GameControls = jest.fn()
const getTopScores = jest.fn()
const saveScore = jest.fn()

jest.unstable_mockModule(
    "@src/logic/components/sound.ts",
    (): { Sound: jest.Mock } => ({
        Sound,
    }),
)

const characterMotion = await import(
    "@src/logic/components/character/characterMotion.ts"
)

jest.unstable_mockModule(
    "@src/logic/components/character",
    (): {
        default: jest.Mock
        clampPlayerX: typeof characterMotion.clampPlayerX
        clampPlayerY: typeof characterMotion.clampPlayerY
        resolveCharacterMotion: typeof characterMotion.resolveCharacterMotion
    } => ({
        default: CharacterMock,
        clampPlayerX: characterMotion.clampPlayerX,
        clampPlayerY: characterMotion.clampPlayerY,
        resolveCharacterMotion: characterMotion.resolveCharacterMotion,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/obstacle.ts",
    (): { Obstacle: jest.Mock } => ({
        Obstacle: ObstacleMock,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/energyToken.ts",
    (): { EnergyToken: jest.Mock } => ({
        EnergyToken: EnergyTokenMock,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/background",
    (): { default: jest.Mock } => ({
        default: Background,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/scoreHud",
    (): {
        default: jest.Mock
        getTopScores: jest.Mock
        saveScore: jest.Mock
    } => ({
        default: ScoreHud,
        getTopScores,
        saveScore,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/shooting",
    (): { default: jest.Mock } => ({
        default: Shooting,
    }),
)
jest.unstable_mockModule(
    "@src/logic/components/gameControls.ts",
    (): { GameControls: jest.Mock } => ({
        GameControls,
    }),
)

const { Scene } = await import("@src/logic/components/scene.ts")

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

function asObstacle(value: unknown): Obstacle {
    return value as Obstacle
}

function asToken(value: unknown): EnergyToken {
    return value as EnergyToken
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
        CharacterMock.mockImplementation(
            (props: Partial<CharacterProps> = {}) => ({
                width: props.width,
                height: props.height,
                color: props.color,
                x: props.x,
                y: props.y,
                type: "character",
                speedX: 0,
                speedY: 0,
                image: { src: props.color ?? "" },
                fillColor: null,
                crashWith: jest.fn(() => false),
                newPos: jest.fn(),
                update: jest.fn(),
                whenReady: jest.fn((): Promise<void> => Promise.resolve()),
                applyAppearance: jest.fn(function applyAppearance(
                    this: {
                        fillColor: string | null
                        image: { src: string }
                    },
                    appearance: CharacterAppearance | null,
                ): void {
                    if (!appearance)
                        return

                    if (appearance.kind === "fill") {
                        this.fillColor = appearance.color

                        return
                    }

                    this.fillColor = null
                    this.image.src = appearance.src
                }),
            }),
        )
        ObstacleMock.mockImplementation(
            (props: Partial<ObstacleProps> = {}) => ({
                width: props.width,
                height: props.height,
                color: props.color,
                x: props.x,
                y: props.y,
                type: props.type,
                speedX: props.speedX ?? 0,
                image: { src: props.color ?? "" },
                update: jest.fn(),
                move: jest.fn(function move(this: {
                    x: number
                    speedX: number
                }): void {
                    this.x += this.speedX
                }),
                isOffScreen: jest.fn(function isOffScreen(this: {
                    x: number
                    width: number
                }): boolean {
                    return this.x + this.width <= 0
                }),
            }),
        )
        EnergyTokenMock.mockImplementation(
            (props: Partial<EnergyTokenProps> = {}) => ({
                x: props.x,
                y: props.y,
                width: ENERGY_TOKEN.SIZE,
                height: ENERGY_TOKEN.SIZE,
                speedX: props.speedX ?? ENERGY_TOKEN.SPEED,
                update: jest.fn(),
                move: jest.fn(function move(this: { x: number; speedX: number }): void {
                    this.x += this.speedX
                }),
                isOffScreen: jest.fn(function isOffScreen(this: {
                    x: number
                    width: number
                }): boolean {
                    return this.x + this.width <= 0
                }),
            }),
        )
        Background.mockImplementation((): { update: jest.Mock } => ({
            update: jest.fn(),
        }))
        ScoreHud.mockImplementation((): { draw: jest.Mock } => ({
            draw: jest.fn(),
        }))
        Shooting.mockImplementation(
            (): {
                blasts: unknown[]
                ammo: number
                addAmmo: jest.Mock
                fire: jest.Mock
                move: jest.Mock
                removeOffScreen: jest.Mock
                hitObstacles: jest.Mock
                draw: jest.Mock
                clear: jest.Mock
            } => ({
                blasts: [],
                ammo: 0,
                addAmmo: jest.fn((): boolean => true),
                fire: jest.fn(),
                move: jest.fn(),
                removeOffScreen: jest.fn(),
                hitObstacles: jest.fn(
                    (obstacles: unknown[]): unknown[] => obstacles,
                ),
                draw: jest.fn(),
                clear: jest.fn(),
            }),
        )
        GameControls.mockImplementation(() => controls)
        getTopScores.mockReset()
        saveScore.mockReset()
        getTopScores.mockReturnValue([12, 8, 3])
        saveScore.mockReturnValue([12, 8, 3])

        Sound.mockClear()
        CharacterMock.mockClear()
        ObstacleMock.mockClear()
        EnergyTokenMock.mockClear()
        Background.mockClear()
        ScoreHud.mockClear()
        Shooting.mockClear()
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
            expect(CharacterMock).toHaveBeenCalledWith({
                width: 50,
                height: 50,
                color: ICONS.IRON_MAN,
                x: CHARACTER_START_X,
                y: CANVAS.height / 2,
            })
            expect(Background).toHaveBeenCalledTimes(1)
            expect(ScoreHud).toHaveBeenCalledTimes(1)
            expect(Shooting).toHaveBeenCalledTimes(1)
            expect(getTopScores).toHaveBeenCalledTimes(1)
            expect(scene.topScores).toEqual([12, 8, 3])
            expect(scene.score).toBe(0)
            expect(scene.obstacles).toEqual([])
            expect(scene.tokens).toEqual([])
            expect(scene.tokensCollected).toBe(0)
            expect(scene.shooting.ammo).toBe(0)
            expect(scene.pendingEnergyToken).toBe(false)
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

    describe("shoot", () => {
        it("fires one blast from the character on Space while playing", () => {
            const scene = new Scene()
            scene.mount()
            scene.play()
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({
                key: GAME_KEYS.SHOOT,
                code: "Space",
                preventDefault,
            })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(asMock(scene.shooting.fire)).toHaveBeenCalledTimes(1)
            expect(asMock(scene.shooting.fire)).toHaveBeenCalledWith(
                scene.character,
            )
        })

        it("does not fire while idle", () => {
            const scene = new Scene()
            scene.mount()
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({ key: GAME_KEYS.SHOOT, preventDefault })

            expect(preventDefault).toHaveBeenCalledTimes(1)
            expect(asMock(scene.shooting.fire)).not.toHaveBeenCalled()
        })

        it("ignores key repeat so one tap is one blast", () => {
            const scene = new Scene()
            scene.mount()
            scene.play()
            const preventDefault = jest.fn()
            const keydown = getListener(
                asMock(window.addEventListener),
                "keydown",
            )

            keydown({ key: GAME_KEYS.SHOOT, preventDefault })
            keydown({ key: GAME_KEYS.SHOOT, repeat: true, preventDefault })

            expect(asMock(scene.shooting.fire)).toHaveBeenCalledTimes(1)
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
            scene.score = 8
            scene.obstacles = [asObstacle({})]
            scene.tokens = [asToken({})]
            scene.tokensCollected = 3
            scene.pendingEnergyToken = true
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
            expect(scene.score).toBe(0)
            expect(scene.obstacles).toEqual([])
            expect(scene.tokens).toEqual([])
            expect(scene.tokensCollected).toBe(0)
            expect(scene.pendingEnergyToken).toBe(false)
            expect(asMock(scene.shooting.clear)).toHaveBeenCalledTimes(1)
            expect(scene.character.x).toBe(CHARACTER_START_X)
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

    describe("currentScore", () => {
        it("floors elapsed seconds to integer points", () => {
            const scene = new Scene()
            scene.frameNo = 50

            expect(scene.elapsedSeconds()).toBe(1)
            expect(scene.currentScore()).toBe(1)
        })

        it("adds a point for each collected energy token", () => {
            const scene = new Scene()
            scene.frameNo = 50
            scene.tokensCollected = 3
            scene.shooting.ammo = 1

            expect(scene.currentScore()).toBe(1 + 3 * ENERGY_TOKEN.POINTS)
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
            expect(saveScore).toHaveBeenCalledWith(scene.score)
            expect(scene.status).toBe(GAME_STATUS.CRASHED)
            expect(scene.key).toEqual({})
            expect(cancelAnimationFrame).toHaveBeenCalledWith(77)
            expect(controls.sync).toHaveBeenCalledWith(GAME_STATUS.CRASHED)
        })

        it("saves floored time plus collected token points", () => {
            const scene = new Scene()
            scene.frameNo = 50
            scene.tokensCollected = 2

            scene.stopOnCollision()

            expect(scene.score).toBe(3)
            expect(saveScore).toHaveBeenCalledWith(3)
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
            scene.obstacles = [asObstacle(obstacle)]
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
            scene.obstacles = [asObstacle(first), asObstacle(second)]
            asMock(scene.character.crashWith)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
            const stopOnCollision = jest.spyOn(scene, "stopOnCollision")

            scene.handleObstacleCollision()

            expect(asMock(scene.character.crashWith)).toHaveBeenCalledTimes(2)
            expect(stopOnCollision).toHaveBeenCalledTimes(1)
        })
    })

    describe("updateShooting", () => {
        it("moves blasts, culls off-screen, then applies hits to obstacles", () => {
            const scene = new Scene()
            const kept = asObstacle({ type: ENTITY_TYPE.CLOUD })
            const removed = asObstacle({ type: ENTITY_TYPE.PLANE })
            scene.obstacles = [kept, removed]
            asMock(scene.shooting.hitObstacles).mockReturnValue([kept])

            scene.updateShooting()

            expect(asMock(scene.shooting.move)).toHaveBeenCalledTimes(1)
            expect(asMock(scene.shooting.removeOffScreen)).toHaveBeenCalledWith(
                scene.canvas,
            )
            expect(asMock(scene.shooting.hitObstacles)).toHaveBeenCalledWith([
                kept,
                removed,
            ])
            expect(scene.obstacles).toEqual([kept])
        })
    })

    describe("generateNewObstacles", () => {
        it("pushes an Obstacle for each spawn when shouldAddObstacle is true", () => {
            const random = jest.spyOn(Math, "random").mockReturnValue(0)
            const scene = new Scene()
            scene.frameNo = 1

            scene.generateNewObstacles()

            expect(scene.obstacles).toHaveLength(OBSTACLES.SPAWNS.length)
            expect(ObstacleMock).toHaveBeenCalledWith({
                width: 100,
                height: 60,
                color: ICONS.CLOUD,
                x: CANVAS.width,
                y: CANVAS.height - OBSTACLE_SPAWN.CLOUD_Y_FROM_BOTTOM.min,
                type: ENTITY_TYPE.CLOUD,
                speedX: -3,
            })
            expect(ObstacleMock).toHaveBeenCalledWith({
                width: 80,
                height: 30,
                color: ICONS.PLANE,
                x: CANVAS.width,
                y: CANVAS.height - OBSTACLE_SPAWN.PLANE_Y_FROM_BOTTOM.min,
                type: ENTITY_TYPE.PLANE,
                speedX: OBSTACLE_SPAWN.PLANE_SPEED.min,
            })
            const buildingProps = ObstacleMock.mock.calls[
                ObstacleMock.mock.calls.length - 1
            ][0] as ObstacleProps
            expect(buildingProps).toMatchObject({
                width: 60,
                height: OBSTACLE_SPAWN.BUILDING_HEIGHT.min,
                color: ICONS.BUILDING,
                x: CANVAS.width,
                type: ENTITY_TYPE.BUILDING,
                speedX: -2,
            })
            expect(buildingProps.y).toBe(CANVAS.height - buildingProps.height)
            random.mockRestore()
        })

        it("does not push obstacles when shouldAddObstacle is false", () => {
            const scene = new Scene()
            jest.spyOn(scene, "shouldAddObstacle").mockReturnValue(false)

            scene.generateNewObstacles()

            expect(scene.obstacles).toEqual([])
        })

        it("does not spawn a token when only one building exists", () => {
            const random = jest.spyOn(Math, "random").mockReturnValue(0)
            const scene = new Scene()
            scene.frameNo = 1

            scene.generateNewObstacles()

            expect(scene.tokens).toEqual([])
            expect(scene.pendingEnergyToken).toBe(false)
            random.mockRestore()
        })

        it("queues a token when a second building appears", () => {
            const random = jest.spyOn(Math, "random").mockReturnValue(0)
            const scene = new Scene()
            scene.obstacles = [
                asObstacle({ x: 800, width: 60, type: ENTITY_TYPE.BUILDING }),
                asObstacle({
                    x: CANVAS.width,
                    width: 60,
                    type: ENTITY_TYPE.BUILDING,
                }),
            ]

            scene.queueEnergyToken()

            expect(scene.pendingEnergyToken).toBe(true)
            expect(scene.tokens).toEqual([])
            random.mockRestore()
        })

        it("does not spawn while a building occupies the right-edge lane", () => {
            const scene = new Scene()
            scene.pendingEnergyToken = true
            scene.obstacles = [
                asObstacle({ x: 700, width: 60, type: ENTITY_TYPE.BUILDING }),
                asObstacle({
                    x: CANVAS.width - 60,
                    width: 60,
                    type: ENTITY_TYPE.BUILDING,
                }),
            ]

            scene.maybeSpawnEnergyToken()

            expect(scene.tokens).toEqual([])
            expect(scene.pendingEnergyToken).toBe(true)
        })

        it("spawns an energy token from the right edge once the street is clear", () => {
            const random = jest.spyOn(Math, "random").mockReturnValue(0)
            const scene = new Scene()
            scene.pendingEnergyToken = true
            scene.obstacles = [
                asObstacle({ x: 700, width: 60, type: ENTITY_TYPE.BUILDING }),
                asObstacle({
                    x: CANVAS.width - ENERGY_TOKEN.SIZE - 60,
                    width: 60,
                    type: ENTITY_TYPE.BUILDING,
                }),
            ]

            scene.maybeSpawnEnergyToken()

            expect(scene.tokens).toHaveLength(1)
            expect(scene.pendingEnergyToken).toBe(false)
            expect(EnergyTokenMock).toHaveBeenCalledWith({
                x: CANVAS.width,
                y: ENERGY_TOKEN.Y_MIN,
            })
            random.mockRestore()
        })

        it("does not queue a token when the gap chance fails", () => {
            const random = jest.spyOn(Math, "random").mockReturnValue(0.99)
            const scene = new Scene()
            scene.obstacles = [
                asObstacle({ x: 800, width: 60, type: ENTITY_TYPE.BUILDING }),
                asObstacle({
                    x: CANVAS.width,
                    width: 60,
                    type: ENTITY_TYPE.BUILDING,
                }),
            ]

            scene.queueEnergyToken()

            expect(scene.pendingEnergyToken).toBe(false)
            expect(scene.tokens).toEqual([])
            random.mockRestore()
        })

        it("does not queue more tokens than the on-screen cap", () => {
            const random = jest.spyOn(Math, "random").mockReturnValue(0)
            const scene = new Scene()
            scene.tokens = [
                asToken({}),
                asToken({}),
            ]
            scene.obstacles = [
                asObstacle({ x: 800, width: 60, type: ENTITY_TYPE.BUILDING }),
                asObstacle({
                    x: CANVAS.width,
                    width: 60,
                    type: ENTITY_TYPE.BUILDING,
                }),
            ]

            scene.queueEnergyToken()

            expect(scene.pendingEnergyToken).toBe(false)
            expect(scene.tokens).toHaveLength(ENERGY_TOKEN.MAX_ON_SCREEN)
            random.mockRestore()
        })
    })

    describe("updateObstaclesPosition", () => {
        it("moves obstacles and drops those off screen", () => {
            const scene = new Scene()
            const kept = {
                x: 10,
                speedX: -3,
                width: 5,
                move(): void {
                    this.x += this.speedX
                },
                isOffScreen(): boolean {
                    return this.x + this.width <= 0
                },
            }
            const dropped = {
                x: -10,
                speedX: -3,
                width: 5,
                move(): void {
                    this.x += this.speedX
                },
                isOffScreen(): boolean {
                    return this.x + this.width <= 0
                },
            }
            scene.obstacles = [asObstacle(kept), asObstacle(dropped)]

            scene.updateObstaclesPosition()

            expect(kept.x).toBe(7)
            expect(scene.obstacles).toEqual([kept])
        })
    })

    describe("handleTokenCollection", () => {
        it("removes a touched token, increments the collected count, and stores ammo", () => {
            const scene = new Scene()
            const token = asToken({})
            scene.tokens = [token]
            asMock(scene.character.crashWith).mockReturnValue(true)

            scene.handleTokenCollection()

            expect(scene.tokens).toEqual([])
            expect(scene.tokensCollected).toBe(1)
            expect(asMock(scene.shooting.addAmmo)).toHaveBeenCalledTimes(1)
        })

        it("still collects a token for score when ammo is full", () => {
            const scene = new Scene()
            const token = asToken({})
            scene.tokens = [token]
            asMock(scene.character.crashWith).mockReturnValue(true)
            asMock(scene.shooting.addAmmo).mockReturnValue(false)

            scene.handleTokenCollection()

            expect(scene.tokens).toEqual([])
            expect(scene.tokensCollected).toBe(1)
            expect(asMock(scene.shooting.addAmmo)).toHaveBeenCalledTimes(1)
        })

        it("keeps tokens that the character has not touched", () => {
            const scene = new Scene()
            const token = asToken({})
            scene.tokens = [token]
            asMock(scene.character.crashWith).mockReturnValue(false)

            scene.handleTokenCollection()

            expect(scene.tokens).toEqual([token])
            expect(scene.tokensCollected).toBe(0)
        })
    })

    describe("updateTokensPosition", () => {
        it("moves tokens and drops those off screen", () => {
            const scene = new Scene()
            const kept = {
                x: 10,
                speedX: -2,
                width: 50,
                move(): void {
                    this.x += this.speedX
                },
                isOffScreen(): boolean {
                    return this.x + this.width <= 0
                },
            }
            const dropped = {
                x: -60,
                speedX: -2,
                width: 50,
                move(): void {
                    this.x += this.speedX
                },
                isOffScreen(): boolean {
                    return this.x + this.width <= 0
                },
            }
            scene.tokens = [asToken(kept), asToken(dropped)]

            scene.updateTokensPosition()

            expect(kept.x).toBe(8)
            expect(scene.tokens).toEqual([kept])
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
            expect(scene.character.x).toBe(CHARACTER_START_X)
            expect(scene.character.speedX).toBe(PLAYER_IDLE_SPEED + PLAYER_SPEED)
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
            expect(scene.character.speedX).toBe(PLAYER_IDLE_SPEED)
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
            expect(scene.character.speedX).toBeCloseTo(
                PLAYER_IDLE_SPEED + diagonalSpeed,
            )
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

            expect(scene.character.speedX).toBe(PLAYER_IDLE_SPEED)
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
            jest.spyOn(scene, "updateShooting").mockImplementation((): void => {
                order.push("shooting")
            })
            jest.spyOn(scene, "handleObstacleCollision").mockImplementation(
                (): void => {
                    order.push("collision")
                },
            )
            jest.spyOn(scene, "handleTokenCollection").mockImplementation(
                (): void => {
                    order.push("collect")
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
            jest.spyOn(scene, "maybeSpawnEnergyToken").mockImplementation(
                (): void => {
                    order.push("spawnToken")
                },
            )
            jest.spyOn(scene, "updateTokensPosition").mockImplementation(
                (): void => {
                    order.push("tokens")
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
            asMock(scene.shooting.draw).mockImplementation((): void => {
                order.push("blasts")
            })
            scene.character.speedX = 4
            scene.character.speedY = -2
            scene.status = GAME_STATUS.PLAYING
            asMock(scene.scoreHud.draw).mockImplementation((): void => {
                order.push("hud")
            })

            scene.update()

            expect(order).toEqual([
                "shooting",
                "collision",
                "collect",
                "generate",
                "obstacles",
                "spawnToken",
                "tokens",
                "newPos",
                "move",
                "clear",
                "bg",
                "char",
                "blasts",
                "hud",
            ])
            expect(scene.frameNo).toBe(1)
            expect(scene.score).toBe(0)
            expect(scene.character.speedX).toBe(0)
            expect(scene.character.speedY).toBe(0)
            expect(asMock(scene.background.update)).toHaveBeenCalledWith(
                scene.context,
                TICK_MS,
            )
            expect(asMock(scene.character.update)).toHaveBeenCalledWith(
                scene.context,
            )
            expect(asMock(scene.shooting.draw)).toHaveBeenCalledWith(
                scene.context,
            )
            expect(asMock(scene.scoreHud.draw)).toHaveBeenCalledWith(
                scene.context,
                scene.score,
                scene.topScores,
                scene.shooting.ammo,
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
