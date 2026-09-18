import { ENTITY_TYPE } from "../../../constants.ts"
import { SceneEntity } from "../sceneEntity.ts"
import type { Box } from "../sceneEntity.ts"
import type { CharacterAppearance } from "./characterMotion.ts"

export type CharacterProps = {
    width: number
    height: number
    color: string
    x: number
    y: number
}

export class Character extends SceneEntity {
    type: string
    color: string
    speedY: number
    image: HTMLImageElement
    fillColor: string | null

    constructor({ width, height, color, x, y }: CharacterProps) {
        super({ x, y, width, height })
        this.type = ENTITY_TYPE.CHARACTER
        this.color = color
        this.speedY = 0
        this.fillColor = null
        this.image = new Image()
        this.image.src = color
    }

    update(ctx: CanvasRenderingContext2D): void {
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor
            ctx.fillRect(this.x, this.y, this.width, this.height)

            return
        }

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

            this.image.addEventListener("load", (): void => resolve(), {
                once: true,
            })
            this.image.addEventListener("error", (): void => resolve(), {
                once: true,
            })
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

    applyAppearance(appearance: CharacterAppearance | null): void {
        if (!appearance)
            return

        if (appearance.kind === "fill") {
            this.fillColor = appearance.color

            return
        }

        this.fillColor = null
        this.image.src = appearance.src
    }
}
