import {SeededRandom} from "../logic/PseudoRandomNumberGenerator.ts";
import {expect, describe, test} from "vitest";


describe('pseudoRandom pickWeightedElement', () => {
    const random = new SeededRandom(Date.now().toString());
    test("empty", () => expect(() => random.pickWeightedElement([])).toThrowError("Array cannot be empty"));
    test("negativeWeight", () => expect(() => random.pickWeightedElement([[5, 1], [-1, 6], [7, -1]])).toThrowError("All weights must be positive"));
    test("one of many", () => {
        const testData = Array.from({length: 100}).map((_, i) => ({i: i}));
        const props = testData.map(d => [d, 1] as [typeof d, number]);
        expect(random.pickWeightedElement(props)).toBeOneOf(testData)
    });
})