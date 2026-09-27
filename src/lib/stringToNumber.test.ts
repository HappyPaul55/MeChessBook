import { describe, expect, test } from "bun:test";
import stringToSemiRandomNumber from "./stringToNumber";

describe("stringToSemiRandomNumber", () => {
  test("is deterministic and stays within range", () => {
    for (const input of ["", "a", "abc", "player-1", "fixtureuser"]) {
      const first = stringToSemiRandomNumber(input, 1, 9);
      const second = stringToSemiRandomNumber(input, 1, 9);
      expect(first).toBe(second);
      expect(first).toBeGreaterThanOrEqual(1);
      expect(first).toBeLessThanOrEqual(9);
    }
  });

  test("gives different inputs different values", () => {
    const values = new Set([
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
    ].map((input) => stringToSemiRandomNumber(input, 1, 9)));
    expect(values.size).toBeGreaterThan(1);
  });
});
