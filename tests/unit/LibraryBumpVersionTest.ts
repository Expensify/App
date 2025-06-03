import {circularDeepEqual, deepEqual} from 'fast-equals';
import * as LHNTestUtils from '../utils/LHNTestUtils';

describe('fast-equals smoke test with report objects', () => {
    it('returns true for identical reports', () => {
        const reportA = LHNTestUtils.getFakeReport([1, 2], 1000);
        const reportB = JSON.parse(JSON.stringify(reportA)) as typeof reportA;

        expect(deepEqual(reportA, reportB)).toBe(true);
    });

    it('returns false for different reports', () => {
        const reportA = LHNTestUtils.getFakeReport([1, 2], 1000);
        const reportB = LHNTestUtils.getFakeReport([1, 2], 2000); // different timestamp

        expect(deepEqual(reportA, reportB)).toBe(false);
    });

    it('returns false when participant list differs', () => {
        const reportA = LHNTestUtils.getFakeReport([1, 2], 1000);
        const reportB = LHNTestUtils.getFakeReport([1, 3], 1000); // different participant

        expect(deepEqual(reportA, reportB)).toBe(false);
    });
});

describe('fast-equals circularDeepEqual tests', () => {
    type Circular = {
        name: string;
        self: Circular;
    };

    function createCircularObject(name: string): Circular {
        const obj = {} as Circular;
        obj.name = name;
        obj.self = obj;
        return obj;
    }

    it('returns true for identical circular objects', () => {
        const objA = createCircularObject('Krishna');
        const objB = createCircularObject('Krishna');

        expect(circularDeepEqual(objA, objB)).toBe(true);
    });

    it('returns false when circular objects differ', () => {
        const objA = createCircularObject('Krishna');
        const objB = createCircularObject('Not Krishna');

        expect(circularDeepEqual(objA, objB)).toBe(false);
    });

    it('returns true for deeply nested circular objects', () => {
        type Nested = {
            level: number;
            nested: {
                parent: Nested;
            };
        };

        function createNested(level: number): Nested {
            const base = {} as Nested;
            const nested = {
                parent: base,
            };

            base.level = level;
            base.nested = nested;

            return base;
        }

        const objA = createNested(1);
        const objB = createNested(1);

        expect(circularDeepEqual(objA, objB)).toBe(true);
    });

    it('fails with deepEqual but passes with circularDeepEqual for circular objects', () => {
        const objA = createCircularObject('Krishna');
        const objB = createCircularObject('Krishna');

        let deepEqualThrows = false;
        try {
            deepEqual(objA, objB);
        } catch (e) {
            deepEqualThrows = true;
        }

        expect(deepEqualThrows).toBe(true);
        expect(circularDeepEqual(objA, objB)).toBe(true);
    });
});
