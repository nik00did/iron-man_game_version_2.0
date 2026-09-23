import { defineConfig } from "vite"

function pagesBase(): string {
    if (process.env.GITHUB_PAGES !== "true")
        return "/"

    const repo = process.env.GITHUB_REPOSITORY?.split("/")[1]

    return repo ? `/${repo}/` : "/"
}

export default defineConfig({
    base: pagesBase(),
})
