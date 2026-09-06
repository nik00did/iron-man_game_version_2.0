import { SCEEN } from "../constants.js"

export class Component {
    constructor({ width, height, color, x, y, type, speedX = 0 }) {
        this.type = type // looks like not needed, because not used field here
        this.color = color
        this.width = width
        this.height = height
        this.speedX = speedX
        this.speedY = 0
        this.x = x
        this.y = y

        this.image = new Image()
        this.image.src = color
    }

    update() {
        const ctx = SCEEN.area.context

        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    newPos() {
        this.x += this.speedX
        this.y += this.speedY
    }

    crashWith(obj) {
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

    Pos() {
        if (this.x === -this.width)
            this.x = 0
    }
}
