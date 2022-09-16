import _ from 'underscore';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import DateUtils from './DateUtils';
import * as Localize from './Localize';

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

/**
 * Helper method to get the onfido sdk token from the bank account's achdata
 *
 * @param {Object} achData
 * @returns {string}
 */
function getOnfidoSDKTokenFromACHData(achData) {
    const sdkToken = _.get(achData, ['verifications', 'externalApiResponses', 'requestorIdentityOnfido', 'apiResult', 'sdkToken'], '');
    return sdkToken || _.get(achData, ['sdkToken'], '');
}

export default {
    getVBBADataForOnyx,
    getOnfidoSDKTokenFromACHData,
};
