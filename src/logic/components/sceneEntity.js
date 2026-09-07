export class SceneEntity {
    constructor({ width, height, color, x, y, type, speedX = 0 }) {
        this.type = type
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

    update(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    newPos() {
        this.x += this.speedX
        this.y += this.speedY
    }

    crashWith(obj) {
        const myleft = this.x
        const myright = this.x + this.width
        const mytop = this.y
        const mybottom = this.y + this.height
        const objleft = obj.x
        const objright = obj.x + obj.width
        const objtop = obj.y
        const objbottom = obj.y + obj.height
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
}
