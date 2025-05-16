import React from 'react'
import TileCard from './TileCard'
import type { Tile } from '../model/Tile'

export interface TileOption {
  tile: Tile
  remaining: number
}

interface TileListProps {
  options: TileOption[]
  onTileClick: (tile: Tile) => void
}

const TileList: React.FC<TileListProps> = ({ options, onTileClick }) => (
  <div
    className="tile-list"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(4rem, 1fr))',
      gap: 8,
    }}
  >
    {options.map(({ tile, remaining }) => (
      <TileCard
        key={tile.id}
        tile={tile}
        remaining={remaining}
        onClick={() => onTileClick(tile)}
      />
    ))}
  </div>
)

export default TileList