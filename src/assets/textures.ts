import { Assets, Texture } from 'pixi.js';

type TexMap = {
  up: Texture;
  left: Texture;
  right: Texture;
  enemy_left: Texture;
  enemy_turn: Texture;
  thumb: Texture;
};

export const textures: Partial<TexMap> = {};

export async function loadTextures(): Promise<TexMap> {
  // Load all textures in parallel from the public/art folder
  const [up, left, right, enemyLeft, enemyTurn, thumb] = await Promise.all([
    Assets.load('/art/up.png') as Promise<Texture>,
    Assets.load('/art/left.png') as Promise<Texture>,
    Assets.load('/art/right.png') as Promise<Texture>,
    Assets.load('/art/enemy_left.png') as Promise<Texture>,
    Assets.load('/art/enemy_turn.png') as Promise<Texture>,
    Assets.load('/art/life.png') as Promise<Texture>,
  ]);

  textures.up = up;
  textures.left = left;
  textures.right = right;
  textures.enemy_left = enemyLeft;
  textures.enemy_turn = enemyTurn;
  textures.thumb = thumb;

  return textures as TexMap;
}

export default textures;
