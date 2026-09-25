import {setMergeInitialSyncModalShown, updateMergeApprovalMode} from '@libs/actions/connections/merge';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');

const mockErrorTimestamp = 123;

jest.mock('@libs/ErrorUtils', () => ({
    getMicroSecondOnyxErrorWithTranslationKey: () => ({[mockErrorTimestamp]: 'common.genericErrorMessage'}),
}));

const mockWrite = jest.mocked(write);
const policyID = 'policyID';
const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
const error = {[mockErrorTimestamp]: 'common.genericErrorMessage'};

describe('MergeActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('updateMergeApprovalMode', () => {
        it('sends only the approval mode when no approver fields are passed', () => {
            // Given a Merge HR connection, which saves its final approver in its own request
            // When the approval mode is updated
            updateMergeApprovalMode({
                policyID,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_HR,
                approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC,
                currentApprovalMode: CONST.MERGE.APPROVAL_MODE.CUSTOM,
            });

            // Then only the approval mode is sent
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_APPROVAL_MODE,
                {policyID, connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_HR, approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                                        config: {
                                            approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC,
                                            pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            errorFields: {approvalMode: null},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                                        config: {
                                            pendingFields: {approvalMode: null},
                                            errorFields: {approvalMode: null},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                                        config: {
                                            approvalMode: CONST.MERGE.APPROVAL_MODE.CUSTOM,
                                            pendingFields: {approvalMode: null},
                                            errorFields: {approvalMode: error},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('sends the whole approval setup for Merge ATS advanced mode', () => {
            // Given a Merge ATS connection moving to advanced mode with both an approver field and a final approver picked
            // When the approval mode is saved
            updateMergeApprovalMode({
                policyID,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS,
                approvalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED,
                currentApprovalMode: CONST.MERGE.APPROVAL_MODE.BASIC,
                approverField: CONST.MERGE.ATS_APPROVER_FIELD.RECRUITING_COORDINATOR,
                currentApproverField: CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER,
                finalApprover: 'new@example.com',
                currentFinalApprover: 'old@example.com',
            });

            // Then all three values go out in one request and each rolls back on failure, while the save is tracked
            // as one unit on approvalMode, which is what the aggregated "default approver" row reads
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_APPROVAL_MODE,
                {
                    policyID,
                    connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS,
                    approvalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED,
                    approverField: CONST.MERGE.ATS_APPROVER_FIELD.RECRUITING_COORDINATOR,
                    finalApprover: 'new@example.com',
                },
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            approvalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED,
                                            approverField: CONST.MERGE.ATS_APPROVER_FIELD.RECRUITING_COORDINATOR,
                                            finalApprover: 'new@example.com',
                                            pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            errorFields: {approvalMode: null},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            pendingFields: {approvalMode: null},
                                            errorFields: {approvalMode: null},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC,
                                            approverField: CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER,
                                            finalApprover: 'old@example.com',
                                            pendingFields: {approvalMode: null},
                                            errorFields: {approvalMode: error},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('clears the approver field out for Merge ATS basic mode', () => {
            // Given a Merge ATS connection in basic mode, which reads the approver from a single member rather than an ATS field
            // When the approval mode is saved with only a final approver
            updateMergeApprovalMode({
                policyID,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS,
                approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC,
                currentApprovalMode: undefined,
                finalApprover: 'new@example.com',
            });

            // Then the approver field is left out of the request and out of the optimistic config entirely
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_APPROVAL_MODE,
                {policyID, connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS, approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC, finalApprover: 'new@example.com'},
                expect.objectContaining({
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC,
                                            approverField: null,
                                            finalApprover: 'new@example.com',
                                            pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            errorFields: {approvalMode: null},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                }),
            );
        });

        it('sends only the approval mode for Merge ATS custom mode', () => {
            // Given a Merge ATS connection moving to custom mode, where the approval routing is set up by hand instead
            // When the approval mode is saved
            updateMergeApprovalMode({
                policyID,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS,
                approvalMode: CONST.MERGE.APPROVAL_MODE.CUSTOM,
                currentApprovalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED,
            });

            // Then neither approver field rides along
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_APPROVAL_MODE,
                {policyID, connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS, approvalMode: CONST.MERGE.APPROVAL_MODE.CUSTOM},
                expect.anything(),
            );
        });
    });

    describe('setMergeInitialSyncModalShown', () => {
        it('flags the initial sync modal as shown for the policy', () => {
            // Given the initial sync modal has just been shown to the admin
            const setSpy = jest.spyOn(Onyx, 'set').mockResolvedValue(undefined);

            // When the flag is set for the Merge ATS and HR connection
            setMergeInitialSyncModalShown(policyID, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS);
            setMergeInitialSyncModalShown(policyID, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);

            // Then it is stored locally for that policy, without calling the API
            expect(setSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.POLICY_MERGE_ATS_INITIAL_SYNC_MODAL_SHOWN}${policyID}`, true);
            expect(setSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.POLICY_MERGE_HR_INITIAL_SYNC_MODAL_SHOWN}${policyID}`, true);
            expect(mockWrite).not.toHaveBeenCalled();
            setSpy.mockRestore();
        });
    });
});
