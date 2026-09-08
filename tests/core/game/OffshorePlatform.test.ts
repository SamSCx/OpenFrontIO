import { describe, expect, it } from "vitest";
import {
  OFFSHORE_PLATFORM_COAST_RANGE,
  OffshorePlatformPlacementFailure,
  validateOffshorePlatformPlacement,
} from "../../../src/core/game/OffshorePlatform";

const placement = (
  overrides: Partial<
    Parameters<typeof validateOffshorePlatformPlacement>[0]
  > = {},
) =>
  validateOffshorePlatformPlacement({
    target: 42,
    isWater: () => true,
    ownedShoreTiles: [36],
    platformTiles: new Set(),
    manhattanDist: (a, b) => Math.abs(a - b),
    ...overrides,
  });

describe("validateOffshorePlatformPlacement", () => {
  it("accepts water within range of the builder's coast", () => {
    expect(placement()).toEqual({ valid: true });
  });

  it("rejects land", () => {
    expect(placement({ isWater: () => false })).toEqual({
      valid: false,
      reason: OffshorePlatformPlacementFailure.NotWater,
    });
  });

  it("rejects water beyond the owned-coast deployment range", () => {
    expect(placement({ ownedShoreTiles: [0] })).toEqual({
      valid: false,
      reason: OffshorePlatformPlacementFailure.TooFarFromOwnedCoast,
    });
  });

  it("rejects an occupied platform tile", () => {
    expect(placement({ platformTiles: new Set([42]) })).toEqual({
      valid: false,
      reason: OffshorePlatformPlacementFailure.Occupied,
    });
  });

  it("uses the documented coast range unless a mode overrides it", () => {
    expect(OFFSHORE_PLATFORM_COAST_RANGE).toBe(6);
    expect(placement({ ownedShoreTiles: [0], coastRange: 42 })).toEqual({
      valid: true,
    });
  });
});
