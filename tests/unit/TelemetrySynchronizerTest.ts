import {getActivePolicies} from '@libs/PolicyUtils';
import {getGlobalSpanAttributes} from '@libs/telemetry/globalSpanAttributes';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import '@libs/telemetry/TelemetrySynchronizer';

import type {Policy, Session, TryNewDot} from '@src/types/onyx';

import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@sentry/react-native', () => ({
    setTag: jest.fn(),
    setContext: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getActivePolicies: jest.fn(),
}));

jest.mock('@libs/telemetry/sendMemoryContext', () => ({
    __esModule: true,
    default: jest.fn(),
    initializeMemoryTracking: jest.fn(),
    cleanupMemoryTracking: jest.fn(),
}));

Onyx.init({keys: ONYXKEYS});

describe('TelemetrySynchronizer', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('sendPoliciesContext', () => {
        const mockSession: Session = {
            email: 'test@example.com',
            accountID: 1,
        };

        const mockActivePolicyID = '123';

        const mockPolicies: Record<string, Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
            [`${ONYXKEYS.COLLECTION.POLICY}456`]: createRandomPolicy(456),
        };

        const mockActivePolicies = [mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`], mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}456`]];

        beforeEach(() => {
            jest.clearAllMocks();
            jest.mocked(getActivePolicies).mockReturnValue(mockActivePolicies);
        });

        it('should call Sentry.setTag and Sentry.setContext when all required data is available', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: mockActivePolicyID,
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });

            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, mockActivePolicyID);
            expect(Sentry.setContext).toHaveBeenCalledWith(CONST.TELEMETRY.CONTEXT_POLICIES, {
                activePolicyID: mockActivePolicyID,
                activePolicies: expect.arrayContaining(['123', '456']),
            });
            expect(getActivePolicies).toHaveBeenCalled();
        });

        it('should not call Sentry methods when policies are missing', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: mockActivePolicyID,
                [ONYXKEYS.COLLECTION.POLICY]: null,
            });
            await waitForBatchedUpdatesWithAct();

            jest.clearAllMocks();

            expect(Sentry.setTag).toHaveBeenCalledTimes(0);
            expect(Sentry.setContext).toHaveBeenCalledTimes(0);
        });

        it('should not call Sentry methods when session.email is missing', async () => {
            const sessionWithoutEmail = {
                accountID: 1,
            };

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: sessionWithoutEmail,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: mockActivePolicyID,
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });
            await waitForBatchedUpdatesWithAct();

            jest.clearAllMocks();

            expect(Sentry.setTag).toHaveBeenCalledTimes(0);
            expect(Sentry.setContext).toHaveBeenCalledTimes(0);
        });

        it('should not call Sentry methods when activePolicyID is missing', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: null,
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });
            await waitForBatchedUpdatesWithAct();

            jest.clearAllMocks();

            expect(Sentry.setTag).toHaveBeenCalledTimes(0);
            expect(Sentry.setContext).toHaveBeenCalledTimes(0);
        });

        it('should correctly map active policies using getActivePolicies', async () => {
            const customActivePolicies = [createRandomPolicy(999)];
            jest.mocked(getActivePolicies).mockReturnValue(customActivePolicies);

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: '999',
                [ONYXKEYS.COLLECTION.POLICY]: {
                    [`${ONYXKEYS.COLLECTION.POLICY}999`]: createRandomPolicy(999),
                },
            });

            await waitForBatchedUpdatesWithAct();

            expect(getActivePolicies).toHaveBeenCalled();
            expect(Sentry.setContext).toHaveBeenCalledWith(
                CONST.TELEMETRY.CONTEXT_POLICIES,
                expect.objectContaining({
                    activePolicies: ['999'],
                }),
            );
        });

        it('should include both activePolicyID and activePolicies array in context', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: mockActivePolicyID,
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });

            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setContext).toHaveBeenCalledWith(CONST.TELEMETRY.CONTEXT_POLICIES, {
                activePolicyID: mockActivePolicyID,
                activePolicies: expect.arrayContaining([expect.any(String)]),
            });
        });
    });

    describe('sendTryNewDotCohortTag', () => {
        it('should call Sentry.setTag when cohort exists', async () => {
            const mockTryNewDot: TryNewDot = {
                nudgeMigration: {
                    timestamp: new Date(),
                    cohort: 'cohort_A',
                },
            };

            await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, mockTryNewDot);
            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.NUDGE_MIGRATION_COHORT, 'cohort_A');
        });

        it('should not call Sentry.setTag when cohort is missing', async () => {
            const mockTryNewDot: TryNewDot = {
                nudgeMigration: {
                    timestamp: new Date(),
                },
            };

            await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, mockTryNewDot);
            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).not.toHaveBeenCalled();
        });

        it('should not call Sentry.setTag when tryNewDot is null', async () => {
            await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, null);
            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).not.toHaveBeenCalled();
        });

        it('should not call Sentry.setTag when nudgeMigration is missing', async () => {
            const mockTryNewDot: TryNewDot = {};

            await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, mockTryNewDot);
            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).not.toHaveBeenCalled();
        });
    });

    describe('raw count span attributes', () => {
        it('should register reports_count_raw when the report collection changes', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: 'test@example.com', accountID: 1});
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createRandomReport(1),
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: createRandomReport(2),
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: createRandomReport(3),
            });
            await waitForBatchedUpdatesWithAct();

            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_REPORTS_COUNT_RAW]).toBe(3);
        });

        it('should register personal_details_count_raw when the personal details list changes', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: 'test@example.com', accountID: 1});
            const personalDetails = Object.fromEntries([1, 2].map((accountID) => [accountID, {accountID}]));
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdatesWithAct();

            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_PERSONAL_DETAILS_COUNT_RAW]).toBe(2);
        });

        it('should register transactions_count_raw when the transaction collection changes', async () => {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}1`]: createRandomTransaction(1),
                [`${ONYXKEYS.COLLECTION.TRANSACTION}2`]: createRandomTransaction(2),
            });
            await waitForBatchedUpdatesWithAct();

            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_TRANSACTIONS_COUNT_RAW]).toBe(2);
        });

        it('should register policies_count_raw with the active policies count', async () => {
            const mockSession: Session = {
                email: 'test@example.com',
                accountID: 1,
            };
            const mockPolicies: Record<string, Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                [`${ONYXKEYS.COLLECTION.POLICY}456`]: createRandomPolicy(456),
            };
            jest.mocked(getActivePolicies).mockReturnValue(Object.values(mockPolicies));

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: '123',
            });
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, mockPolicies);
            await waitForBatchedUpdatesWithAct();

            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_POLICIES_COUNT_RAW]).toBe(2);
        });

        it('clears the span attributes on sign-out without touching the Sentry tags', async () => {
            const mockSession: Session = {
                email: 'test@example.com',
                accountID: 1,
            };
            const mockPolicies: Record<string, Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                [`${ONYXKEYS.COLLECTION.POLICY}456`]: createRandomPolicy(456),
            };
            jest.mocked(getActivePolicies).mockReturnValue(Object.values(mockPolicies));

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: '123',
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });
            await waitForBatchedUpdatesWithAct();
            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_POLICIES_COUNT_RAW]).toBe(2);
            jest.clearAllMocks();

            // A session without an email is how sign-out arrives before Onyx.clear wipes the key entirely.
            await Onyx.set(ONYXKEYS.SESSION, {accountID: 1});
            await waitForBatchedUpdatesWithAct();

            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_POLICIES_COUNT_RAW]).toBeUndefined();
            expect(Sentry.setTag).not.toHaveBeenCalled();
            expect(Sentry.setContext).not.toHaveBeenCalled();
        });

        it('clears the span attributes when switching directly between accounts', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: 'first@example.com', accountID: 1});
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createRandomReport(1),
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: createRandomReport(2),
            });
            await waitForBatchedUpdatesWithAct();
            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_REPORTS_COUNT_RAW]).toBe(2);

            await Onyx.set(ONYXKEYS.SESSION, {email: 'second@example.com', accountID: 2});
            await waitForBatchedUpdatesWithAct();

            expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_REPORTS_COUNT_RAW]).toBeUndefined();
        });
    });

    describe('Onyx callbacks', () => {
        describe('NVP_ACTIVE_POLICY_ID callback', () => {
            it('should call sendPoliciesContext when value is set', async () => {
                const mockSession: Session = {
                    email: 'test@example.com',
                    accountID: 1,
                };
                const mockPolicies: Record<string, Policy> = {
                    [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                };
                jest.mocked(getActivePolicies).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: mockSession,
                    [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'policy123');
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, 'policy123');
                expect(Sentry.setContext).toHaveBeenCalled();
            });

            it('should not call sendPoliciesContext when value is null', async () => {
                const mockSession: Session = {
                    email: 'test@example.com',
                    accountID: 1,
                };
                const mockPolicies: Record<string, Policy> = {
                    [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                };
                jest.mocked(getActivePolicies).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: mockSession,
                    [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, null);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).not.toHaveBeenCalled();
                expect(Sentry.setContext).not.toHaveBeenCalled();
            });
        });

        describe('SESSION callback', () => {
            it('should call sendPoliciesContext when session with email is set', async () => {
                const mockSession: Session = {
                    email: 'test@example.com',
                    accountID: 1,
                };
                const mockPolicies: Record<string, Policy> = {
                    [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                };
                jest.mocked(getActivePolicies).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

                // The policy callback caches the collection only for an active session.
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: mockSession,
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                    [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token'});
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, 'policy123');
                expect(Sentry.setContext).toHaveBeenCalled();
            });

            it('should not call sendPoliciesContext when session.email is missing', async () => {
                const sessionWithoutEmail = {
                    accountID: 1,
                };
                const mockPolicies: Record<string, Policy> = {
                    [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                };

                await Onyx.multiSet({
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                    [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.SESSION, sessionWithoutEmail);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).not.toHaveBeenCalled();
                expect(Sentry.setContext).not.toHaveBeenCalled();
            });

            it('should not call sendPoliciesContext when session is null', async () => {
                const mockPolicies: Record<string, Policy> = {
                    [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                };

                await Onyx.multiSet({
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                    [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.SESSION, null);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).not.toHaveBeenCalled();
                expect(Sentry.setContext).not.toHaveBeenCalled();
            });
        });

        describe('COLLECTION.POLICY callback', () => {
            it('should call sendPoliciesContext when policies collection is set', async () => {
                const mockSession: Session = {
                    email: 'test@example.com',
                    accountID: 1,
                };
                const mockPolicies: Record<string, Policy> = {
                    [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
                };
                jest.mocked(getActivePolicies).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: mockSession,
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.COLLECTION.POLICY, mockPolicies);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, 'policy123');
                expect(Sentry.setContext).toHaveBeenCalled();
            });

            it('should not call sendPoliciesContext when policies is null', async () => {
                const mockSession: Session = {
                    email: 'test@example.com',
                    accountID: 1,
                };

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: mockSession,
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.COLLECTION.POLICY, null);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).not.toHaveBeenCalled();
                expect(Sentry.setContext).not.toHaveBeenCalled();
            });
        });

        describe('NVP_TRY_NEW_DOT callback', () => {
            it('should call sendTryNewDotCohortTag when value is set', async () => {
                const mockTryNewDot: TryNewDot = {
                    nudgeMigration: {
                        timestamp: new Date(),
                        cohort: 'cohort_B',
                    },
                };

                await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, mockTryNewDot);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.NUDGE_MIGRATION_COHORT, 'cohort_B');
            });
        });
    });

    describe('Integration tests', () => {
        it('should call sendPoliciesContext with correct data when all required Onyx keys are set', async () => {
            const mockSession: Session = {
                email: 'test@example.com',
                accountID: 1,
            };
            const mockActivePolicyID = '789';
            const mockPolicies: Record<string, Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}789`]: createRandomPolicy(789),
                [`${ONYXKEYS.COLLECTION.POLICY}101`]: createRandomPolicy(101),
            };
            const mockActivePolicies = [mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}789`]];
            jest.mocked(getActivePolicies).mockReturnValue(mockActivePolicies);

            await Onyx.set(ONYXKEYS.SESSION, mockSession);
            await waitForBatchedUpdatesWithAct();

            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, mockActivePolicyID);
            await waitForBatchedUpdatesWithAct();

            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, mockPolicies);
            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, mockActivePolicyID);
            expect(Sentry.setContext).toHaveBeenCalledWith(CONST.TELEMETRY.CONTEXT_POLICIES, {
                activePolicyID: mockActivePolicyID,
                activePolicies: ['789'],
            });
            expect(getActivePolicies).toHaveBeenCalled();
        });

        it('should verify Sentry methods are called with correct CONST values', async () => {
            const mockSession: Session = {
                email: 'test@example.com',
                accountID: 1,
            };
            const mockPolicies: Record<string, Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}123`]: createRandomPolicy(123),
            };
            jest.mocked(getActivePolicies).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: '123',
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });

            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, '123');
            const contextCall = jest.mocked(Sentry.setContext).mock.calls.at(-1);
            expect(contextCall?.[0]).toBe(CONST.TELEMETRY.CONTEXT_POLICIES);
            expect(contextCall?.[1]).toEqual(expect.objectContaining({activePolicyID: '123'}));
            expect(contextCall?.[1]?.activePolicies).toEqual(expect.any(Array));
        });
    });
});
