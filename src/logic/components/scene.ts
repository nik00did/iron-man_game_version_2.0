import {
    OBSTACLE_SPAWNS,
    PLAYER_MOVES,
    CANVAS,
    TICK_MS,
    KEYS,
    ICONS,
    SOUNDS,
    ENTITY_TYPE,
} from "../../constants.js"
import { SceneEntity } from "./sceneEntity.js"
import { Background } from "./background.js"
import { Sound } from "./sound.js"
import { ScoreHud } from "./scoreHud.js"
import { getTopScores, saveScore } from "../records.js"

const ARROW_KEYS = new Set<string>(Object.values(KEYS))

export class Scene {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    key: Record<string, boolean> | null
    frameNo: number
    rafId: number | null
    running: boolean
    lastTime: number
    accumulator: number
    musicStarted: boolean
    obstacles: SceneEntity[]
    scoreHud: ScoreHud
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
        this.key = {}
        this.frameNo = 0
        this.rafId = null
        this.running = false
        this.lastTime = 0
        this.accumulator = 0
        this.musicStarted = false
        this.obstacles = []
        this.scoreHud = new ScoreHud()
        this.topScores = getTopScores()
        this.scoreSeconds = 0

        this.music = new Sound(SOUNDS.FIRST_FIGHT)
        this.collisionSound = new Sound(SOUNDS.LOVE_ME_AGAIN)

        this.character = new SceneEntity({
            width: 50,
            height: 50,
            color: ICONS.IRON_MAN,
            x: 0,
            y: CANVAS.height / 2,
            type: ENTITY_TYPE.CHARACTER,
        })
        this.background = new Background({
            width: CANVAS.width,
            height: CANVAS.height,
            color: ICONS.BACKGROUND,
            x: 0,
            y: 0,
            type: ENTITY_TYPE.BACKGROUND,
        })
    }

    start(): void {
        document.body.insertBefore(this.canvas, document.body.childNodes[0])
        this.running = true
        this.lastTime = 0
        this.accumulator = 0
        this.rafId = requestAnimationFrame((time: number): void => this.tick(time))

        window.addEventListener("keydown", (e: KeyboardEvent): void => {
            if (ARROW_KEYS.has(e.key))
                e.preventDefault()
            if (this.key)
                this.key[e.key] = true
            this.startMusic()
        })
        window.addEventListener("keyup", (e: KeyboardEvent): void => {
            if (this.key)
                this.key[e.key] = false
        })
        this.canvas.addEventListener("pointerdown", (): void => this.startMusic())
    }

    startMusic(): void {
        if (this.musicStarted)
            return
        this.musicStarted = true
        this.music.play()
    }

    tick(time: number): void {
        if (!this.running)
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

    stop(): void {
        this.running = false
        if (this.rafId)
            cancelAnimationFrame(this.rafId)
    }

    everyInterval(n: number): boolean {
        return !!((this.frameNo / n) % 1 === 0)
    }

    shouldAddObstacle(interval: number): boolean {
        return this.frameNo === 1 || this.everyInterval(interval)
    }

    elapsedSeconds(): number {
        return (this.frameNo * TICK_MS) / 1000
    }

    stopOnCollision(): void {
        this.scoreSeconds = this.elapsedSeconds()
        this.topScores = saveScore(this.scoreSeconds)
        this.music.stop()
        this.collisionSound.play()
        this.stop()
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
        for (const spawn of OBSTACLE_SPAWNS) {
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
        for (const obstacle of this.obstacles)
            obstacle.x += obstacle.speedX

        this.obstacles = this.obstacles.filter(
            (obstacle): boolean => obstacle.x + obstacle.width > 0,
        )

        for (const obstacle of this.obstacles)
            obstacle.update(this.context)
    }

    moveCharacter(): void {
        if (!this.key)
            return

        for (const move of PLAYER_MOVES) {
            if (!this.key[move.key])
                continue

            this.character.image.src = move.icon
            this.character[move.axis] = move.clamp(this.character, this.canvas)
            this.character[move.speedKey] += move.delta
        }
    }

    update(): void {
        this.handleObstacleCollision()

        this.clear()
        this.frameNo += 1
        if (this.running)
            this.scoreSeconds = this.elapsedSeconds()
        this.background.wrap()
        this.background.update(this.context)

        this.generateNewObstacles()
        this.updateObstacles()

        this.character.newPos()
        this.character.speedX = 0
        this.character.speedY = 0
        this.moveCharacter()

        this.character.update(this.context)
        this.scoreHud.draw(this.context, this.scoreSeconds, this.topScores)
    }
}
