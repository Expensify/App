import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType, Report, ReportAction} from '@src/types/onyx';
import type {OriginalMessageJoinPolicyChangeLog} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/PolicyMember', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('acceptJoinRequest', () => {
        it('Accept user join request to a workspace', () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeReport: Report = {
                ...createRandomReport(0),
                policyID: fakePolicy.id,
            };
            const fakeReportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
            } as ReportAction;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
                    })
                    .then(() => {
                        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`, {
                            [fakeReportAction.reportActionID]: fakeReportAction,
                        });
                    })
                    .then(() => {
                        Policy.acceptJoinRequest(fakeReport.reportID, fakeReportAction);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActions) => {
                                        Onyx.disconnect(connectionID);

                                        const reportAction = reportActions?.[fakeReportAction.reportActionID];

                                        if (!isEmptyObject(reportAction)) {
                                            expect((reportAction.originalMessage as OriginalMessageJoinPolicyChangeLog['originalMessage'])?.choice)?.toBe(
                                                CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT,
                                            );
                                            expect(reportAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActions) => {
                                        Onyx.disconnect(connectionID);

                                        const reportAction = reportActions?.[fakeReportAction.reportActionID];

                                        if (!isEmptyObject(reportAction)) {
                                            expect(reportAction?.pendingAction).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });
    describe('updateWorkspaceMembersRole', () => {
        it('Update member to admin role', () => {
            const fakeUser2 = createPersonalDetails(2);
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0),
                employeeList: {
                    [fakeUser2.login ?? '']: {
                        email: fakeUser2.login,
                        role: CONST.POLICY.ROLE.USER,
                    },
                },
            };

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {[fakeUser2.accountID]: fakeUser2});
                    })
                    .then(() => {
                        Policy.updateWorkspaceMembersRole(fakePolicy.id, [fakeUser2.accountID], CONST.POLICY.ROLE.ADMIN);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const employee = policy?.employeeList?.[fakeUser2?.login ?? ''];
                                        expect(employee?.role).toBe(CONST.POLICY.ROLE.ADMIN);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const employee = policy?.employeeList?.[fakeUser2?.login ?? ''];
                                        expect(employee?.pendingAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });
    describe('requestWorkspaceOwnerChange', () => {
        it('Change the workspace`s owner', () => {
            const fakePolicy: PolicyType = createRandomPolicy(0);
            const fakeEmail = 'fake@gmail.com';
            const fakeAccountID = 1;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.merge(ONYXKEYS.SESSION, {email: fakeEmail, accountID: fakeAccountID});
                    })
                    .then(() => {
                        Policy.requestWorkspaceOwnerChange(fakePolicy.id);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.errorFields).toBeFalsy();
                                        expect(policy?.isLoading).toBeTruthy();
                                        expect(policy?.isChangeOwnerSuccessful).toBeFalsy();
                                        expect(policy?.isChangeOwnerFailed).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.isLoading).toBeFalsy();
                                        expect(policy?.isChangeOwnerSuccessful).toBeTruthy();
                                        expect(policy?.isChangeOwnerFailed)?.toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });
    describe('addBillingCardAndRequestPolicyOwnerChange', () => {
        it('Add billing card and change the workspace`s owner', () => {
            const fakePolicy: PolicyType = createRandomPolicy(0);
            const fakeEmail = 'fake@gmail.com';
            const fakeCard = {
                cardNumber: '1234567890123456',
                cardYear: '2023',
                cardMonth: '05',
                cardCVV: '123',
                addressName: 'John Doe',
                addressZip: '12345',
                currency: 'USD',
            };
            const fakeAccountID = 1;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.merge(ONYXKEYS.SESSION, {email: fakeEmail, accountID: fakeAccountID});
                    })
                    .then(() => {
                        Policy.addBillingCardAndRequestPolicyOwnerChange(fakePolicy.id, fakeCard);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.errorFields).toBeFalsy();
                                        expect(policy?.isLoading).toBeTruthy();
                                        expect(policy?.isChangeOwnerSuccessful).toBeFalsy();
                                        expect(policy?.isChangeOwnerFailed).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.isLoading).toBeFalsy();
                                        expect(policy?.isChangeOwnerSuccessful).toBeTruthy();
                                        expect(policy?.isChangeOwnerFailed)?.toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });
});
