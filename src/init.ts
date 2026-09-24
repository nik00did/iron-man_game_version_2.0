import "./style.css"
import { ICONS } from "./constants.ts"
import { initScene } from "./logic/initScene.ts"
import packageJson from "../package.json" with { type: "json" }

const root = document.documentElement

root.style.setProperty("--icon-start", `url("${ICONS.START}")`)
root.style.setProperty("--icon-pause", `url("${ICONS.PAUSE}")`)
root.style.setProperty("--icon-resume", `url("${ICONS.RESUME}")`)
root.style.setProperty("--icon-restart", `url("${ICONS.RESTART}")`)

const versionLabel = document.querySelector("[data-app-version]")

if (versionLabel) {
    const [major, minor] = packageJson.version.split(".")

    versionLabel.textContent = `${major}.${minor}`
}

initScene()
