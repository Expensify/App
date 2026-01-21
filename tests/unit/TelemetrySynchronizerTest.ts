import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';
import {getActivePolicies} from '@libs/PolicyUtils';
import '@libs/telemetry/TelemetrySynchronizer';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session, TryNewDot} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@sentry/react-native', () => ({
    setTag: jest.fn(),
    setContext: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getActivePolicies: jest.fn(),
}));

jest.mock('@libs/telemetry/sendMemoryContext', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
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
            (getActivePolicies as jest.Mock).mockReturnValue(mockActivePolicies);
        });

        it('should call Sentry.setTag and Sentry.setContext when all required data is available', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: mockActivePolicyID,
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });

            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_ACTIVE_POLICY, mockActivePolicyID);
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
            const sessionWithoutEmail: Session = {
                accountID: 1,
            } as Session;

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
            (getActivePolicies as jest.Mock).mockReturnValue(customActivePolicies);

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

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_NUDGE_MIGRATION_COHORT, 'cohort_A');
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
                (getActivePolicies as jest.Mock).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: mockSession,
                    [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'policy123');
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_ACTIVE_POLICY, 'policy123');
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
                (getActivePolicies as jest.Mock).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

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
                (getActivePolicies as jest.Mock).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

                await Onyx.multiSet({
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                    [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.SESSION, mockSession);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_ACTIVE_POLICY, 'policy123');
                expect(Sentry.setContext).toHaveBeenCalled();
            });

            it('should not call sendPoliciesContext when session.email is missing', async () => {
                const sessionWithoutEmail: Session = {
                    accountID: 1,
                } as Session;
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
                (getActivePolicies as jest.Mock).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: mockSession,
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: 'policy123',
                });
                await waitForBatchedUpdatesWithAct();

                jest.clearAllMocks();

                await Onyx.set(ONYXKEYS.COLLECTION.POLICY, mockPolicies);
                await waitForBatchedUpdatesWithAct();

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_ACTIVE_POLICY, 'policy123');
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

                expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_NUDGE_MIGRATION_COHORT, 'cohort_B');
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
            (getActivePolicies as jest.Mock).mockReturnValue(mockActivePolicies);

            await Onyx.set(ONYXKEYS.SESSION, mockSession);
            await waitForBatchedUpdatesWithAct();

            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, mockActivePolicyID);
            await waitForBatchedUpdatesWithAct();

            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, mockPolicies);
            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_ACTIVE_POLICY, mockActivePolicyID);
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
            (getActivePolicies as jest.Mock).mockReturnValue([mockPolicies[`${ONYXKEYS.COLLECTION.POLICY}123`]]);

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: '123',
                [ONYXKEYS.COLLECTION.POLICY]: mockPolicies,
            });

            await waitForBatchedUpdatesWithAct();

            expect(Sentry.setTag).toHaveBeenCalledWith(CONST.TELEMETRY.TAG_ACTIVE_POLICY, '123');
            expect(Sentry.setContext).toHaveBeenCalledWith(
                CONST.TELEMETRY.CONTEXT_POLICIES,
                expect.objectContaining({
                    activePolicyID: '123',
                    activePolicies: expect.any(Array) as unknown as string[],
                }),
            );
        });
    });
});
