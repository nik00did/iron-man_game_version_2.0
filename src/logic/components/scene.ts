import {
    OBSTACLES,
    OBSTACLE_SPAWN,
    CANVAS,
    CHARACTER_START_X,
    TICK_MS,
    KEYS,
    ICONS,
    SOUNDS,
    ENTITY_TYPE,
    ENERGY_TOKEN,
    GAME_STATUS,
    GAME_KEYS,
    GAME_CONTROLS,
    SKY,
} from "../../constants.ts"
import type { GameStatus, ObstacleSpawn } from "../../constants.ts"
import type { Box } from "./sceneEntity.ts"
import Character, {
    clampPlayerX,
    clampPlayerY,
    resolveCharacterMotion,
} from "./character"
import { Obstacle } from "./obstacle.ts"
import { EnergyToken } from "./energyToken.ts"
import Background, { timePeriodIndex } from "./background"
import { Sound } from "./sound.ts"
import ScoreHud, { getTopScores, saveScore } from "./scoreHud"
import { GameControls } from "./gameControls.ts"
import Shooting from "./shooting"
import { randomInt } from "../../utils.ts"

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
    obstacles: Obstacle[]
    tokens: EnergyToken[]
    tokensCollected: number
    pendingEnergyToken: boolean
    scoreHud: ScoreHud
    controls: GameControls
    topScores: number[]
    score: number
    music: Sound
    collisionSound: Sound
    character: Character
    background: Background
    shooting: Shooting

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
        this.tokens = []
        this.tokensCollected = 0
        this.pendingEnergyToken = false
        this.scoreHud = new ScoreHud()
        this.topScores = getTopScores()
        this.score = 0

        this.music = new Sound(SOUNDS.FIRST_FIGHT)
        this.collisionSound = new Sound(SOUNDS.LOVE_ME_AGAIN)
        this.controls = new GameControls(this.wrapper, {
            onStart: (): void => this.play(),
            onPause: (): void => this.pause(),
            onResume: (): void => this.resume(),
            onRestart: (): void => this.restart(),
        })

        this.character = new Character({
            width: CHARACTER_SIZE,
            height: CHARACTER_SIZE,
            color: ICONS.IRON_MAN,
            x: CHARACTER_START_X,
            y: CANVAS.height / 2,
        })
        this.background = new Background()
        this.shooting = new Shooting()
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

        if (this.isShootKey(e)) {
            e.preventDefault()

            if (this.status === GAME_STATUS.PLAYING && !e.repeat)
                this.shooting.fire(this.character)

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

    isShootKey(e: KeyboardEvent): boolean {
        return e.code === "Space" || e.key === GAME_KEYS.SHOOT
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
        this.rafId = requestAnimationFrame((time: number): void =>
            this.tick(time),
        )
    }

    tick(time: number): void {
        if (this.status !== GAME_STATUS.PLAYING) 
            return

        this.rafId = requestAnimationFrame((nextTime: number): void =>
            this.tick(nextTime),
        )

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
        this.score = 0
        this.obstacles = []
        this.tokens = []
        this.tokensCollected = 0
        this.pendingEnergyToken = false
        this.shooting.clear()
        this.key = {}
        this.character.x = CHARACTER_START_X
        this.character.y = CANVAS.height / 2
        this.character.speedX = 0
        this.character.speedY = 0
        this.character.fillColor = null
        this.character.image.src = ICONS.IRON_MAN
        this.topScores = getTopScores()
    }

    everyInterval(n: number): boolean {
        return !!((this.frameNo / n) % 1 === 0)
    }

    shouldAddObstacle(interval: number): boolean {
        return this.frameNo === 1 || this.everyInterval(interval)
    }

    spawnBaseSpeed(spawn: ObstacleSpawn): number {
        if ("speedX" in spawn)
            return Math.abs(spawn.speedX)

        return (
            (Math.abs(OBSTACLE_SPAWN.PLANE_SPEED.min) +
                Math.abs(OBSTACLE_SPAWN.PLANE_SPEED.max)) /
            2
        )
    }

    obstacleSpawnInterval(spawn: ObstacleSpawn): number {
        const baseInterval = this.character.width * spawn.intervalFactor
        const bonus = this.scrollSpeedBonus()
        const baseSpeed = this.spawnBaseSpeed(spawn)

        if (bonus === 0 || baseSpeed === 0)
            return Math.max(1, baseInterval)

        return Math.max(
            1,
            Math.round((baseInterval * baseSpeed) / (baseSpeed + bonus)),
        )
    }

    elapsedMs(): number {
        return this.frameNo * TICK_MS
    }

    elapsedSeconds(): number {
        return this.elapsedMs() / 1000
    }

    scrollSpeedBonus(): number {
        return timePeriodIndex(this.elapsedMs()) * SKY.SPEED_STEP
    }

    currentScore(): number {
        return (
            Math.floor(this.elapsedSeconds()) +
            this.tokensCollected * ENERGY_TOKEN.POINTS
        )
    }

    stopOnCollision(): void {
        this.score = this.currentScore()
        this.topScores = saveScore(this.score)
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
            if (!this.shouldAddObstacle(this.obstacleSpawnInterval(spawn)))
                continue

            const height =
                "getHeight" in spawn ? spawn.getHeight() : spawn.height
            const y = spawn.getY(this.canvas, height)
            const speedX =
                "getSpeed" in spawn ? spawn.getSpeed() : spawn.speedX

            this.obstacles.push(
                new Obstacle({
                    width: spawn.width,
                    height,
                    color: spawn.color,
                    x: this.canvas.width,
                    y,
                    type: spawn.type,
                    speedX,
                }),
            )

            if (spawn.type === ENTITY_TYPE.BUILDING)
                this.queueEnergyToken()
        }
    }

    queueEnergyToken(): void {
        if (this.pendingEnergyToken)
            return

        if (this.tokens.length >= ENERGY_TOKEN.MAX_ON_SCREEN)
            return

        if (Math.random() >= ENERGY_TOKEN.GAP_CHANCE)
            return

        const buildings = this.obstacles.filter(
            (obstacle): boolean => obstacle.type === ENTITY_TYPE.BUILDING,
        )

        if (buildings.length < 2)
            return

        this.pendingEnergyToken = true
    }

    isSpawnLaneClear(): boolean {
        const size = ENERGY_TOKEN.SIZE
        const laneLeft = this.canvas.width
        const clearRight = laneLeft - size
        const laneRight = laneLeft + size
        const blocksLane = (entity: Box): boolean =>
            !(
                entity.x + entity.width <= clearRight ||
                entity.x >= laneRight
            )

        return (
            !this.obstacles.some(
                (obstacle): boolean =>
                    obstacle.type === ENTITY_TYPE.BUILDING &&
                    blocksLane(obstacle),
            ) && !this.tokens.some(blocksLane)
        )
    }

    maybeSpawnEnergyToken(): void {
        if (!this.pendingEnergyToken)
            return

        if (this.tokens.length >= ENERGY_TOKEN.MAX_ON_SCREEN)
            return

        if (!this.isSpawnLaneClear())
            return

        const size = ENERGY_TOKEN.SIZE
        const maxY = this.canvas.height - size

        if (maxY < ENERGY_TOKEN.Y_MIN)
            return

        this.tokens.push(
            new EnergyToken({
                x: this.canvas.width,
                y: randomInt(ENERGY_TOKEN.Y_MIN, maxY),
            }),
        )
        this.pendingEnergyToken = false
    }

    handleTokenCollection(): void {
        const remaining: EnergyToken[] = []

        for (const token of this.tokens) {
            if (this.character.crashWith(token)) {
                this.shooting.addAmmo()
                this.tokensCollected += 1
                continue
            }

            remaining.push(token)
        }

        this.tokens = remaining
    }

    updateTokensPosition(): void {
        if (this.tokens.length === 0)
            return

        const bonus = this.scrollSpeedBonus()

        for (const token of this.tokens) {
            token.applySpeedBonus(bonus)
            token.move()
        }

        this.tokens = this.tokens.filter(
            (token): boolean => !token.isOffScreen(),
        )
    }

    updateObstaclesPosition(): void {
        if (this.obstacles.length === 0) 
            return

        const bonus = this.scrollSpeedBonus()

        for (const obstacle of this.obstacles) {
            obstacle.applySpeedBonus(bonus)
            obstacle.move()
        }

        this.obstacles = this.obstacles.filter(
            (obstacle): boolean => !obstacle.isOffScreen(),
        )
    }

    moveCharacter(): void {
        if (this.status !== GAME_STATUS.PLAYING || !this.key) 
            return

        const motion = resolveCharacterMotion(this.key)

        this.character.speedX = motion.speedX
        this.character.speedY = motion.speedY
        this.character.x = clampPlayerX(this.character, this.canvas)
        this.character.y = clampPlayerY(this.character, this.canvas)
        this.character.applyAppearance(motion.appearance)
    }

    draw(): void {
        this.clear()
        this.background.update(this.context, this.elapsedMs())

        for (const obstacle of this.obstacles)
            obstacle.update(this.context)

        for (const token of this.tokens)
            token.update(this.context)

        this.character.update(this.context)
        this.shooting.draw(this.context)
        this.scoreHud.draw(
            this.context,
            this.score,
            this.topScores,
            this.shooting.ammo,
        )
    }

    updateShooting(): void {
        this.shooting.move()
        this.shooting.removeOffScreen(this.canvas)
        this.obstacles = this.shooting.hitObstacles(this.obstacles)
    }

    update(): void {
        this.updateShooting()
        this.handleObstacleCollision()
        this.handleTokenCollection()

        this.frameNo += 1

        if (this.status === GAME_STATUS.PLAYING)
            this.score = this.currentScore()

        if (OBSTACLES.ENABLED) {
            this.generateNewObstacles()
            this.updateObstaclesPosition()
        }

        this.maybeSpawnEnergyToken()
        this.updateTokensPosition()

        this.character.newPos()
        this.character.speedX = 0
        this.character.speedY = 0
        this.moveCharacter()

        this.draw()
    }
}
