export type MovablePiece = {
    x: number
    y: number
    width: number
    height: number
}

export type CanvasSize = {
    width: number
    height: number
}

type ObstacleSpawnBase = {
    speedX: number
    intervalFactor: number
    width: number
    color: string
    type: string
    getY: (canvas: CanvasSize, height?: number) => number
}

export type ObstacleSpawn =
    | (ObstacleSpawnBase & {
          height: number
      })
    | (ObstacleSpawnBase & {
          getHeight: () => number
      })

export type GameStatus = "idle" | "playing" | "paused" | "crashed"

export type SkyStop = {
    zenith: string
    horizon: string
}

export const BASIC_ICON_PATH = "/assets/icons"
export const BASIC_SOUND_PATH = "/assets/sounds"

export const CANVAS = {
    width: 1000,
    height: 500,
}

export const TICK_MS = 20

export const PLAYER_SPEED = 4

export const DIAGONAL_COLORS = {
    UP_RIGHT: "#4aa3de",
    UP_LEFT: "#7ec8e8",
    DOWN_RIGHT: "#e07a5f",
    DOWN_LEFT: "#c97b63",
} as const

export const SKY = {
    PERIOD_MS: 10_000,
    STOPS: [
        { zenith: "#1e6bb8", horizon: "#7ec8e8" },
        { zenith: "#3d2b5a", horizon: "#e07a5f" },
        { zenith: "#0b1026", horizon: "#3d2b5a" },
        { zenith: "#050816", horizon: "#1a2744" },
        { zenith: "#0b1026", horizon: "#2a3358" },
        { zenith: "#1a2744", horizon: "#c97b63" },
        { zenith: "#4a6fa5", horizon: "#ff9f68" },
        { zenith: "#4aa3de", horizon: "#c5e8f7" },
    ] as const satisfies readonly SkyStop[],
}

export const SCORE_HUD = {
    STORAGE_KEY: "iron-man.topScores",
    MAX_RECORDS: 3,
    FONT: "20px sans-serif",
    FONT_SIZE: 20,
    SCORE_LABEL: "Your score",
    SCORE_COLOR: "#000",
    RANK_COLORS: ["red", "yellow", "green"],
    SCORE_Y: 16,
    RANK_X: 16,
    RANK_Y: 16,
    RANK_GAP: 8,
}

const OBSTACLE_ICON_PATH = `${BASIC_ICON_PATH}/obstacles`
const CONTROL_ICON_PATH = `${BASIC_ICON_PATH}/controls`
const IRON_MAN_ICON_PATH = `${BASIC_ICON_PATH}/character/ironMan`

const OBSTACLE_ICONS = {
    CLOUD: `${OBSTACLE_ICON_PATH}/cloud.svg`,
    PLANE: `${OBSTACLE_ICON_PATH}/plane.svg`,
    BUILDING: `${OBSTACLE_ICON_PATH}/building.svg`,
}

const CONTROL_ICONS = {
    START: `${CONTROL_ICON_PATH}/start.svg`,
    PAUSE: `${CONTROL_ICON_PATH}/pause.svg`,
    RESUME: `${CONTROL_ICON_PATH}/resume.svg`,
    RESTART: `${CONTROL_ICON_PATH}/restart.svg`,
}

const IRON_MAN_ICONS = {
    IRON_MAN: `${IRON_MAN_ICON_PATH}/iron-man.png`,
    MOVE_LEFT: `${IRON_MAN_ICON_PATH}/iron-man(move-left).png`,
    MOVE_RIGHT: `${IRON_MAN_ICON_PATH}/iron-man(move).png`,
    MOVE_UP: `${IRON_MAN_ICON_PATH}/iron-man.png`,
    MOVE_DOWN: `${IRON_MAN_ICON_PATH}/iron-man(down).png`,
}

export const ICONS = {
    ...OBSTACLE_ICONS,
    ...CONTROL_ICONS,
    ...IRON_MAN_ICONS,
}

export const SOUNDS = {
    FIRST_FIGHT: `${BASIC_SOUND_PATH}/First fight.mp3`,
    LOVE_ME_AGAIN: `${BASIC_SOUND_PATH}/love me again.mp3`,
}

export const KEYS = {
    LEFT: "ArrowLeft",
    UP: "ArrowUp",
    RIGHT: "ArrowRight",
    DOWN: "ArrowDown",
}

export const GAME_STATUS = {
    IDLE: "idle",
    PLAYING: "playing",
    PAUSED: "paused",
    CRASHED: "crashed",
} as const satisfies Record<string, GameStatus>

export const GAME_KEYS = {
    START: "Enter",
    PAUSE: "p",
    PAUSE_ALT: "Escape",
}

export const GAME_CONTROLS = {
    WRAPPER_CLASS: "game",
    VEIL_CLASS: "game-veil",
    BUTTON_CLASS: "game-btn",
    START_CLASS: "start",
    PAUSE_CLASS: "pause",
    RESUME_CLASS: "resume",
    RESTART_CLASS: "restart",
}

export const ENTITY_TYPE = {
    CLOUD: "cloud",
    PLANE: "plane",
    CHARACTER: "character",
    BUILDING: "building",
}

export const OBSTACLES: {
    ENABLED: boolean
    SPAWNS: ObstacleSpawn[]
} = {
    ENABLED: true,
    SPAWNS: [
        {
            speedX: -3,
            intervalFactor: 10,
            width: 100,
            height: 60,
            color: ICONS.CLOUD,
            type: ENTITY_TYPE.CLOUD,
            getY: (canvas): number => canvas.height - 320,
        },
        {
            speedX: -3,
            intervalFactor: 8,
            width: 100,
            height: 60,
            color: ICONS.CLOUD,
            type: ENTITY_TYPE.CLOUD,
            getY: (canvas): number => canvas.height - 450,
        },
        {
            speedX: -3,
            intervalFactor: 11,
            width: 80,
            height: 30,
            color: ICONS.PLANE,
            type: ENTITY_TYPE.PLANE,
            getY: (canvas): number => canvas.height - 370,
        },
        {
            speedX: -6,
            intervalFactor: 15,
            width: 100,
            height: 30,
            color: ICONS.PLANE,
            type: ENTITY_TYPE.PLANE,
            getY: (canvas): number => canvas.height - 490,
        },
        {
            speedX: -2,
            intervalFactor: 2,
            width: 60,
            color: ICONS.BUILDING,
            type: ENTITY_TYPE.BUILDING,
            getHeight: (): number => {
                const minHeight = 20
                const maxHeight = 300

                return Math.floor(
                    Math.random() * (maxHeight - minHeight + 1) + minHeight,
                )
            },
            getY: (canvas, height = 0): number => canvas.height - height,
        },
    ],
}
