import { TileRef } from "./GameMap";

/**
 * Placement rules for the first offshore-building feature.
 *
 * Keeping this policy independent from a concrete UnitType lets the builder
 * ship, the ghost preview, and server-side construction all use exactly the
 * same answer once those pieces are wired in. The target must be water, must
 * be close enough to a shore tile owned by the builder, and platforms may not
 * overlap or cluster on the same water tile.
 */
export const OFFSHORE_PLATFORM_COAST_RANGE = 6;

export enum OffshorePlatformPlacementFailure {
  NotWater = "not_water",
  TooFarFromOwnedCoast = "too_far_from_owned_coast",
  Occupied = "occupied",
}

export type OffshorePlatformPlacement =
  | { valid: true }
  | { valid: false; reason: OffshorePlatformPlacementFailure };

export interface OffshorePlatformPlacementInput {
  target: TileRef;
  /** Whether the target is a buildable water tile. */
  isWater: (tile: TileRef) => boolean;
  /** Shore tiles owned by the player deploying the construction ship. */
  ownedShoreTiles: readonly TileRef[];
  /** Existing platforms, including platforms still under construction. */
  platformTiles: ReadonlySet<TileRef>;
  manhattanDist: (a: TileRef, b: TileRef) => number;
  coastRange?: number;
}

/** Validates a construction-ship deployment target. */
export function validateOffshorePlatformPlacement(
  input: OffshorePlatformPlacementInput,
): OffshorePlatformPlacement {
  if (!input.isWater(input.target)) {
    return { valid: false, reason: OffshorePlatformPlacementFailure.NotWater };
  }
  if (input.platformTiles.has(input.target)) {
    return { valid: false, reason: OffshorePlatformPlacementFailure.Occupied };
  }

  const coastRange = input.coastRange ?? OFFSHORE_PLATFORM_COAST_RANGE;
  const hasOwnedCoast = input.ownedShoreTiles.some(
    (shore) => input.manhattanDist(shore, input.target) <= coastRange,
  );
  if (!hasOwnedCoast) {
    return {
      valid: false,
      reason: OffshorePlatformPlacementFailure.TooFarFromOwnedCoast,
    };
  }
  return { valid: true };
}
