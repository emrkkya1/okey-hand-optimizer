import React from 'react'
import TileCard from './TileCard'
import type { Tile } from '../model/Tile'

interface HandProps {
  hand: Tile[]
  onRemove: (tile: Tile) => void
  /** Optional indicator tile to resolve false jokers and jokers */
  indicator?: Tile
}

const Hand: React.FC<HandProps> = ({ hand, onRemove, indicator }) => (
  <div
    className="hand"
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: 4,
      minHeight: '6rem',
    }}
  >
    {hand.length === 0 && (
      <div style={{ color: '#999' }}>Click tiles above to build your hand …</div>
    )}

    {hand.map((tile, idx) => {
      // Determine display properties
      let displayTile: Tile = { ...tile }

      if (indicator) {
        // Resolve false jokers: indicator + 1
        if (tile.type === 'falseJoker') {
          const nextNum = indicator.number === 13 ? 1 : indicator.number + 1
          displayTile = {
            ...displayTile,
            color: indicator.color,
            number: nextNum,
          }
        }
        
        // Identify jokers: regular tile matching color and number = indicator+1
        const jokerNum = indicator.number === 13 ? 1 : indicator.number + 1
        if (tile.type === 'regular' &&
            tile.color === indicator.color &&
            tile.number === jokerNum) {
          displayTile = {
            ...displayTile,
            type: 'joker',
          }
        }
      }

      return (
        <TileCard
          key={`${tile.id}-${idx}`}
          tile={displayTile}
          remaining={1}        // hand tiles always clickable to remove
          onClick={() => onRemove(tile)}
        />
      )
    })}
  </div>
)

export default Hand