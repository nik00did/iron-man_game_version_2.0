export type Box = {
    x: number
    y: number
    width: number
    height: number
}

export type SceneEntityProps = {
    x: number
    y: number
    width: number
    height: number
    speedX?: number
}

export class SceneEntity {
    x: number
    y: number
    width: number
    height: number
    speedX: number
    baseSpeedX: number

    constructor({ x, y, width, height, speedX = 0 }: SceneEntityProps) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speedX = speedX
        this.baseSpeedX = speedX
    }

    applySpeedBonus(bonus: number): void {
        this.speedX = this.baseSpeedX - bonus
    }

    move(): void {
        this.x += this.speedX
    }

    isOffScreen(): boolean {
        return this.x + this.width <= 0
    }

    crashWith(obj: Box): boolean {
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
