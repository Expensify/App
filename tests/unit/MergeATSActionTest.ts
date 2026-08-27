import {setMergeATSInitialSyncModalShown, updateMergeATSApproverField, updateMergeATSFilters} from '@libs/actions/connections/merge/ATS';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeATSFilters} from '@src/types/onyx/Policy';

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

describe('MergeATSActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('updateMergeATSFilters', () => {
        it('writes the new filters with optimistic, success, and failure data', () => {
            // Given a policy with candidate filters already set
            const currentFilters: MergeATSFilters = {tags: ['oldTag'], stages: ['oldStage'], offices: ['oldOffice']};
            const filters: MergeATSFilters = {tags: ['tag1', 'tag2'], stages: ['stage1'], offices: ['office1']};

            // When the filters are updated
            updateMergeATSFilters(policyID, filters, currentFilters);

            // Then the API is called with the stringified filters, and every dimension is rolled back on failure
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_ATS_FILTERS,
                {policyID, filters: JSON.stringify(filters)},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            filters,
                                            pendingFields: {filters: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            errorFields: {filters: null},
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
                                            pendingFields: {filters: null},
                                            errorFields: {filters: null},
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
                                            filters: currentFilters,
                                            pendingFields: {filters: null},
                                            errorFields: {filters: error},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('clears the dimensions that are missing from the new filters', () => {
            // Given a policy that has no filters set yet
            const filters: MergeATSFilters = {stages: ['stage1']};

            // When the filters are updated with only one dimension selected
            updateMergeATSFilters(policyID, filters);

            // Then the unselected dimensions are optimistically nulled out, and the whole selection is nulled out on failure
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_ATS_FILTERS,
                {policyID, filters: JSON.stringify(filters)},
                expect.objectContaining({
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            filters: {tags: null, stages: ['stage1'], offices: null},
                                            pendingFields: {filters: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            errorFields: {filters: null},
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
                                            filters: null,
                                            pendingFields: {filters: null},
                                            errorFields: {filters: error},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                }),
            );
        });
    });

    describe('updateMergeATSApproverField', () => {
        it('writes the new approver field with optimistic, success, and failure data', () => {
            // Given a connection whose default approver is read from an ATS field
            const currentApproverField = 'oldField';

            // When the approver field is updated
            updateMergeATSApproverField(policyID, 'newField', currentApproverField);

            // Then the API is called with the new field, and the previous one is restored on failure
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_ATS_APPROVER_FIELD,
                {policyID, approverField: 'newField'},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            approverField: 'newField',
                                            pendingFields: {approverField: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            errorFields: {approverField: null},
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
                                            pendingFields: {approverField: null},
                                            errorFields: {approverField: null},
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
                                            approverField: currentApproverField,
                                            pendingFields: {approverField: null},
                                            errorFields: {approverField: error},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('clears the approver field when it is unset', () => {
            // Given a connection with no approver field set before
            // When the approver field is cleared
            updateMergeATSApproverField(policyID, null);

            // Then the API is called with a null approver field, and it stays null on failure
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_MERGE_ATS_APPROVER_FIELD,
                {policyID, approverField: null},
                expect.objectContaining({
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: {
                                connections: {
                                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                                        config: {
                                            approverField: null,
                                            pendingFields: {approverField: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                            errorFields: {approverField: null},
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
                                            approverField: null,
                                            pendingFields: {approverField: null},
                                            errorFields: {approverField: error},
                                        },
                                    },
                                },
                            },
                        },
                    ],
                }),
            );
        });
    });

    describe('setMergeATSInitialSyncModalShown', () => {
        it('flags the initial sync modal as shown for the policy', () => {
            // Given the initial sync modal has just been shown to the admin
            const setSpy = jest.spyOn(Onyx, 'set').mockResolvedValue(undefined);

            // When the flag is set
            setMergeATSInitialSyncModalShown(policyID);

            // Then it is stored locally for that policy, without calling the API
            expect(setSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.POLICY_MERGE_ATS_INITIAL_SYNC_MODAL_SHOWN}${policyID}`, true);
            expect(mockWrite).not.toHaveBeenCalled();
            setSpy.mockRestore();
        });
    });
});
