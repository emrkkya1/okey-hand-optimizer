import type { Tile, Color } from '../model/Tile';

/** Create a canonical key for memoization */
export function signature(tiles: Tile[], jokers: number): string {
  const counts: Record<string, number> = {};
  for (const t of tiles) {
    const key = `${t.color}:${t.number}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  const parts = Object.keys(counts)
    .sort()
    .map(k => `${k}=${counts[k]}`);
  parts.push(`J=${jokers}`);
  return parts.join('|');
}

/** Remove a specific list of tiles (by id) from a hand */
export function removeTiles(tiles: Tile[], toRemove: Tile[]): Tile[] {
  const copy = [...tiles];
  for (const rem of toRemove) {
    const idx = copy.findIndex(t => t.id === rem.id && t.type !== 'joker');
    if (idx !== -1) copy.splice(idx, 1);
  }
  return copy;
}

/** Generate k-combinations of an array */
export function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const combo: T[] = [];
  function backtrack(start: number) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      backtrack(i + 1);
      combo.pop();
    }
  }
  backtrack(0);
  return result;
}

/** Pick (but not remove) the first tile matching color & number */
export function pickTile(tiles: Tile[], color: Color, number: number): Tile {
  const t = tiles.find(t => t.color === color && t.number === number && t.type !== 'joker');
  if (!t) throw new Error(`Tile ${color}-${number} not found`);
  return t;
}

/** List distinct numbers in the hand */
export function distinctNumbers(tiles: Tile[]): number[] {
  const s = new Set(tiles.map(t => t.number));
  return Array.from(s);
}