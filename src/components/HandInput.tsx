// File: src/components/HandInput.tsx
import React, { useState, useMemo } from 'react'
import type { Tile, TileType } from '../model/Tile'
import type { TileOption } from './TileList'
import TileList from './TileList'
import Hand from './Hand'
import { generateAllTiles } from '../utils/tileUtils'
import PartitionSelector from './PartitionSelector'
import { optimizePartition } from '../logic/HandOptimizer'

const ALL_TILES = generateAllTiles()

interface HandInputProps {
  /** Optional callback whenever the hand updates */
  onHandChange?: (hand: Tile[]) => void
}

const HandInput: React.FC<HandInputProps> = ({ onHandChange }) => {
  const [indicator, setIndicator] = useState<Tile | null>(null)
  const [hand, setHand] = useState<Tile[]>([])

  // New state for showing and storing the computed partitions
  const [showSolutions, setShowSolutions] = useState(false)
  const [partitions, setPartitions] = useState(
    [] as Array<{ score: number; leftover: number; melds: { tiles: Tile[] }[] }>
  )

  const handleOptimize = () => {
    // Compute only when button clicked
    const results = optimizePartition(hand, 3)
      .map(p => ({
        score: p.score,
        leftover: hand.length - p.melds.reduce((c, m) => c + m.tiles.length, 0),
        melds: p.melds.map(m => ({ tiles: m.tiles })),
      }))
    setPartitions(results)
    setShowSolutions(true)
  }

  /** First step: pick an indicator tile */
  const indicatorOptions = useMemo<TileOption[]>(() => {
    const seen = new Set<string>()
    return ALL_TILES
      .filter(t => t.type === 'regular')
      .flatMap(t => {
        const key = `${t.color}-${t.number}`
        if (seen.has(key)) return []
        seen.add(key)
        return [{
          tile: { id: key, color: t.color, number: t.number, type: 'regular' as TileType },
          remaining: 2,
        }]
      })
  }, [])

  /** Build selectable tile prototypes with remaining counts */
  const options = useMemo<TileOption[]>(() => {
    const usedCount: Record<string, number> = {}
    hand.forEach(t => {
      let displayId: string
      if (t.type === 'falseJoker') {
        displayId = 'falseJoker'
      } else if (
        t.type === 'regular' &&
        indicator &&
        t.color === indicator.color &&
        t.number === (indicator.number === 13 ? 1 : indicator.number + 1)
      ) {
        displayId = `${indicator.color}-${(indicator.number === 13 ? 1 : indicator.number + 1)}-joker`
      } else {
        displayId = `${t.color}-${t.number}-${t.type}`
      }
      usedCount[displayId] = (usedCount[displayId] || 0) + 1
    })

    const protoMap = new Map<string, { tile: Tile; total: number }>()
    ALL_TILES.forEach(t => {
      let displayTile: Tile = { ...t }
      let type = t.type

      if (t.type === 'falseJoker' && indicator) {
        const nextNum = indicator.number === 13 ? 1 : indicator.number + 1
        displayTile = {
          ...t,
          color: indicator.color,
          number: nextNum,
        }
      }
      if (
        indicator &&
        t.type === 'regular' &&
        t.color === indicator.color &&
        t.number === (indicator.number === 13 ? 1 : indicator.number + 1)
      ) {
        displayTile = { ...t, type: 'joker' }
        type = 'joker'
      }

      const id = type === 'falseJoker'
        ? 'falseJoker'
        : `${displayTile.color}-${displayTile.number}-${type}`
      displayTile.id = id

      if (!protoMap.has(id)) {
        let total: number
        if (
          type === 'regular' &&
          indicator &&
          displayTile.color === indicator.color &&
          displayTile.number === indicator.number
        ) {
          total = 1
        } else if (type === 'falseJoker') {
          total = ALL_TILES.filter(tt => tt.type === 'falseJoker').length
        } else if (type === 'joker') {
          total = ALL_TILES.filter(
            tt =>
              tt.type === 'regular' &&
              tt.color === displayTile.color &&
              tt.number === displayTile.number
          ).length
        } else {
          total = ALL_TILES.filter(
            tt =>
              tt.type === 'regular' &&
              tt.color === displayTile.color &&
              tt.number === displayTile.number
          ).length
        }

        protoMap.set(id, { tile: displayTile, total })
      }
    })

    return Array.from(protoMap.entries()).map(([id, { tile, total }]) => ({
      tile,
      remaining: total - (usedCount[id] || 0),
    }))
  }, [hand, indicator])

  /** When user selects an indicator: reset hand */
  const handleIndicatorClick = (tile: Tile) => {
    setIndicator(tile)
    setHand([])
    setShowSolutions(false)
    onHandChange?.([])
  }

  const handleTileClick = (proto: Tile) => {
    if (!indicator || hand.length >= 21) return

    const copy = ALL_TILES.find(t => {
      if (proto.type === 'falseJoker')
        return t.type === 'falseJoker' && !hand.some(h => h.id === t.id)
      if (proto.type === 'joker')
        return (
          t.type === 'regular' &&
          t.color === proto.color &&
          t.number === proto.number &&
          !hand.some(h => h.id === t.id)
        )
      return (
        t.type === proto.type &&
        t.color === proto.color &&
        t.number === proto.number &&
        !hand.some(h => h.id === t.id)
      )
    })

    if (!copy) return

    const decorated: Tile = {
      ...copy,
      type: proto.type,
      color: proto.color,
      number: proto.number
    }

    const next = [...hand, decorated]
    setHand(next)
    onHandChange?.(next)
  }

  const handleRemove = (tile: Tile) => {
    const idx = hand.findIndex(h => h.id === tile.id)
    if (idx < 0) return
    const next = [...hand.slice(0, idx), ...hand.slice(idx + 1)]
    setHand(next)
    onHandChange?.(next)
  }

  // -- render --
  if (!indicator) {
    return (
      <div>
        <h2>Select Indicator Tile</h2>
        <TileList options={indicatorOptions} onTileClick={handleIndicatorClick} />
      </div>
    )
  }

  return (
    <div>
      <h2>Indicator: {indicator.color} {indicator.number}</h2>

      <h3>Select Tiles</h3>
      <TileList options={options} onTileClick={handleTileClick} />

      <h3>Your Hand ({hand.length}/21)</h3>
      <Hand hand={hand} onRemove={handleRemove} indicator={indicator} />

      {/* Optimize button triggers the calculation */}
      <button
        onClick={handleOptimize}
        disabled={hand.length === 0}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        Optimize Hand
      </button>

      {/* Only render selector once we've computed */}
      {showSolutions && <PartitionSelector partitions={partitions} />}
    </div>
  )
}

export default HandInput
