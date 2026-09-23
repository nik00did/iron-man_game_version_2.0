export function assetBase(): string {
    const base = import.meta.env?.BASE_URL

    return typeof base === "string" && base.length > 0 ? base : "/"
}

export function publicAsset(path: string): string {
    return `${assetBase()}${path.replace(/^\//, "")}`
}

export function addAudioElement(src: string): HTMLAudioElement {
    const audioSound = document.createElement("audio")

    audioSound.src = src
    audioSound.setAttribute("preload", "auto")
    audioSound.setAttribute("controls", "none")
    audioSound.style.display = "none"

    document.body.appendChild(audioSound)

    return audioSound
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
