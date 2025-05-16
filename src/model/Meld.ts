import type { Tile } from './Tile';

export type MeldType = 'group' | 'run';

export interface Meld {
  /** All tiles in this meld, including jokers assigned a specific number */
  tiles: Tile[];
  /** Actual non-joker tiles used */
  realTiles: Tile[];
  /** How many jokers were used */
  jokerCount: number;
  /** 'group' or 'run' */
  type: MeldType;
  /** Sum of the tile numbers in this meld */
  value: number;
}

export interface Partition {
  /** Chosen melds in the optimal partition */
  melds: Meld[];
  /** Total score: sum of all tile numbers in those melds */
  score: number;
}
