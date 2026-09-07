import { SceneEntity } from "./sceneEntity.js"

export class Background extends SceneEntity {
    update(ctx) {
        super.update(ctx)
        ctx.drawImage(
            this.image,
            this.x + this.width,
            this.y,
            this.width,
            this.height,
        )
    }

    wrap() {
        if (this.x === -this.width)
            this.x = 0
    }
}
