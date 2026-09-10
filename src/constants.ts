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

export type PlayerMove = {
    key: string
    icon: string
    axis: "x" | "y"
    speedKey: "speedX" | "speedY"
    delta: number
    clamp: (piece: MovablePiece, canvas: CanvasSize) => number
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

export const BASIC_ICON_PATH = "/assets/icons"
export const BASIC_SOUND_PATH = "/assets/sounds"

export const CANVAS = {
    width: 1000,
    height: 500,
}

export const TICK_MS = 20

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

export const ICONS = {
    CLOUD: `${BASIC_ICON_PATH}/cloud.png`,
    PLANE: `${BASIC_ICON_PATH}/plane.png`,
    IMAGE: `${BASIC_ICON_PATH}/iron-man.png`,
    BACKGROUND: `${BASIC_ICON_PATH}/bluesky4.png`,
    BUILDING: `${BASIC_ICON_PATH}/building.png`,
    IRON_MAN: `${BASIC_ICON_PATH}/iron-man.png`,
    MOVE_LEFT: `${BASIC_ICON_PATH}/iron-man(move-left).png`,
    MOVE_RIGHT: `${BASIC_ICON_PATH}/iron-man(move).png`,
    MOVE_UP: `${BASIC_ICON_PATH}/iron-man.png`,
    MOVE_DOWN: `${BASIC_ICON_PATH}/iron-man(down).png`,
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

export const PLAYER_MOVES: PlayerMove[] = [
    {
        key: KEYS.LEFT,
        icon: ICONS.MOVE_LEFT,
        axis: "x",
        speedKey: "speedX",
        delta: -4,
        clamp: (piece): number => Math.max(piece.x, 0),
    },
    {
        key: KEYS.UP,
        icon: ICONS.MOVE_UP,
        axis: "y",
        speedKey: "speedY",
        delta: -4,
        clamp: (piece): number => Math.max(piece.y, 0),
    },
    {
        key: KEYS.RIGHT,
        icon: ICONS.MOVE_RIGHT,
        axis: "x",
        speedKey: "speedX",
        delta: 4,
        clamp: (piece, canvas): number =>
            Math.min(piece.x, canvas.width - piece.width),
    },
    {
        key: KEYS.DOWN,
        icon: ICONS.MOVE_DOWN,
        axis: "y",
        speedKey: "speedY",
        delta: 4,
        clamp: (piece, canvas): number =>
            Math.min(piece.y, canvas.height - piece.height),
    },
]

export const ENTITY_TYPE = {
    CLOUD: "cloud",
    PLANE: "plane",
    CHARACTER: "character",
    BACKGROUND: "background",
    BUILDING: "building",
}

export const OBSTACLE_SPAWNS: ObstacleSpawn[] = [
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
]
