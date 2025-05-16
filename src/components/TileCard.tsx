import React from 'react'
import type { Tile } from '../model/Tile'

interface TileCardProps {
  /** The tile to display */
  tile: Tile
  /** How many copies of this tile are still available (0, 1, or 2) */
  remaining: number
  /** Click handler: add or remove tile */
  onClick: () => void
}

const TileCard: React.FC<TileCardProps> = ({ tile, remaining, onClick }) => {
  const disabled = remaining <= 0
  const bgColor = '#fff5e0'           // cream background
  const circleBg = '#f0e4c2'          // slightly darker cream
  const isFalseJoker = tile.type === 'falseJoker'
  const isJoker = tile.type === 'joker'
  // Always use the tile's own color for the number, even for false jokers
  const numberColor = tile.color.toLowerCase()

  const borderStyle = isFalseJoker
    ? '2px dotted #999'
    : '1px solid #e0d4b0'

  return (
    <button
      className="tile-card"
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        backgroundColor: bgColor,
        border: borderStyle,
        borderRadius: '12px',
        padding: '0.5rem',
        width: '5rem',
        height: '7rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Yellow star for joker tiles */}
      {isJoker && (
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
          }}
        >
          <path
            d="M12 .587l3.668 7.431L24 9.75l-6 5.849 1.416 8.261L12 19.897l-7.416 3.963L6 15.599 0 9.75l8.332-1.732z"
            fill="#FFD700"
          />
        </svg>
      )}

      {/* Number with thin black border for readability */}
      <div
        style={{
          color: numberColor,
          fontSize: '1.75rem',
          fontWeight: 700,
          lineHeight: 1,
          WebkitTextStroke: '1px black',
          textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
        }}
      >
        {tile.number || 'J'}
      </div>

      {/* Decorative circles */}
      <svg
        width={32}
        height={32}
        style={{ marginTop: 8 }}
      >
        <circle cx={16} cy={16} r={16} fill={circleBg} />
        <circle cx={16} cy={16} r={10} fill={numberColor} />
      </svg>
    </button>
  )
}

export default TileCard
