// Game constants for Infinite Climber

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// Physics
export const GRAVITY = 800;
export const HERO_SPEED = 250;
export const HERO_JUMP_VELOCITY = -520;
export const HERO_DOUBLE_JUMP_VELOCITY = -450;

// Level generation
export const LEVEL_VERTICAL_GAP = 150; // Vertical distance between levels (reduced for better reachability)
export const DIVIDER_MIN_WIDTH = 150;  // Min width of a divider in pixels
export const DIVIDER_MAX_WIDTH = 350;  // Max width of a divider in pixels
export const TILE_SIZE = 32;           // Size of each tile in divider
export const DIVIDERS_PER_LEVEL_MIN = 2;
export const DIVIDERS_PER_LEVEL_MAX = 3;

// Hero
export const HERO_START_LIVES = 10;
export const HERO_INVULNERABILITY_TIME = 2000; // ms

// Bug
export const BUG_SPEED = 80;

// Spawn rates
export const STARS_PER_LEVEL = 3;

// Camera
export const CAMERA_LERP = 0.1;
export const CAMERA_OFFSET_Y = 300; // How far below the hero the camera centers

// Recycling
export const RECYCLE_DISTANCE = 600; // Distance below camera to recycle objects

// Sprite frame configs (based on viewing the spritesheets)
export const HERO_FRAME_WIDTH = 64;
export const HERO_FRAME_HEIGHT = 64;

// Asset keys
export const ASSETS = {
     HERO_IDLE: 'hero-idle',
     HERO_RUN_1: 'hero-run-1',
     HERO_RUN_2: 'hero-run-2',
     HERO_JUMP: 'hero-jump',
     HERO_HURT: 'hero-hurt',
     HERO_DEAD: 'hero-dead',
     BUG: 'bug',
     COIN: 'coin',
     TILE: 'tile',
     BACKGROUND: 'background',
} as const;
