import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import * as ErrorUtils from '@libs/ErrorUtils';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

function updateNetSuiteSubsidiary(policyID: string, subsidiaryName: string, oldSubsidiaryName: string) {
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
                                    subsidiary: subsidiaryName,
                                    pendingFields: {
                                        subsidiary:  CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                                    },
                                    errorFields: {
                                        subsidiary: null
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
                                    subsidiary: subsidiaryName,
                                    errorFields: {
                                        subsidiary: null
                                    },
                                    pendingFields: {
                                        subsidiary: null
                                    }
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
                                    subsidiary: oldSubsidiaryName,
                                    errorFields: {
                                        subsidiary: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')
                                    },
                                    pendingFields: {
                                        subsidiary: null
                                    }
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
        subsidiaryName,
    };
    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_SUBSIDIARY, params, onyxData);
}

export default updateNetSuiteSubsidiary;
