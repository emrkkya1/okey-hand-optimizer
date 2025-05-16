import type { Tile, Color } from '../model/Tile'

// The four “suits”
export const COLORS: Color[] = ['Red', 'Blue', 'Black', 'Yellow']

/**
 * Build the physical set:
 *  - 4 colors × numbers 1–13, two copies each
 *  - 2 “false jokers” (will be reassigned after indicator)
 */
export function generateAllTiles(): Tile[] {
  const tiles: Tile[] = []
  COLORS.forEach(color => {
    for (let number = 1; number <= 13; number++) {
      for (let copy = 1; copy <= 2; copy++) {
        tiles.push({
          id: `${color}-${number}-${copy}`,
          color,
          number,
          type: 'regular',
        })
      }
    }
  })

  // two placeholder jokers
  for (let i = 1; i <= 2; i++) {
    tiles.push({
      id: `falseJoker-${i}`,
      color: 'Red',    // placeholder, will override later
      number: 0,       // placeholder
      type: 'falseJoker',
    })
  }

  return tiles
}