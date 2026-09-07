import { GAME_CONTROLS, GAME_STATUS } from "../../constants.js"
import type { GameStatus } from "../../constants.js"

export type GameControlHandlers = {
    onStart: () => void
    onPause: () => void
    onResume: () => void
    onRestart: () => void
}

export class GameControls {
    veil: HTMLDivElement
    startButton: HTMLButtonElement
    pauseButton: HTMLButtonElement
    resumeButton: HTMLButtonElement
    restartButton: HTMLButtonElement

    constructor(root: HTMLElement, handlers: GameControlHandlers) {
        this.veil = this.addDiv(root, GAME_CONTROLS.VEIL_CLASS)
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
        this.sync(GAME_STATUS.IDLE)
    }

    sync(status: GameStatus): void {
        this.veil.hidden = status === GAME_STATUS.PLAYING
        this.startButton.hidden = status !== GAME_STATUS.IDLE
        this.pauseButton.hidden = status !== GAME_STATUS.PLAYING
        this.resumeButton.hidden = status !== GAME_STATUS.PAUSED
        this.restartButton.hidden = status !== GAME_STATUS.CRASHED
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
