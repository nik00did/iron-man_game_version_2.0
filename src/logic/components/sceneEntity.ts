export type SceneEntityProps = {
    width: number
    height: number
    color: string
    x: number
    y: number
    type: string
    speedX?: number
}

export type Box = {
    x: number
    y: number
    width: number
    height: number
}

export class SceneEntity {
    type: string
    color: string
    width: number
    height: number
    speedX: number
    speedY: number
    x: number
    y: number
    image: HTMLImageElement

    constructor({ width, height, color, x, y, type, speedX = 0 }: SceneEntityProps) {
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

    update(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    whenReady(): Promise<void> {
        if (this.image.complete)
            return Promise.resolve()

        if (typeof this.image.decode === "function") {
            return this.image.decode().then(
                (): void => undefined,
                (): void => undefined,
            )
        }

        return new Promise((resolve): void => {
            if (typeof this.image.addEventListener !== "function") {
                resolve()

                return
            }

            this.image.addEventListener("load", (): void => resolve(), { once: true })
            this.image.addEventListener("error", (): void => resolve(), { once: true })
        })
    }

    newPos(): void {
        this.x += this.speedX
        this.y += this.speedY
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
