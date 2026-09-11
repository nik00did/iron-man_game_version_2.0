import {
    OBSTACLES,
    PLAYER_MOVES,
    CANVAS,
    TICK_MS,
    KEYS,
    ICONS,
    SOUNDS,
    ENTITY_TYPE,
    GAME_STATUS,
    GAME_KEYS,
    GAME_CONTROLS,
} from "../../constants.js"
import type { GameStatus } from "../../constants.js"
import { SceneEntity } from "./sceneEntity.js"
import { Background } from "./background.js"
import { Sound } from "./sound.js"
import { ScoreHud } from "./scoreHud.js"
import { GameControls } from "./gameControls.js"
import { getTopScores, saveScore } from "../records.js"

const ARROW_KEYS = new Set<string>(Object.values(KEYS))
const CHARACTER_SIZE = 50

export class Scene {
    canvas: HTMLCanvasElement
    wrapper: HTMLDivElement
    context: CanvasRenderingContext2D
    key: Record<string, boolean> | null
    frameNo: number
    rafId: number | null
    status: GameStatus
    lastTime: number
    accumulator: number
    musicStarted: boolean
    inputBound: boolean
    obstacles: SceneEntity[]
    scoreHud: ScoreHud
    controls: GameControls
    topScores: number[]
    scoreSeconds: number
    music: Sound
    collisionSound: Sound
    character: SceneEntity
    background: Background

    constructor() {
        this.canvas = document.createElement("canvas")
        this.canvas.width = CANVAS.width
        this.canvas.height = CANVAS.height
        const context = this.canvas.getContext("2d")

        if (!context)
            throw new Error("2d canvas context is not available")

        this.context = context
        this.wrapper = document.createElement("div")
        this.wrapper.className = GAME_CONTROLS.WRAPPER_CLASS
        this.wrapper.appendChild(this.canvas)
        this.key = {}
        this.frameNo = 0
        this.rafId = null
        this.status = GAME_STATUS.IDLE
        this.lastTime = 0
        this.accumulator = 0
        this.musicStarted = false
        this.inputBound = false
        this.obstacles = []
        this.scoreHud = new ScoreHud()
        this.topScores = getTopScores()
        this.scoreSeconds = 0

        this.music = new Sound(SOUNDS.FIRST_FIGHT)
        this.collisionSound = new Sound(SOUNDS.LOVE_ME_AGAIN)
        this.controls = new GameControls(this.wrapper, {
            onStart: (): void => this.play(),
            onPause: (): void => this.pause(),
            onResume: (): void => this.resume(),
            onRestart: (): void => this.restart(),
        })

        this.character = new SceneEntity({
            width: CHARACTER_SIZE,
            height: CHARACTER_SIZE,
            color: ICONS.IRON_MAN,
            x: 0,
            y: CANVAS.height / 2,
            type: ENTITY_TYPE.CHARACTER,
        })
        this.background = new Background()
    }

    mount(): void {
        document.body.insertBefore(this.wrapper, document.body.childNodes[0])
        this.bindInput()
        this.controls.sync(this.status)

        this.paintIdle()
    }

    async paintIdle(): Promise<void> {
        await this.character.whenReady()

        if (this.status === GAME_STATUS.IDLE)
            this.draw()
    }

    bindInput(): void {
        if (this.inputBound)
            return

        this.inputBound = true

        window.addEventListener("keydown", (e: KeyboardEvent): void => {
            this.handleKeyDown(e)
        })
        window.addEventListener("keyup", (e: KeyboardEvent): void => {
            if (this.key)
                this.key[e.key] = false
        })
    }

    handleKeyDown(e: KeyboardEvent): void {
        if (ARROW_KEYS.has(e.key)) {
            e.preventDefault()

            if (this.status === GAME_STATUS.PLAYING && this.key)
                this.key[e.key] = true

            return
        }

        if (e.key === GAME_KEYS.START) {
            if (this.status === GAME_STATUS.IDLE) {
                e.preventDefault()
                this.play()
            } else if (this.status === GAME_STATUS.CRASHED) {
                e.preventDefault()
                this.restart()
            }

            return
        }

        if (this.isPauseKey(e.key)) {
            if (this.status === GAME_STATUS.PLAYING) {
                e.preventDefault()
                this.pause()
            } else if (this.status === GAME_STATUS.PAUSED) {
                e.preventDefault()
                this.resume()
            }
        }
    }

    isPauseKey(key: string): boolean {
        return (
            key === GAME_KEYS.PAUSE ||
            key === GAME_KEYS.PAUSE.toUpperCase() ||
            key === GAME_KEYS.PAUSE_ALT
        )
    }

    play(): void {
        if (
            this.status !== GAME_STATUS.IDLE &&
            this.status !== GAME_STATUS.PAUSED
        )
            return

        this.status = GAME_STATUS.PLAYING
        this.startMusic()
        this.controls.sync(this.status)
        this.beginLoop()
    }

    pause(): void {
        if (this.status !== GAME_STATUS.PLAYING)
            return

        this.status = GAME_STATUS.PAUSED
        this.clearKeys()
        this.stopLoop()
        this.controls.sync(this.status)
    }

    resume(): void {
        if (this.status !== GAME_STATUS.PAUSED)
            return

        this.play()
    }

    restart(): void {
        if (this.status !== GAME_STATUS.CRASHED)
            return

        this.collisionSound.stop()
        this.resetWorld()
        this.status = GAME_STATUS.PLAYING
        this.musicStarted = true
        this.music.playFromStart()
        this.controls.sync(this.status)
        this.beginLoop()
    }

    startMusic(): void {
        if (this.musicStarted)
            return

        this.musicStarted = true
        this.music.play()
    }

    beginLoop(): void {
        this.lastTime = 0
        this.accumulator = 0
        this.stopLoop()
        this.rafId = requestAnimationFrame((time: number): void => this.tick(time))
    }

    tick(time: number): void {
        if (this.status !== GAME_STATUS.PLAYING)
            return

        this.rafId = requestAnimationFrame((nextTime: number): void => this.tick(nextTime))

        if (!this.lastTime) {
            this.lastTime = time

            return
        }

        const dt = Math.min(time - this.lastTime, 100)
        this.lastTime = time
        this.accumulator += dt

        while (this.accumulator >= TICK_MS) {
            this.update()
            this.accumulator -= TICK_MS
        }
    }

    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    stopLoop(): void {
        if (this.rafId)
            cancelAnimationFrame(this.rafId)

        this.rafId = null
    }

    stop(): void {
        this.stopLoop()
    }

    clearKeys(): void {
        this.key = {}
    }

    resetWorld(): void {
        this.frameNo = 0
        this.scoreSeconds = 0
        this.obstacles = []
        this.key = {}
        this.character.x = 0
        this.character.y = CANVAS.height / 2
        this.character.speedX = 0
        this.character.speedY = 0
        this.character.image.src = ICONS.IRON_MAN
        this.topScores = getTopScores()
    }

    everyInterval(n: number): boolean {
        return !!((this.frameNo / n) % 1 === 0)
    }

    shouldAddObstacle(interval: number): boolean {
        return this.frameNo === 1 || this.everyInterval(interval)
    }

    elapsedMs(): number {
        return this.frameNo * TICK_MS
    }

    elapsedSeconds(): number {
        return this.elapsedMs() / 1000
    }

    stopOnCollision(): void {
        this.scoreSeconds = this.elapsedSeconds()
        this.topScores = saveScore(this.scoreSeconds)
        this.music.stop()
        this.collisionSound.playFromStart()
        this.clearKeys()
        this.status = GAME_STATUS.CRASHED
        this.stopLoop()
        this.controls.sync(this.status)
    }

    handleObstacleCollision(): void {
        for (const obstacle of this.obstacles) {
            if (this.character.crashWith(obstacle)) {
                this.stopOnCollision()

                return
            }
        }
    }

    generateNewObstacles(): void {
        for (const spawn of OBSTACLES.SPAWNS) {
            if (!this.shouldAddObstacle(this.character.width * spawn.intervalFactor))
                continue

            const height =
                "getHeight" in spawn ? spawn.getHeight() : spawn.height
            const y = spawn.getY(this.canvas, height)

            this.obstacles.push(
                new SceneEntity({
                    width: spawn.width,
                    height,
                    color: spawn.color,
                    x: this.canvas.width,
                    y,
                    type: spawn.type,
                    speedX: spawn.speedX,
                }),
            )
        }
    }

    updateObstacles(): void {
        if (this.obstacles.length === 0)
            return

        for (const obstacle of this.obstacles)
            obstacle.x += obstacle.speedX

        this.obstacles = this.obstacles.filter(
            (obstacle): boolean => obstacle.x + obstacle.width > 0,
        )
    }

    moveCharacter(): void {
        if (this.status !== GAME_STATUS.PLAYING || !this.key)
            return

        for (const move of PLAYER_MOVES) {
            if (!this.key[move.key])
                continue

            this.character.image.src = move.icon
            this.character[move.axis] = move.clamp(this.character, this.canvas)
            this.character[move.speedKey] += move.delta
        }
    }

    draw(): void {
        this.clear()
        this.background.update(this.context, this.elapsedMs())

        for (const obstacle of this.obstacles)
            obstacle.update(this.context)

        this.character.update(this.context)
        this.scoreHud.draw(this.context, this.scoreSeconds, this.topScores)
    }

    update(): void {
        this.handleObstacleCollision()

        this.frameNo += 1

        if (this.status === GAME_STATUS.PLAYING)
            this.scoreSeconds = this.elapsedSeconds()

        if (OBSTACLES.ENABLED) {
            this.generateNewObstacles()
            this.updateObstacles()
        }

        this.character.newPos()
        this.character.speedX = 0
        this.character.speedY = 0
        this.moveCharacter()

        this.draw()
    }
}
