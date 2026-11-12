import RenameLegacySageIntacctExportDate from '@libs/migrations/RenameLegacySageIntacctExportDate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function buildIntacctPolicy(id: number, exportDate: string): Policy {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- legacy export dates are outside the declared union, which is what the migration fixes
    return {
        ...createRandomPolicy(id),
        connections: {intacct: {config: {export: {exportDate, exporter: 'admin@example.com'}}}},
    } as Policy;
}

describe('RenameLegacySageIntacctExportDate', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it.each([
        ['EXPORTED', CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_EXPORTED],
        ['SUBMITTED', CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_SUBMITTED],
    ])('rewrites a cached legacy %s export date to %s', async (legacyValue, expected) => {
        // Given a policy cached before the backend migrated its Sage Intacct export date
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, buildIntacctPolicy(1, legacyValue));

        // When the migration runs at startup
        await RenameLegacySageIntacctExportDate();
        await waitForBatchedUpdates();

        // Then the export date matches a picker row, and the rest of the export config is untouched
        const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}1`);
        expect(policy?.connections?.intacct?.config?.export?.exportDate).toBe(expected);
        expect(policy?.connections?.intacct?.config?.export?.exporter).toBe('admin@example.com');
    });

    it('leaves current values and policies without Sage Intacct alone', async () => {
        // Given one policy already on a current value and one with no Sage Intacct connection
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, buildIntacctPolicy(1, CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE));
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}2`, createRandomPolicy(2));

        // When the migration runs
        await RenameLegacySageIntacctExportDate();
        await waitForBatchedUpdates();

        // Then neither policy gains or changes an export date
        const currentPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}1`);
        const otherPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}2`);
        expect(currentPolicy?.connections?.intacct?.config?.export?.exportDate).toBe(CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE);
        expect(otherPolicy?.connections?.intacct).toBeUndefined();
    });
});
