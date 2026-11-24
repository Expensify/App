import CONST from '@src/CONST';
import DistanceRequestUtils from '@src/libs/DistanceRequestUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const policyKey = `${ONYXKEYS.COLLECTION.POLICY}697049` as const;
const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}697049` as const;
const credentials = {
    companyID: 'synthetic-company',
    companyName: 'Synthetic Company',
    scope: 'accounting',
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Mirrors the accounting credential key sent by Auth.
    access_token: 'synthetic-secret',
};
const distanceUnitID = 'distance-697049';
const distanceRateID = 'rate-697049';
const formattedCustomUnits = createMock<Policy>({
    customUnits: {
        [distanceUnitID]: {
            customUnitID: distanceUnitID,
            name: 'Distance',
            attributes: {unit: 'mi'},
            rates: {
                [distanceRateID]: {customUnitRateID: distanceRateID, rate: 100, name: 'Default Rate'},
            },
        },
    },
}).customUnits;
const cachedPolicy = createMock<Policy>({
    id: '697049',
    name: 'Synthetic Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: 'owner@example.test',
    ownerAccountID: 42,
    outputCurrency: 'USD',
    connections: {
        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {config: {credentials}},
    },
    achAccount: {
        bankAccountID: 1,
        accountNumber: '****1234',
        routingNumber: '123456789',
        addressName: 'Synthetic Owner',
        bankName: 'Synthetic Bank',
        reimburser: 'owner@example.test',
    },
    rules: {approvalRules: []},
    employeeList: {},
    customUnits: formattedCustomUnits,
    units: {time: {enabled: true, rate: 100}},
    fieldList: {},
    areReportFieldsEnabled: true,
    requiresTag: false,
    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
});

// Auth's public policy record carries nulls for every detailed Search field so a snapshot merge removes old data.
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Auth's nonmember response has an empty role and omits member-required fields in Policy. */
const nonmemberSearchPolicy = {
    id: '697049',
    name: 'Synthetic Workspace',
    avatarURL: 'https://example.test/avatar.png',
    type: CONST.POLICY.TYPE.TEAM,
    role: '',
    autoReporting: null,
    autoReportingFrequency: null,
    approvalMode: null,
    reimbursementChoice: null,
    autoReimbursementLimit: null,
    autoReimbursement: null,
    achAccount: null,
    approver: null,
    exporter: null,
    owner: null,
    ownerAccountID: null,
    outputCurrency: null,
    rules: null,
    preventSelfApproval: null,
    preventPayoutNonReimbursableReports: null,
    harvesting: null,
    areWorkflowsEnabled: null,
    isAttendeeTrackingEnabled: null,
    employeeList: null,
    connections: null,
    taxRates: null,
} as unknown as Policy;
// Auth's nonmember response has an empty role and omits member-required fields in the full Policy type.
const publicPolicy = {
    id: '697049',
    name: 'Synthetic Workspace',
    avatarURL: 'https://example.test/avatar.png',
    type: CONST.POLICY.TYPE.TEAM,
    role: '',
} as unknown as Policy;
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

async function seedCachedFullPolicy() {
    const cachedPolicyWithTags = {...cachedPolicy, tagLists: {SecretTag: {name: 'SecretTag'}}};
    await Onyx.set(policyKey, cachedPolicyWithTags);
    await Onyx.set(
        snapshotKey,
        createMock<SearchResults>({
            search: {hash: 697049},
            data: {[policyKey]: cachedPolicyWithTags},
        }),
    );
}

async function expectPrivateSettingsRemoved() {
    await waitForBatchedUpdates();
    const policy = await getOnyxValue(policyKey);
    const snapshot = await getOnyxValue(snapshotKey);
    for (const value of [policy, snapshot?.data?.[policyKey]]) {
        expect(value).toMatchObject({
            id: '697049',
            name: 'Synthetic Workspace',
            role: '',
        });
        expect(value).not.toHaveProperty('connections');
        expect(value).not.toHaveProperty('achAccount');
        expect(value).not.toHaveProperty('rules');
        expect(value).not.toHaveProperty('employeeList');
        expect(value).not.toHaveProperty('reimbursementChoice');
        expect(value).not.toHaveProperty('owner');
        expect(value).not.toHaveProperty('ownerAccountID');
        expect(value).not.toHaveProperty('outputCurrency');
    }
}

describe('Auth nonmember policy Onyx updates', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await seedCachedFullPolicy();
    });

    it('replaces a cached full policy on page one and in SearchForTodos', async () => {
        // Given a full policy cached in both policy_ and a Search snapshot.
        // When SearchForTodos or Search merges public data, then Auth replaces the snapshot and top-level policy with its redacted response.
        await Onyx.update([
            {
                onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                key: ONYXKEYS.COLLECTION.POLICY,
                value: {[policyKey]: nonmemberSearchPolicy},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: snapshotKey,
                value: createMock<SearchResults>({
                    search: {hash: 697049},
                    data: {[policyKey]: nonmemberSearchPolicy},
                }),
            },
            {onyxMethod: Onyx.METHOD.SET, key: policyKey, value: publicPolicy},
        ]);

        // Then neither cache retains private settings or report-rendering fields absent from this response.
        await expectPrivateSettingsRemoved();
        expect((await getOnyxValue(snapshotKey))?.data?.[policyKey]).not.toHaveProperty('customUnits');
        expect((await getOnyxValue(snapshotKey))?.data?.[policyKey]).not.toHaveProperty('units');
        expect((await getOnyxValue(snapshotKey))?.data?.[policyKey]).not.toHaveProperty('fieldList');
        expect((await getOnyxValue(snapshotKey))?.data?.[policyKey]).not.toHaveProperty('areReportFieldsEnabled');
        expect((await getOnyxValue(snapshotKey))?.data?.[policyKey]).not.toHaveProperty('tagLists');
        expect((await getOnyxValue(snapshotKey))?.data?.[policyKey]).not.toHaveProperty('requiresTag');
    });

    it('clears a cached full policy when a later Search page merges into the snapshot', async () => {
        // Given a full policy cached in both policy_ and a Search snapshot before a later page arrives.
        const laterPagePolicy = {
            ...nonmemberSearchPolicy,
            customUnits: null,
            units: null,
            fieldList: null,
            areReportFieldsEnabled: null,
            tagLists: null,
            requiresTag: null,
        };
        // When Auth merges the later page, its nulls remove private and stale rendering fields from the snapshot.
        await Onyx.update([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: snapshotKey,
                value: {
                    search: {hash: 697049},
                    data: {
                        [policyKey]: laterPagePolicy,
                    },
                },
            },
            {onyxMethod: Onyx.METHOD.SET, key: policyKey, value: publicPolicy},
        ]);

        // Then the snapshot and top-level policy contain no private settings.
        await expectPrivateSettingsRemoved();
        const snapshotPolicy = (await getOnyxValue(snapshotKey))?.data?.[policyKey];
        expect(snapshotPolicy).not.toHaveProperty('customUnits');
        expect(snapshotPolicy).not.toHaveProperty('units');
        expect(snapshotPolicy).not.toHaveProperty('fieldList');
        expect(snapshotPolicy).not.toHaveProperty('areReportFieldsEnabled');
        expect(snapshotPolicy).not.toHaveProperty('tagLists');
        expect(snapshotPolicy).not.toHaveProperty('requiresTag');
    });

    it('keeps fields OpenReport supplies when the visible result needs report rendering', async () => {
        // Given a visible report whose OpenReport response supplies public policy identity and rendering fields.
        const renderPolicy = createMock<Policy>({
            ...publicPolicy,
            customUnits: formattedCustomUnits,
            units: {time: {enabled: true, rate: 100}},
            fieldList: {},
            areReportFieldsEnabled: true,
            requiresTag: false,
        });
        // When Auth sets that policy and Search snapshot after the full policy was cached.
        await Onyx.update([
            {
                onyxMethod: Onyx.METHOD.SET,
                key: snapshotKey,
                value: createMock<SearchResults>({
                    search: {hash: 697049},
                    data: {[policyKey]: renderPolicy},
                }),
            },
            {onyxMethod: Onyx.METHOD.SET, key: policyKey, value: renderPolicy},
        ]);

        // Then private settings are gone while the time and mileage fields needed to render the report remain usable.
        await expectPrivateSettingsRemoved();
        const policy = await getOnyxValue(policyKey);
        expect(policy?.customUnits?.['distance-697049']?.rates?.['rate-697049']?.rate).toBe(100);
        expect(policy?.units?.time).toEqual({enabled: true, rate: 100});
        expect(policy?.fieldList).toEqual({});
        expect(policy?.areReportFieldsEnabled).toBe(true);
        expect(policy?.requiresTag).toBe(false);
        expect(DistanceRequestUtils.getRateByCustomUnitRateID({customUnitRateID: distanceRateID, policy})?.rate).toBe(100);
    });
});
