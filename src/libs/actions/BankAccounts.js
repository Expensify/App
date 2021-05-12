import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function fetchBankAccountList() {
    // Note: For the moment, we are just running this to verify that we can successfully return data from the secure API
    API.Get({returnValueList: 'bankAccountList'}, true);
}

function fetchOnfidoToken() {
    API.Wallet_GetOnfidoSDKToken()
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            const apiResult = lodashGet(response, ['requestorIdentityOnfido', 'apiResult'], {});
            Onyx.merge(ONYXKEYS.ONFIDO_APPLICANT_INFO, {
                applicantID: apiResult.applicantID,
                sdkToken: apiResult.sdkToken,
            });
        });
}

function fetchUserWallet() {
    API.Get({returnValueList: 'userWallet'})
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);
        });
}

/**
 * @param {Boolean} loading
 * @param {String[]} [errorFields]
 * @param {String} [additionalErrorMessage]
 * @private
 */
function setAdditionalDetailsStep(loading, errorFields = null, additionalErrorMessage = '') {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {loading, errorFields, additionalErrorMessage});
}

/**
 *
 * @param {String} currentStep
 * @param {Object} parameters
 * @param {String} [parameters.onfidoData] - JSON string
 * @param {String} [parameters.personalDetails] - JSON string
 */
function activateWallet(currentStep, parameters) {
    if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
        setAdditionalDetailsStep(true);
    }

    API.Wallet_Activate({currentStep, ...parameters})
        .then((response) => {
            if (response.jsonCode !== 200) {
                if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                    if (response.title === CONST.WALLET.ERROR.MISSING_FIELD) {
                        setAdditionalDetailsStep(false, response.data.fieldNames);
                        return;
                    }

                    const errorTitles = [
                        CONST.WALLET.ERROR.IDENTITY_NOT_FOUND,
                        CONST.WALLET.ERROR.INVALID_SSN,
                        CONST.WALLET.ERROR.UNEXPECTED,
                        CONST.WALLET.ERROR.UNABLE_TO_VERIFY,
                    ];

                    if (errorTitles.includes(response.title)) {
                        setAdditionalDetailsStep(false, null, response.message);
                        return;
                    }

                    setAdditionalDetailsStep(false);
                    return;
                }
                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);

            if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                setAdditionalDetailsStep(false);
            }
        });
}
window.activateWallet = activateWallet;

export {
    fetchBankAccountList,
    fetchUserWallet,
    fetchOnfidoToken,
    activateWallet,
};
