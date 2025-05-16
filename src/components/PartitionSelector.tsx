import React, { useState } from 'react'
import TileCard from './TileCard'
import type { Tile } from '../model/Tile'

export interface PartitionWithLeftover {
  score: number
  leftover: number
  melds: Array<{ tiles: Tile[] }>
}

interface PartitionSelectorProps {
  /** Precomputed partitions (e.g., from optimizePartition) */
  partitions: PartitionWithLeftover[]
}

const PartitionSelector: React.FC<PartitionSelectorProps> = ({ partitions }) => {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = partitions[selectedIdx] || null

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIdx(Number(e.target.value))
  }

  if (partitions.length === 0) return null

  return (
    <div style={{ marginTop: '1rem' }}>
      <label htmlFor="solution-select">
        Choose solution:&nbsp;
        <select id="solution-select" value={selectedIdx} onChange={handleChange}>
          {partitions.map((p, idx) => (
            <option key={idx} value={idx}>
              {`#${idx + 1}: score ${p.score}, leftover ${p.leftover}`}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <div style={{ marginTop: '0.5rem' }}>
          <h4>{`Solution #${selectedIdx + 1}`}</h4>
          {selected.melds.map((meld, mIdx) => (
            <div
              key={mIdx}
              style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}
            >
              {meld.tiles.map((tile, tIdx) => (
                <TileCard
                  key={`${tile.id}-${tIdx}`}   
                  tile={tile}
                  remaining={0}
                  onClick={() => {}}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PartitionSelector
