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

const ARROW_KEYS = new Set(Object.values(KEYS))

export class Scene {
    constructor() {
        this.canvas = document.createElement("canvas")
        this.canvas.width = CANVAS.width
        this.canvas.height = CANVAS.height
        this.context = this.canvas.getContext("2d")
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

    start() {
        document.body.insertBefore(this.canvas, document.body.childNodes[0])
        this.running = true
        this.lastTime = 0
        this.accumulator = 0
        this.rafId = requestAnimationFrame((time) => this.tick(time))

        window.addEventListener("keydown", (e) => {
            if (ARROW_KEYS.has(e.key))
                e.preventDefault()
            this.key[e.key] = true
            this.startMusic()
        })
        window.addEventListener("keyup", (e) => {
            this.key[e.key] = false
        })
        this.canvas.addEventListener("pointerdown", () => this.startMusic())
    }

    startMusic() {
        if (this.musicStarted)
            return
        this.musicStarted = true
        this.music.play()
    }

    tick(time) {
        if (!this.running)
            return

        this.rafId = requestAnimationFrame((nextTime) => this.tick(nextTime))

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

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    stop() {
        this.running = false
        if (this.rafId)
            cancelAnimationFrame(this.rafId)
    }

    everyInterval(n) {
        return !!((this.frameNo / n) % 1 === 0)
    }

    shouldAddObstacle(interval) {
        return this.frameNo === 1 || this.everyInterval(interval)
    }

    elapsedSeconds() {
        return (this.frameNo * TICK_MS) / 1000
    }

    stopOnCollision() {
        this.scoreSeconds = this.elapsedSeconds()
        this.topScores = saveScore(this.scoreSeconds)
        this.music.stop()
        this.collisionSound.play()
        this.stop()
    }

    handleObstacleCollision() {
        for (const obstacle of this.obstacles) {
            if (this.character.crashWith(obstacle)) {
                this.stopOnCollision()
                return
            }
        }
    }

    generateNewObstacles() {
        for (const spawn of OBSTACLE_SPAWNS) {
            if (!this.shouldAddObstacle(this.character.width * spawn.intervalFactor))
                continue

            const height = spawn.getHeight ? spawn.getHeight() : spawn.height
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

    updateObstacles() {
        for (const obstacle of this.obstacles)
            obstacle.x += obstacle.speedX

        this.obstacles = this.obstacles.filter(
            (obstacle) => obstacle.x + obstacle.width > 0,
        )

        for (const obstacle of this.obstacles)
            obstacle.update(this.context)
    }

    moveCharacter() {
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

    update() {
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
