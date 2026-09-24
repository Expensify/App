import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {deletePolicyDistanceRates, enablePolicyDistanceRates, setEmployeeWorkArrangement, setWorkspaceDistanceAutoUpdate} from '@libs/actions/Policy/DistanceRate';
import * as API from '@libs/API';
import {pause, resetQueue} from '@libs/Network/SequentialQueue';
import {isGovernmentRateUnmodified} from '@libs/PolicyDistanceRatesUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GovernmentMileageRate, Policy, Report, ReportActions, Transaction, TransactionViolations} from '@src/types/onyx';
import type {CustomUnit, Rate, Unit} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const translate: LocalizedTranslate = (phrase, ...parameters) => {
    if (phrase === 'workspace.people.officeBased') {
        return 'Office-based';
    }
    if (phrase === 'workspace.people.noRegularWorkspace') {
        return 'No regular workspace';
    }
    if (phrase === 'workspaceActions.updatedMemberWorkArrangement') {
        return `changed ${String(parameters[0])}'s work arrangement to ${String(parameters[1])} (previously ${String(parameters[2])})`;
    }
    return String(phrase);
};

describe('DistanceRate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    describe('deletePolicyDistanceRates', () => {
        it('should set customUnitOutOfPolicy violation only for transactions that have the deleted custom unit rate', async () => {
            const customUnitID = '5A55C2B68DDCB';
            const customUnitRateID1 = '7255CA72C7E7B';
            const customUnitRateID2 = '7255CA72C7E72';
            const transaction1: Transaction = {
                ...createRandomTransaction(1),
                comment: {
                    customUnit: {
                        customUnitID,
                        customUnitRateID: customUnitRateID1,
                    },
                },
            };
            const transaction2: Transaction = {
                ...createRandomTransaction(2),
                comment: {
                    customUnit: {
                        customUnitID,
                        customUnitRateID: customUnitRateID2,
                    },
                },
            };
            const policy: Policy = {
                ...createRandomPolicy(3),
                ...{
                    areDistanceRatesEnabled: true,
                    customUnits: {
                        [customUnitID]: {
                            attributes: {
                                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            },
                            customUnitID,
                            defaultCategory: 'Car',
                            enabled: true,
                            name: 'Distance',
                            rates: {
                                [customUnitRateID1]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID1,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 70,
                                    subRates: [],
                                },
                                [customUnitRateID2]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID2,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 71,
                                    subRates: [],
                                },
                            },
                        },
                    },
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`, transaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`, transaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            if (policy.customUnits) {
                deletePolicyDistanceRates(policy.id, policy.customUnits[customUnitID], [customUnitRateID1], [transaction1.transactionID], undefined);
            }
            await waitForBatchedUpdates();
            const transactionViolations = await new Promise<Record<string, TransactionViolations | undefined>>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
                    callback: resolve,
                });
            });

            expect(transactionViolations).toEqual({
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction1.transactionID}`]: [
                    {name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY, showInReview: true, type: CONST.VIOLATION_TYPES.VIOLATION},
                ],
            });
        });
    });

    describe('enablePolicyDistanceRates', () => {
        it('should disable all rates except the default rate when the we disable the feature', async () => {
            const customUnitID = '5A55C2B68DDCB';
            const customUnitRateID1 = '7255CA72C7E7B';
            const customUnitRateID2 = '7255CA72C7E72';
            const policy: Policy = {
                ...createRandomPolicy(3),
                ...{
                    areDistanceRatesEnabled: true,
                    customUnits: {
                        [customUnitID]: {
                            attributes: {
                                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            },
                            customUnitID,
                            defaultCategory: 'Car',
                            enabled: true,
                            name: 'Distance',
                            rates: {
                                [customUnitRateID1]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID1,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 70,
                                    subRates: [],
                                },
                                [customUnitRateID2]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID2,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 71,
                                    subRates: [],
                                },
                            },
                        },
                    },
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            if (policy.customUnits) {
                pause();
                enablePolicyDistanceRates(policy.id, false, policy.customUnits[customUnitID]);
            }
            await waitForBatchedUpdates();
            const onyxPolicy = await new Promise<Policy>((resolve) => {
                const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
                Onyx.connect({
                    key: policyKey,
                    // eslint-disable-next-line rulesdir/prefer-early-return
                    callback: (value) => {
                        if (value !== undefined) {
                            resolve(value);
                        }
                    },
                });
            });

            if (!policy?.customUnits) {
                return;
            }

            expect(onyxPolicy).toEqual({
                ...policy,
                areDistanceRatesEnabled: false,
                pendingFields: {
                    areDistanceRatesEnabled: 'update',
                },
                customUnits: {
                    [customUnitID]: {
                        ...policy.customUnits[customUnitID],
                        rates: {
                            [customUnitRateID1]: {
                                ...policy.customUnits[customUnitID].rates[customUnitRateID1],
                                enabled: true,
                            },
                            [customUnitRateID2]: {
                                ...policy.customUnits[customUnitID].rates[customUnitRateID2],
                                enabled: false,
                            },
                        },
                    },
                },
            });

            resetQueue();
        });
    });

    describe('setWorkspaceDistanceAutoUpdate', () => {
        const customUnitID = '5A55C2B68DDCB';
        const existingRateID = '7255CA72C7E7B';

        const usGovernmentRates: GovernmentMileageRate[] = [
            {sourceRateID: 'US_2025-01-01', currency: 'USD', name: '2025 United States', rate: 70, startDate: '2025-01-01', endDate: '2025-12-31', enabled: true},
            {sourceRateID: 'US_2026-01-01', currency: 'USD', name: '2026 United States', rate: 72.5, startDate: '2026-01-01', enabled: true},
        ];

        function buildPolicy(policyOverrides: Partial<Policy> = {}, unit: Unit = CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rates: CustomUnit['rates'] = {}): Policy {
            return {
                ...createRandomPolicy(4),
                areDistanceRatesEnabled: true,
                outputCurrency: 'USD',
                customUnits: {
                    [customUnitID]: {
                        attributes: {unit},
                        customUnitID,
                        enabled: true,
                        name: 'Distance',
                        rates,
                    },
                },
                ...policyOverrides,
            };
        }

        function getDistanceCustomUnit(policy: Policy): CustomUnit {
            const distanceCustomUnit = policy.customUnits?.[customUnitID];
            if (!distanceCustomUnit) {
                throw new Error('The test policy is missing its distance custom unit');
            }
            return distanceCustomUnit;
        }

        function getPolicyFromOnyx(policyID: string): Promise<Policy> {
            return new Promise<Policy>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const,
                    // eslint-disable-next-line rulesdir/prefer-early-return
                    callback: (value) => {
                        if (value !== undefined) {
                            Onyx.disconnect(connection);
                            resolve(value);
                        }
                    },
                });
            });
        }

        afterEach(() => {
            resetQueue();
            return Onyx.clear();
        });

        it('should copy every government rate for the policy currency with a snapshot that marks it auto-generated', async () => {
            const policy = buildPolicy();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy.id, getDistanceCustomUnit(policy), true, usGovernmentRates, policy.outputCurrency);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            const optimisticRates = Object.values(onyxPolicy.customUnits?.[customUnitID].rates ?? {});

            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
            expect(onyxPolicy.pendingFields?.shouldAutoUpdateGovernmentDistanceRates).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(optimisticRates).toHaveLength(2);

            const openEndedRate = optimisticRates.find((rate) => rate.attributes?.governmentRate?.sourceRateID === 'US_2026-01-01');
            expect(openEndedRate).toMatchObject({
                name: '2026 United States',
                rate: 72.5,
                currency: 'USD',
                enabled: true,
                startDate: '2026-01-01',
                attributes: {governmentRate: {sourceRateID: 'US_2026-01-01', rate: 72.5, startDate: '2026-01-01'}},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            // An open-ended rate must omit the end date on both sides, or the lightning bolt icon treats the copy as edited
            expect(openEndedRate?.endDate).toBeUndefined();
            expect(openEndedRate?.attributes?.governmentRate?.endDate).toBeUndefined();
            expect(openEndedRate).toBeDefined();
            expect(openEndedRate && isGovernmentRateUnmodified(openEndedRate)).toBe(true);

            // Each copied rate is stored under the client-generated ID sent in optimisticRateIDs
            for (const rate of optimisticRates) {
                expect(onyxPolicy.customUnits?.[customUnitID].rates[rate.customUnitRateID]).toBeDefined();
            }
        });

        it('should skip government rates the policy already has and rates loaded for another currency', async () => {
            const policy = buildPolicy({}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, {
                [existingRateID]: {
                    customUnitRateID: existingRateID,
                    name: '2025 United States',
                    rate: 70,
                    currency: 'USD',
                    enabled: true,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    attributes: {governmentRate: {sourceRateID: 'US_2025-01-01', rate: 70, startDate: '2025-01-01', endDate: '2025-12-31'}},
                },
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const canadianRate: GovernmentMileageRate = {sourceRateID: 'CA_2026-01-01', currency: 'CAD', name: '2026 Canada', rate: 73, startDate: '2026-01-01', enabled: true};

            pause();
            setWorkspaceDistanceAutoUpdate(policy.id, getDistanceCustomUnit(policy), true, [...usGovernmentRates, canadianRate], policy.outputCurrency);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            const sourceRateIDs = Object.values(onyxPolicy.customUnits?.[customUnitID].rates ?? {}).map((rate) => rate.attributes?.governmentRate?.sourceRateID);

            // US_2025-01-01 is already copied and CA_2026-01-01 is another currency, so only US_2026-01-01 is added
            expect(sourceRateIDs).toHaveLength(2);
            expect(sourceRateIDs).toContain('US_2025-01-01');
            expect(sourceRateIDs).toContain('US_2026-01-01');
            expect(sourceRateIDs).not.toContain('CA_2026-01-01');
        });

        it('should correct the distance unit when it does not match the unit the country publishes rates in', async () => {
            // A CAD policy tracking miles ends up on kilometers
            const policy = buildPolicy({outputCurrency: 'CAD'}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy.id, getDistanceCustomUnit(policy), true, [], policy.outputCurrency);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.customUnits?.[customUnitID].attributes?.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            expect(onyxPolicy.customUnits?.[customUnitID].pendingFields?.attributes).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('should leave the distance unit alone when it already matches the country', async () => {
            const policy = buildPolicy({}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy.id, getDistanceCustomUnit(policy), true, [], policy.outputCurrency);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.customUnits?.[customUnitID].attributes?.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            expect(onyxPolicy.customUnits?.[customUnitID].pendingFields?.attributes).toBeUndefined();
        });

        it('should clear the flag and keep existing government rates when disabling', async () => {
            const existingRate: Rate = {
                customUnitRateID: existingRateID,
                name: '2026 United States',
                rate: 72.5,
                currency: 'USD',
                enabled: true,
                startDate: '2026-01-01',
                attributes: {governmentRate: {sourceRateID: 'US_2026-01-01', rate: 72.5, startDate: '2026-01-01'}},
            };
            const policy = buildPolicy({shouldAutoUpdateGovernmentDistanceRates: true}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, {[existingRateID]: existingRate});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy.id, getDistanceCustomUnit(policy), false, usGovernmentRates, policy.outputCurrency);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBeUndefined();
            expect(onyxPolicy.pendingFields?.shouldAutoUpdateGovernmentDistanceRates).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            // Disabling only stops future propagation
            expect(onyxPolicy.customUnits?.[customUnitID].rates[existingRateID]).toMatchObject({rate: 72.5, startDate: '2026-01-01'});
        });
    });

    describe('setEmployeeWorkArrangement', () => {
        const member1AccountID = 11;
        const member2AccountID = 12;
        const member1Email = 'member1@test.com';
        const member2Email = 'member2@test.com';

        afterEach(() => {
            jest.restoreAllMocks();
        });

        function getPolicyFromOnyx(policyID: string): Promise<Policy> {
            return new Promise<Policy>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const,
                    // eslint-disable-next-line rulesdir/prefer-early-return
                    callback: (value) => {
                        if (value !== undefined) {
                            Onyx.disconnect(connection);
                            resolve(value);
                        }
                    },
                });
            });
        }

        function getReportActionsFromOnyx(reportID: string) {
            return new Promise<ReportActions>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const,
                    // eslint-disable-next-line rulesdir/prefer-early-return
                    callback: (value) => {
                        if (value !== undefined) {
                            Onyx.disconnect(connection);
                            resolve(value);
                        }
                    },
                });
            });
        }

        function getSingleUpdateValue(value: unknown): unknown {
            if (typeof value !== 'object' || value === null) {
                return undefined;
            }
            const values = Object.values(value);
            return values.length === 1 ? values.at(0) : undefined;
        }

        async function seedWorkArrangementPolicy(policy: Policy) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [member1AccountID]: {accountID: member1AccountID, login: member1Email, displayName: 'Member One'},
                [member2AccountID]: {accountID: member2AccountID, login: member2Email, displayName: 'Member Two'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', policyID: policy.id, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS} as Report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, {});
            await waitForBatchedUpdates();
        }

        it('should optimistically update the member and create one changelog action with pending ADD', async () => {
            // Given two members in the policy and only one needs an arrangement change
            const policy: Policy = {
                ...createRandomPolicy(20),
                employeeList: {
                    [member1Email]: {email: member1Email},
                    [member2Email]: {email: member2Email, hasOfficeWorkArrangement: true},
                },
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // When both members are assigned the office-based arrangement
            setEmployeeWorkArrangement(policy, [member1AccountID, member2AccountID], true, translate);
            await waitForBatchedUpdates();

            // Then only the changed member and one pending changelog entry are updated
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
            // Member2 already matches, so it is skipped without any optimistic footprint
            expect(onyxPolicy.employeeList?.[member2Email]).toEqual({email: member2Email, hasOfficeWorkArrangement: true});

            const reportActions = await getReportActionsFromOnyx('1');
            const actions = Object.values(reportActions);
            expect(actions).toHaveLength(1);
            expect(actions.at(0)).toMatchObject({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MEMBER_WORK_ARRANGEMENT,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                message: [
                    {
                        text: translate(
                            'workspaceActions.updatedMemberWorkArrangement',
                            'Member One',
                            translate('workspace.people.officeBased'),
                            translate('workspace.people.noRegularWorkspace'),
                        ),
                    },
                ],
                originalMessage: {accountID: member1AccountID, email: member1Email, name: 'Member One', newValue: true, oldValue: false},
            });

            resetQueue();
        });

        it('should do nothing when every member already matches the requested arrangement', async () => {
            // Given all eligible members already have the requested arrangement
            const policy: Policy = {
                ...createRandomPolicy(21),
                employeeList: {[member1Email]: {email: member1Email, hasOfficeWorkArrangement: false}},
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // When the matching member and an unknown account are passed
            setEmployeeWorkArrangement(policy, [member1AccountID, 999999001], false, translate);
            await waitForBatchedUpdates();

            // Then no member data or changelog entry is changed
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: false});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });

        it('should clear pending states on success', async () => {
            // Given the member and admins room are in Onyx
            const policy: Policy = {
                ...createRandomPolicy(22),
                employeeList: {[member1Email]: {email: member1Email}},
            };
            await seedWorkArrangementPolicy(policy);
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // When the member's work arrangement is updated
            setEmployeeWorkArrangement(policy, [member1AccountID], true, translate);

            // Then success updates clear the pending state for both the member and changelog action
            const onyxData = writeSpy.mock.calls.at(0)?.[2];
            expect(onyxData?.successData?.[0]).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {employeeList: {[member1Email]: {pendingAction: null}}},
            });
            expect(getSingleUpdateValue(onyxData?.successData?.[1]?.value)).toEqual({pendingAction: null});
        });

        it('should revert the member and drop the changelog entry on failure', async () => {
            // Given the member and admins room are in Onyx
            const policy: Policy = {
                ...createRandomPolicy(23),
                employeeList: {[member1Email]: {email: member1Email}},
            };
            await seedWorkArrangementPolicy(policy);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- The API spy captures the action updates without sending a request.
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // When the member's work arrangement is updated
            setEmployeeWorkArrangement(policy, [member1AccountID], true, translate);

            // Then failure data restores the member value, clears its pending state, and removes the changelog action
            const onyxData = writeSpy.mock.calls.at(0)?.[2];
            expect(onyxData?.failureData?.[0]).toMatchObject({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    employeeList: {
                        [member1Email]: {
                            email: member1Email,
                            pendingAction: null,
                        },
                    },
                },
            });
            const failureValue = onyxData?.failureData?.[0]?.value;
            const failureEmployeeList = typeof failureValue === 'object' && failureValue !== null && 'employeeList' in failureValue ? failureValue.employeeList : undefined;
            const failureMember =
                typeof failureEmployeeList === 'object' && failureEmployeeList !== null && member1Email in failureEmployeeList ? failureEmployeeList[member1Email] : undefined;
            expect(typeof failureMember === 'object' && failureMember !== null && 'errors' in failureMember && failureMember.errors).toBeTruthy();
            expect(onyxData?.failureData?.[1]).toMatchObject({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`,
            });
            expect(getSingleUpdateValue(onyxData?.failureData?.[1]?.value)).toBeNull();
        });

        it('should update members without changelog actions when there is no admins room', async () => {
            // Given the member is in the policy but the admins room is unavailable
            const policy: Policy = {
                ...createRandomPolicy(24),
                employeeList: {[member1Email]: {email: member1Email}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [member1AccountID]: {accountID: member1AccountID, login: member1Email, displayName: 'Member One'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, {});
            await waitForBatchedUpdates();

            pause();
            // When the member's work arrangement is updated
            setEmployeeWorkArrangement(policy, [member1AccountID], true, translate);
            await waitForBatchedUpdates();

            // Then the member is updated without creating a changelog action
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toMatchObject({email: member1Email, hasOfficeWorkArrangement: true});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });

        it('should skip members missing from the employee list', async () => {
            // Given one account is missing from the policy employee list
            const missingMemberAccountID = 999999002;
            const policy: Policy = {
                ...createRandomPolicy(25),
                employeeList: {[member1Email]: {email: member1Email, hasOfficeWorkArrangement: false}},
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // The missing account has personal details but no employeeList entry
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [member1AccountID]: {accountID: member1AccountID, login: member1Email, displayName: 'Member One'},
                [missingMemberAccountID]: {accountID: missingMemberAccountID, login: 'ghost@test.com', displayName: 'Ghost'},
            });
            await waitForBatchedUpdates();
            // When the member missing from the policy employee list is passed
            setEmployeeWorkArrangement(policy, [missingMemberAccountID], true, translate);
            await waitForBatchedUpdates();

            // Then no member data or changelog action is created
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: false});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });

        it('should do nothing without a policy ID', async () => {
            // Given a valid member and a policy without an ID
            const policy: Policy = {
                ...createRandomPolicy(26),
                employeeList: {[member1Email]: {email: member1Email, hasOfficeWorkArrangement: false}},
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // When the member is assigned an arrangement without a policy ID
            setEmployeeWorkArrangement({...policy, id: ''}, [member1AccountID], true, translate);
            await waitForBatchedUpdates();

            // Then neither the policy nor the admins room changelog is changed
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: false});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });
    });
});
