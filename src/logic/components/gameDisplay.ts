import type { GameStatus } from "../../constants.ts"
import type { GameControlHandlers } from "./gameControls.ts"
import { GameControls } from "./gameControls.ts"
import ScoreHud from "./scoreHud"

export type { GameControlHandlers }

export class GameDisplay {
    hud: ScoreHud
    controls: GameControls

    constructor(root: HTMLElement, handlers: GameControlHandlers) {
        this.hud = new ScoreHud()
        this.controls = new GameControls(root, handlers)
    }

    sync(status: GameStatus, score: number, ammo: number): void {
        this.controls.sync(status)
        this.controls.setRunStats(score, ammo)
    }

    draw(
        ctx: CanvasRenderingContext2D,
        score: number,
        topScores: number[],
        ammo: number,
        elapsedMs = 0,
    ): void {
        this.hud.draw(ctx, score, topScores, ammo, elapsedMs)
    }
}
