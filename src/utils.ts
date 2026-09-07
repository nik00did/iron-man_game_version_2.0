export function addAudioElement(src: string): HTMLAudioElement {
    const audioSound = document.createElement("audio")

    audioSound.src = src
    audioSound.setAttribute("preload", "auto")
    audioSound.setAttribute("controls", "none")
    audioSound.style.display = "none"

    document.body.appendChild(audioSound)

    return audioSound
}
