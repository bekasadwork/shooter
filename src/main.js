import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import HUDScene from './scenes/HUDScene.js';
import LevelCompleteScene from './scenes/LevelCompleteScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import WinScene from './scenes/WinScene.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './config/constants.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.bg,
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    HUDScene,
    LevelCompleteScene,
    GameOverScene,
    WinScene,
  ],
};

new Phaser.Game(config);
