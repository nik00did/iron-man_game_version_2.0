import {
    BLAST,
    GAME_CONTROLS,
    GAME_HELP_LINES,
    GAME_STATUS,
    SCORE_HUD,
} from "../../constants.ts"
import type { GameStatus } from "../../constants.ts"

export type GameControlHandlers = {
    onStart: () => void
    onPause: () => void
    onResume: () => void
    onRestart: () => void
}

export class GameControls {
    veil: HTMLDivElement
    help: HTMLDivElement
    blastStat: HTMLParagraphElement
    scoreStat: HTMLParagraphElement
    startButton: HTMLButtonElement
    pauseButton: HTMLButtonElement
    resumeButton: HTMLButtonElement
    restartButton: HTMLButtonElement

    constructor(root: HTMLElement, handlers: GameControlHandlers) {
        this.veil = this.addDiv(root, GAME_CONTROLS.VEIL_CLASS)
        this.blastStat = document.createElement("p")
        this.scoreStat = document.createElement("p")
        this.help = this.addHelp(this.veil)
        this.startButton = this.addButton(
            root,
            GAME_CONTROLS.START_CLASS,
            "Start",
            handlers.onStart,
        )
        this.pauseButton = this.addButton(
            root,
            GAME_CONTROLS.PAUSE_CLASS,
            "Pause",
            handlers.onPause,
        )
        this.resumeButton = this.addButton(
            root,
            GAME_CONTROLS.RESUME_CLASS,
            "Resume",
            handlers.onResume,
        )
        this.restartButton = this.addButton(
            root,
            GAME_CONTROLS.RESTART_CLASS,
            "Restart",
            handlers.onRestart,
        )
        this.setRunStats(0, 0)
        this.sync(GAME_STATUS.IDLE)
    }

    sync(status: GameStatus): void {
        this.veil.hidden = status === GAME_STATUS.PLAYING
        this.startButton.hidden = status !== GAME_STATUS.IDLE
        this.pauseButton.hidden = status !== GAME_STATUS.PLAYING
        this.resumeButton.hidden = status !== GAME_STATUS.PAUSED
        this.restartButton.hidden = status !== GAME_STATUS.CRASHED
    }

    setRunStats(score: number, ammo: number): void {
        this.blastStat.textContent = `${SCORE_HUD.BLAST_LABEL}: ${ammo}/${BLAST.MAX_AMMO}`
        this.scoreStat.textContent = `${SCORE_HUD.SCORE_LABEL}: ${Math.floor(score)}`
    }

    addHelp(veil: HTMLDivElement): HTMLDivElement {
        const help = document.createElement("div")
        const list = document.createElement("ul")

        help.className = GAME_CONTROLS.HELP_CLASS

        for (const line of GAME_HELP_LINES) {
            const item = document.createElement("li")

            item.textContent = line
            list.appendChild(item)
        }

        this.blastStat.className = GAME_CONTROLS.HELP_BLAST_CLASS
        this.scoreStat.className = GAME_CONTROLS.HELP_SCORE_CLASS
        help.appendChild(list)
        help.appendChild(this.blastStat)
        help.appendChild(this.scoreStat)
        veil.appendChild(help)

        return help
    }

    addDiv(root: HTMLElement, className: string): HTMLDivElement {
        const element = document.createElement("div")
        element.className = className
        root.appendChild(element)

        return element
    }

    addButton(
        root: HTMLElement,
        extraClass: string,
        label: string,
        onClick: () => void,
    ): HTMLButtonElement {
        const button = document.createElement("button")
        button.type = "button"
        button.className = `${GAME_CONTROLS.BUTTON_CLASS} ${extraClass}`
        button.setAttribute("aria-label", label)
        button.addEventListener("click", (): void => onClick())
        root.appendChild(button)

        return button
    }
}
