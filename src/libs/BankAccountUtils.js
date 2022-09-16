import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import DateUtils from './DateUtils';
import * as Localize from './Localize';
import _ from 'underscore';

/**
 * Helper method to build the Onyx data required during setup of a Verified Business Bank Account
 *
 * @returns {Object}
 */
// We'll remove the below once this function is used by the VBBA commands that are yet to be implemented
function getVBBADataForOnyx() {
    return {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('paymentsPage.addBankAccountFailure'),
                    },
                },
            },
        ],
    };
}

function getOnfidoSDKTokenFromACHData(achData) {
    const sdkToken = _.get(achData, ['verifications', 'externalApiResponses', 'requestorIdentityOnfido', 'apiResult', 'sdkToken']);
    return sdkToken ? sdkToken : achData.sdkToken;
}

export default {
    getVBBADataForOnyx,
    getOnfidoSDKTokenFromACHData,
};
