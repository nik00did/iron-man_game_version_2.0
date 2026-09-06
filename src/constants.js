export const BASIC_ICON_PATH = "/assets/icons"
export const BASIC_SOUND_PATH = "/assets/sounds"

export const CANVAS = {
    width: 1000,
    height: 500,
}

export const SCEEN = {
    character: null,
    obstacles: [],
    area: null,
    background: null,
    collisionSound: null,
    music: null,
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

export const KEY_CODES = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
}

export const PLAYER_MOVES = [
    {
        key: KEY_CODES.LEFT,
        icon: ICONS.MOVE_LEFT,
        axis: "x",
        speedKey: "speedX",
        delta: -4,
        clamp: (piece) => Math.max(piece.x, 0),
    },
    {
        key: KEY_CODES.UP,
        icon: ICONS.MOVE_UP,
        axis: "y",
        speedKey: "speedY",
        delta: -4,
        clamp: (piece) => Math.max(piece.y, 0),
    },
    {
        key: KEY_CODES.RIGHT,
        icon: ICONS.MOVE_RIGHT,
        axis: "x",
        speedKey: "speedX",
        delta: 4,
        clamp: (piece, canvas) =>
            Math.min(piece.x, canvas.width - piece.width),
    },
    {
        key: KEY_CODES.DOWN,
        icon: ICONS.MOVE_DOWN,
        axis: "y",
        speedKey: "speedY",
        delta: 4,
        clamp: (piece, canvas) =>
            Math.min(piece.y, canvas.height - piece.height),
    },
]


export const COMPONENT_TYPE = {
    CLOUD: "cloud",
    PLANE: "plane",
    IMAGE: "image",
    BACKGROUND: "background",
    BUILDING: "building",
}

export const OBSTACLE_SPAWNS = [
    {
        speedX: -3,
        intervalFactor: 10,
        width: 100,
        height: 60,
        color: ICONS.CLOUD,
        type: COMPONENT_TYPE.CLOUD,
        getY: (canvas) => canvas.height - 320,
    },
    {
        speedX: -3,
        intervalFactor: 8,
        width: 100,
        height: 60,
        color: ICONS.CLOUD,
        type: COMPONENT_TYPE.CLOUD,
        getY: (canvas) => canvas.height - 450,
    },
    {
        speedX: -3,
        intervalFactor: 11,
        width: 80,
        height: 30,
        color: ICONS.PLANE,
        type: COMPONENT_TYPE.PLANE,
        getY: (canvas) => canvas.height - 370,
    },
    {
        speedX: -6,
        intervalFactor: 15,
        width: 100,
        height: 30,
        color: ICONS.PLANE,
        type: COMPONENT_TYPE.PLANE,
        getY: (canvas) => canvas.height - 490,
    },
    {
        speedX: -2,
        intervalFactor: 2,
        width: 60,
        color: ICONS.BUILDING,
        type: COMPONENT_TYPE.BUILDING,
        getHeight: () => {
            const minHeight = 20
            const maxHeight = 300
            return Math.floor(
                Math.random() * (maxHeight - minHeight + 1) + minHeight,
            )
        },
        getY: (canvas, height) => canvas.height - height,
    },
]
