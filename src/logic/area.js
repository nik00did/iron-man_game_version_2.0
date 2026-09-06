import { SCEEN, OBSTACLE_SPAWNS, PLAYER_MOVES, CANVAS } from "../constants.js"
import { Component } from "./component.js"

export class Area {
    constructor() {
        this.canvas = document.createElement("canvas")
        this.canvas.width = CANVAS.width
        this.canvas.height = CANVAS.height
        this.context = this.canvas.getContext("2d")
        this.key = []
        this.frameNo = 0
        this.interval = null
    }

    start() {
        document.body.insertBefore(this.canvas, document.body.childNodes[0])
        this.interval = setInterval(updateArea, 20)
        window.addEventListener("keydown", (e) => {
            this.key[e.keyCode] = true
        })
        window.addEventListener("keyup", (e) => {
            this.key[e.keyCode] = false
        })
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    stop() {
        clearInterval(this.interval)
    }
}

const everyInterval = (n) => 
    !!((SCEEN.area.frameNo / n) % 1 === 0)

const stopSceenItems = () => {
    SCEEN.music.stop()
    SCEEN.collisionSound.Play()
    SCEEN.area.stop()
}

const handleObstacleCollision = () => {
    for (const obstacle of SCEEN.obstacles) {
        if (SCEEN.character.crashWith(obstacle)) {
            stopSceenItems()
            return
        }
    }
}

const shouldAddObstacle = (interval) => {
    return SCEEN.area.frameNo === 1 || everyInterval(interval)
}

const generateNewObstacles = ({ area, character }) => {
    for (const spawn of OBSTACLE_SPAWNS) {
        if (!shouldAddObstacle(character.width * spawn.intervalFactor)) 
            continue

        const height = spawn.getHeight ? spawn.getHeight() : spawn.height
        const y = spawn.getY(area.canvas, height)

        SCEEN.obstacles.push(
            new Component({
                width: spawn.width,
                height,
                color: spawn.color,
                x: area.canvas.width,
                y,
                type: spawn.type,
                speedX: spawn.speedX,
            }),
        )
    }
}

const updateObstacles = () => {
    for (const obstacle of SCEEN.obstacles) {
        obstacle.x += obstacle.speedX
        obstacle.update()
    }
}

const moveCharacter = ({ area, character }) => {
    if (!area.key)
        return

    for (const move of PLAYER_MOVES) {
        if (!area.key[move.key])
            continue

        character.image.src = move.icon
        character[move.axis] = move.clamp(character, area.canvas)
        character[move.speedKey] += move.delta
    }
}

function updateArea() {
    const { character, music, background, area } = SCEEN

    music.Play()

    handleObstacleCollision()

    area.clear()
    area.frameNo += 1
    background.Pos()
    background.update()

    generateNewObstacles({ area, character })
    updateObstacles()

    character.newPos()
    character.speedX = 0
    character.speedY = 0
    moveCharacter({ area, character })

    character.update()
}
