export type Color = 'Red' | 'Blue' | 'Black' | 'Yellow';
export type TileType = 'regular' | 'joker' | 'falseJoker';

export interface Tile {
  id: string;
  color: Color;
  number: number;
  type: TileType;
}