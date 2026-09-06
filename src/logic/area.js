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
    SCEEN.myMusic.stop()
    SCEEN.mySound.Play()
    SCEEN.area.stop()
}

const handleObstacleCollision = () => {
    for (const spawn of OBSTACLE_SPAWNS) {
        for (const obstacle of SCEEN[spawn.group]) {
            if (SCEEN.myPiece.crashWith(obstacle)) {
                stopSceenItems()
                return
            }
        }
    }
}

const shouldAddObstacle = (interval) => {
    return SCEEN.area.frameNo === 1 || everyInterval(interval)
}

const generateNewObstacles = ({ area, myPiece }) => {
    for (const spawn of OBSTACLE_SPAWNS) {
        if (!shouldAddObstacle(myPiece.width * spawn.intervalFactor)) 
            continue

        const height = spawn.getHeight ? spawn.getHeight() : spawn.height
        const y = spawn.getY(area.canvas, height)

        SCEEN[spawn.group].push(
            new Component({
                width: spawn.width,
                height,
                color: spawn.color,
                x: area.canvas.width,
                y,
                type: spawn.type,
            }),
        )
    }
}

const updateObstacles = () => {
    for (const spawn of OBSTACLE_SPAWNS) {
        for (const obstacle of SCEEN[spawn.group]) {
            obstacle.x += spawn.speedX
            obstacle.update()
        }
    }
}

const moveMyPiece = ({ area, myPiece }) => {
    if (!area.key)
        return

    for (const move of PLAYER_MOVES) {
        if (!area.key[move.key])
            continue

        myPiece.image.src = move.icon
        myPiece[move.axis] = move.clamp(myPiece, area.canvas)
        myPiece[move.speedKey] += move.delta
    }
}

function updateArea() {
    const { myPiece, myMusic, myBackground, area } = SCEEN

    myMusic.Play()

    handleObstacleCollision()

    area.clear()
    area.frameNo += 1
    myBackground.Pos()
    myBackground.update()

    generateNewObstacles({ area, myPiece })
    updateObstacles()

    myPiece.newPos()
    myPiece.speedX = 0
    myPiece.speedY = 0
    moveMyPiece({ area, myPiece })

    myPiece.update()
}
