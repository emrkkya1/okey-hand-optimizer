// File: src/services/partitionOptimizer.ts

import type { Tile } from '../model/Tile';
import type { Meld, Partition } from '../model/Meld';
import { signature, removeTiles, combinations, distinctNumbers } from '../utils/optimizationHelpers';

/**
 * Given a hand, returns up to the top K partitions, sorted by score descending.
 * Each result includes its score and how many tiles are left unmelded.
 */
export function optimizePartition(hand: Tile[], K = 3): Array<Partition & { leftover: number }> {
  const jokers = hand.filter(t => t.type === 'joker');
  const tiles  = hand.filter(t => t.type !== 'joker');
  tiles.sort((a, b) => a.number - b.number || a.color.localeCompare(b.color));

  // memo: signature -> array of top-K Partition
  const memo = new Map<string, Partition[]>();
  const topParts = dp(tiles, jokers.length, memo, K);

  const totalTiles = hand.length;
  return topParts.map(p => ({
    ...p,
    leftover: totalTiles - p.melds.reduce((cnt, m) => cnt + m.tiles.length, 0),
  }));
}

function dp(
  tiles: Tile[],
  jokersLeft: number,
  memo: Map<string, Partition[]>,
  K: number
): Partition[] {
  const key = signature(tiles, jokersLeft);
  if (memo.has(key)) return memo.get(key)!;

  let candidates: Partition[] = [];

  // if no tiles left, the only partition is the empty one
  if (tiles.length === 0) {
    const base: Partition = { melds: [], score: 0 };
    memo.set(key, [base]);
    return [base];
  }

  // build partitions by taking one meld and combining with sub-partitions
  for (const meld of generateAllMelds(tiles, jokersLeft)) {
    const remTiles  = removeTiles(tiles, meld.realTiles);
    const remJokers = jokersLeft - meld.jokerCount;
    const subs      = dp(remTiles, remJokers, memo, K);
    for (const sub of subs) {
      candidates.push({
        melds: [meld, ...sub.melds],
        score: sub.score + meld.value,
      });
    }
  }

  // if no melds could be formed, fall back to empty partition
  if (candidates.length === 0) {
    candidates = [{ melds: [], score: 0 }];
  }

  // sort by score descending and select top K
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, K);
  memo.set(key, top);
  return top;
}

function generateAllMelds(tiles: Tile[], jokersLeft: number): Meld[] {
  const results: Meld[] = [];

  // 1) GROUPS: 3 or 4 of same number, all different colors
  for (const n of distinctNumbers(tiles)) {
    // group available tiles of number n by color
    const byColor = new Map<string, Tile[]>();
    for (const t of tiles) {
      if (t.number === n && t.type !== 'joker') {
        const arr = byColor.get(t.color) ?? [];
        arr.push(t);
        byColor.set(t.color, arr);
      }
    }
    const colors = Array.from(byColor.keys());

    for (const size of [3, 4]) {
      // choose subsets of distinct colors (size up to `size`)
      for (const colorSubset of combinations(colors, Math.min(size, colors.length))) {
        const need = size - colorSubset.length;
        if (need > jokersLeft) continue;

        // pick exactly one tile per color
        const realTiles = colorSubset.map(color => byColor.get(color)![0]);
        // fill with jokers for the remainder
        const jokers = Array.from({ length: need }, () => ({
          id: 'joker' as const,
          color: realTiles[0]?.color ?? 'Red',
          number: n,
          type: 'joker' as const,
        } as Tile));

        const tilesInMeld = [...realTiles, ...jokers];
        const val = tilesInMeld.reduce((sum, t) => sum + t.number, 0);

        results.push({
          tiles:      tilesInMeld,
          realTiles,
          jokerCount: need,
          type:       'group',
          value:      val,
        });
      }
    }
  }

  // 2) RUNS: length ≥ 3, same color, consecutive numbers
  for (const c of ['Red', 'Blue', 'Black', 'Yellow'] as const) {
    // map number → list of tiles of that color
    const mapNum = new Map<number, Tile[]>();
    for (const t of tiles) {
      if (t.color === c && t.type !== 'joker') {
        const arr = mapNum.get(t.number) ?? [];
        arr.push(t);
        mapNum.set(t.number, arr);
      }
    }
    const presentNums = Array.from(mapNum.keys()).sort((a, b) => a - b);
    const maxLen      = presentNums.length + jokersLeft;
    if (maxLen < 3) continue;

    for (let L = 3; L <= maxLen; L++) {
      for (let start = 1; start <= 13 - L + 1; start++) {
        const end = start + L - 1;
        const windowNums = presentNums.filter(n => n >= start && n <= end);
        const missCount  = L - windowNums.length;
        if (missCount < 0 || missCount > jokersLeft) continue;

        // one tile per present number
        const realTiles = windowNums.map(n => mapNum.get(n)![0]);
        // jokers fill missing numbers
        const missing: number[] = [];
        for (let num = start; num <= end; num++) {
          if (!windowNums.includes(num)) missing.push(num);
        }
        const jokers = missing.map(num => ({
          id: 'joker' as const,
          color: c,
          number: num,
          type: 'joker' as const,
        } as Tile));

        const tilesInMeld = [...realTiles, ...jokers];
        const val = tilesInMeld.reduce((sum, t) => sum + t.number, 0);

        results.push({
          tiles:      tilesInMeld,
          realTiles,
          jokerCount: missCount,
          type:       'run',
          value:      val,
        });
      }
    }
  }

  return results;
}
