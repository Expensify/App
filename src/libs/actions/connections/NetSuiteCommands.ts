import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

type SubsidiaryParam = {
    subsidiaryID: string;
    subsidiary: string;
};

function updateNetSuiteSubsidiary(policyID: string, newSubsidiary: SubsidiaryParam, oldSubsidiary: SubsidiaryParam) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    pendingFields: {
                                        subsidiary: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: oldSubsidiary.subsidiary,
                                    subsidiaryID: oldSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
    };

    const params = {
        policyID,
        ...newSubsidiary,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_SUBSIDIARY, params, onyxData);
}

// We'll have more API calls in upcoming PRs
// eslint-disable-next-line import/prefer-default-export
export {updateNetSuiteSubsidiary};
