/** Measures category deletion preparation without network or storage writes, across small lists and a large stress case. */
import type PolicyData from '@hooks/usePolicyData/types';

import {deleteWorkspaceCategories} from '@libs/actions/Policy/Category';
import * as API from '@libs/API';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';

import createRandomPolicy from '../utils/collections/policies';

const CATEGORY_COUNTS = [100, 1000, 5000, 20000];
const RUNS = 10;
const WARMUP_RUNS = 1;
const RETAINED_CATEGORY_COUNT = 19;

describe('deleteWorkspaceCategories', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    test.each(CATEGORY_COUNTS)('prepares deletion of %i categories', async (count) => {
        // Given separate deserialized category names and selection strings, as supplied by the list and stored workspace data.
        const names = Array.from({length: count}, (_, index) => `Benchmark Category ${String(index).padStart(5, '0')}`);
        const categories: PolicyCategories = Object.fromEntries(
            names.map((name) => {
                const storedName = Buffer.from(name).toString();
                return [storedName, {name: storedName, enabled: true}];
            }),
        );
        for (let index = 0; index < RETAINED_CATEGORY_COUNT; index++) {
            const name = `Retained Category ${index}`;
            categories[name] = {name, enabled: true};
        }
        const policyData: PolicyData = {
            policy: {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                requiresCategory: true,
            },
            categories,
            tags: {},
            reports: [],
            transactionsAndViolations: {},
        };
        const write = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        try {
            // When the real action prepares each deletion, exclude API persistence and discard mock history between runs.
            const result = await measureFunction(
                () => {
                    write.mockClear();
                    deleteWorkspaceCategories(policyData, names, false, undefined, undefined, CONST.DEFAULT_NUMBER_ID, false, undefined, false);
                },
                {runs: RUNS, warmupRuns: WARMUP_RUNS, writeFile: false},
            );

            // Then every measured call reaches the API boundary with the complete selection, without mutating the fixture.
            expect(write).toHaveBeenCalledTimes(1);
            expect(write.mock.calls.at(0)?.[1]).toEqual(expect.objectContaining({categories: JSON.stringify(names)}));
            expect(Object.values(categories).every((category) => category.enabled && !category.pendingAction)).toBe(true);
            process.stdout.write(
                `DeleteWorkspaceCategories count=${count} mean=${result.meanDuration.toFixed(3)}ms durations=${JSON.stringify(result.durations)} outliers=${JSON.stringify(result.outlierDurations ?? [])}\n`,
            );
        } finally {
            write.mockRestore();
        }
    });
});
