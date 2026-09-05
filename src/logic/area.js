import { ICONS, SCEEN } from "../constants.js"
import { component } from "./component.js"

export const initArea = () => {
    const area = {
        canvas: document.createElement("canvas"),
        start: function () {
            this.canvas.width = 1000
            this.canvas.height = 500
            this.context = this.canvas.getContext("2d")
            document.body.insertBefore(this.canvas, document.body.childNodes[0])
            this.interval = setInterval(updateArea, 20)
            this.frameNo = 0
            window.addEventListener("keydown", function (e) {
                area.key = area.key || []
                area.key[e.keyCode] = true
            })
            window.addEventListener("keyup", function (e) {
                area.key[e.keyCode] = false
            })
        },
        clear: function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        },
        stop: function () {
            clearInterval(this.interval)
        },
    }

    return area
}

function everyInterval(n) {
    if ((SCEEN.area.frameNo / n) % 1 === 0) return true
    else return false
}

function updateArea() {
    const {
        myObstacle,
        clouds,
        planes,
        anotherPlanes,
        build,
        myPiece,
        myMusic,
        mySound,
        myBackground,
        area,
    } = SCEEN
    let x, y

    myMusic.Play()
    for (let i = 0; i < myObstacle.length; i++) {
        if (myPiece.crashWith(myObstacle[i])) {
            myMusic.stop()
            mySound.Play()
            area.stop()
            return
        }
    }
    for (let i = 0; i < clouds.length; i++) {
        if (myPiece.crashWith(clouds[i])) {
            myMusic.stop()
            mySound.Play()
            area.stop()
            return
        }
    }
    for (let i = 0; i < planes.length; i++) {
        if (myPiece.crashWith(planes[i])) {
            myMusic.stop()
            mySound.Play()
            area.stop()
            return
        }
    }
    for (let i = 0; i < anotherPlanes.length; i++) {
        if (myPiece.crashWith(anotherPlanes[i])) {
            myMusic.stop()
            mySound.Play()
            area.stop()
            return
        }
    }
    for (let i = 0; i < build.length; i++) {
        if (myPiece.crashWith(build[i])) {
            myMusic.stop()
            mySound.Play()
            area.stop()
            return
        }
    }
    area.clear()
    area.frameNo += 1
    //myBackground.x+=-1;
    myBackground.Pos()
    myBackground.update()
    if (area.frameNo === 1 || everyInterval(myPiece.width * 10)) {
        x = area.canvas.width
        y = area.canvas.height - 320
        myObstacle.push(
            new component(100, 60, `${ICONS}/cloud.png`, x, y, "cloud"),
        )
    }
    if (area.frameNo === 1 || everyInterval(myPiece.width * 8)) {
        x = area.canvas.width
        y = area.canvas.height - 450
        clouds.push(new component(100, 60, `${ICONS}/cloud.png`, x, y, "cloud"))
    }
    if (area.frameNo === 1 || everyInterval(myPiece.width * 11)) {
        x = area.canvas.width
        y = area.canvas.height - 370
        planes.push(new component(80, 30, `${ICONS}/plane.png`, x, y, "plane"))
    }
    if (area.frameNo === 1 || everyInterval(myPiece.width * 15)) {
        x = area.canvas.width
        y = area.canvas.height - 490
        anotherPlanes.push(
            new component(100, 30, `${ICONS}/plane.png`, x, y, "plane"),
        )
    }
    if (area.frameNo === 1 || everyInterval(myPiece.width * 2)) {
        x = area.canvas.width
        const minHeight = 20
        const maxHeight = 300
        const height = Math.floor(
            Math.random() * (maxHeight - minHeight + 1) + minHeight,
        )
        build.push(
            new component(
                60,
                height,
                `${ICONS}/build.png`,
                x,
                500 - height,
                "build",
            ),
        )
    }
    for (let i = 0; i < myObstacle.length; i++) {
        myObstacle[i].x += -3
        myObstacle[i].update()
    }
    for (let i = 0; i < clouds.length; i++) {
        clouds[i].x += -3
        clouds[i].update()
    }
    for (let i = 0; i < planes.length; i++) {
        planes[i].x += -3
        planes[i].update()
    }
    for (let i = 0; i < anotherPlanes.length; i++) {
        anotherPlanes[i].x += -6
        anotherPlanes[i].update()
    }
    for (let i = 0; i < build.length; i++) {
        build[i].x += -2
        build[i].update()
    }
    myPiece.newPos()
    myPiece.speedX = 0
    myPiece.speedY = 0
    if (area.key && area.key[37]) {
        myPiece.image.src = `${ICONS}/iron-man(move-left).png`
        myPiece.x = Math.max(myPiece.x, 0)
        myPiece.speedX -= 4
    }
    if (area.key && area.key[38]) {
        myPiece.image.src = `${ICONS}/iron-man.png`
        myPiece.y = Math.max(myPiece.y, 0)
        myPiece.speedY -= 4
    }
    if (area.key && area.key[39]) {
        myPiece.image.src = `${ICONS}/iron-man(move).png`
        myPiece.x = Math.min(myPiece.x, area.canvas.width - myPiece.width)
        myPiece.speedX += 4
    }
    if (area.key && area.key[40]) {
        myPiece.image.src = `${ICONS}/iron-man(down).png`
        myPiece.y = Math.min(myPiece.y, area.canvas.height - myPiece.height)
        myPiece.speedY += 4
    }
    myPiece.update()
}
