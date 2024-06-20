import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
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
                value: {},
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
    API.write(WRITE_COMMANDS.UPDATE_NET_SUITE_SUBSIDIARY, params, onyxData);
}

export default updateNetSuiteSubsidiary;
