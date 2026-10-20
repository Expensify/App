import {updateMergeATSFilters} from '@libs/actions/connections/merge/ATS';
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
});
