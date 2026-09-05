import { SCEEN } from "../constants.js"

export function component({ width, height, color, x, y, type }) {
    this.type = type

    if (
        this.type === "image" ||
        this.type === "background" ||
        this.type === "cloud" ||
        this.type === "plane" ||
        this.type === "build"
    ) {
        this.image = new Image()
        this.image.src = color
    }

    this.width = width
    this.height = height
    this.speedX = 0
    this.speedY = 0
    this.x = x
    this.y = y

    this.update = function () {
        const ctx = SCEEN.area.context
        if (this.type === "image" || this.type === "background") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
            if (this.type === "background")
                ctx.drawImage(
                    this.image,
                    this.x + this.width,
                    this.y,
                    this.width,
                    this.height,
                )
        } else {
            if (this.type === "cloud")
                ctx.drawImage(
                    this.image,
                    this.x,
                    this.y,
                    this.width,
                    this.height,
                )
            else if (this.type === "plane")
                ctx.drawImage(
                    this.image,
                    this.x,
                    this.y,
                    this.width,
                    this.height,
                )
            else if (this.type === "build")
                ctx.drawImage(
                    this.image,
                    this.x,
                    this.y,
                    this.width,
                    this.height,
                )
            else {
                ctx.fillStyle = color
                ctx.fillRect(this.x, this.y, this.width, this.height)
            }
        }
    }

    this.newPos = function () {
        this.x += this.speedX
        this.y += this.speedY
    }

    this.crashWith = function (obj) {
        let myleft = this.x
        let myright = this.x + this.width
        let mytop = this.y
        let mybottom = this.y + this.height
        let objleft = obj.x
        let objright = obj.x + obj.width
        let objtop = obj.y
        let objbottom = obj.y + obj.height
        let crash = true

        if (
            mybottom < objtop ||
            mytop > objbottom ||
            myright < objleft ||
            myleft > objright
        )
            crash = false

        return crash
    }

    this.Pos = () => {
        if (this.type === "background") if (this.x === -this.width) this.x = 0
    }
}
