import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import * as PaymentMethods from './PaymentMethods';
import * as Localize from '../Localize';

/**
 * Fetch and save locally the Onfido SDK token and applicantID
 * - The sdkToken is used to initialize the Onfido SDK client
 * - The applicantID is combined with the data returned from the Onfido SDK as we need both to create an
 *   identity check. Note: This happens in Web-Secure when we call Activate_Wallet during the OnfidoStep.
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} dob
 */
function fetchOnfidoToken(firstName, lastName, dob) {
    // Use Onyx.set() since we are resetting the Onfido flow completely.
    Onyx.set(ONYXKEYS.WALLET_ONFIDO, {loading: true});
    API.Wallet_GetOnfidoSDKToken(firstName, lastName, dob)
        .then((response) => {
            const apiResult = lodashGet(response, ['requestorIdentityOnfido', 'apiResult'], {});
            Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {
                applicantID: apiResult.applicantID,
                sdkToken: apiResult.sdkToken,
                loading: false,
                hasAcceptedPrivacyPolicy: true,
            });
        })
        .catch(() => Onyx.set(ONYXKEYS.WALLET_ONFIDO, {loading: false, error: CONST.WALLET.ERROR.UNEXPECTED}));
}

/**
 * @param {Boolean} loading whether we are making the API call to validate the user's provided personal details
 * @private
 */
function setAdditionalDetailsLoading(loading) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {loading});
}

/**
 * @param {Array} questions
 * @param {String} [idNumber]
 */
function setAdditionalDetailsQuestions(questions, idNumber) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {questions, idNumber});
}

/**
 * @param {Object} errorFields
 */
function setAdditionalDetailsErrors(errorFields) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {errorFields: null});
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {errorFields});
}

/**
 * @param {String} additionalErrorMessage
 */
function setAdditionalDetailsErrorMessage(additionalErrorMessage) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {additionalErrorMessage});
}

/**
 * @param {Boolean} shouldAskForFullSSN
 */
function setAdditionalDetailsShouldAskForFullSSN(shouldAskForFullSSN) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {shouldAskForFullSSN});
}

/**
 * @param {Boolean} shouldShowFailedKYC
 */
function setWalletShouldShowFailedKYC(shouldShowFailedKYC) {
    Onyx.merge(ONYXKEYS.USER_WALLET, {shouldShowFailedKYC});
}

/**
 * Transforms a list of Idology errors to a translated displayable error string.
 * @param {Array} idologyErrors
 * @return {String}
 */
function buildIdologyError(idologyErrors) {
    if (_.isEmpty(idologyErrors)) {
        return '';
    }
    const addressErrors = [
        'resultcode.address.does.not.match',
        'resultcode.street.name.does.not.match',
        'resultcode.street.number.does.not.match',
        'resultcode.zip.does.not.match',
        'resultcode.alternate.address.alert',
        'resultcode.state.does.not.match',
        'resultcode.input.address.is.po.box',
        'resultcode.located.address.is.po.box',
        'resultcode.warm.address.alert',
    ];
    const dobErrors = [
        'resultcode.coppa.alert',
        'resultcode.age.below.minimum',
        'resultcode.dob.does.not.match',
        'resultcode.yob.does.not.match',
        'resultcode.yob.within.one.year',
        'resultcode.mob.does.not.match',
        'resultcode.no.mob.available',
        'resultcode.no.dob.available',
        'resultcode.ssn.issued.prior.to.dob',
    ];
    const ssnErrors = [
        'resultcode.ssn.does.not.match',
        'resultcode.ssn.within.one.digit',
        'resultcode.ssn.not.valid',
        'resultcode.ssn.issued.prior.to.dob',
        'resultcode.input.ssn.is.itin',
        'resultcode.located.itin',
    ];
    const nameErrors = [
        'resultcode.last.name.does.not.match',
    ];

    // List of translated errors
    const errorsTranslated = _.uniq(_.reduce(idologyErrors, (memo, error) => {
        const your = Localize.translateLocal('common.your');
        if (_.contains(addressErrors, error)) {
            memo.push(`${your} ${Localize.translateLocal('common.personalAddress').toLowerCase()}`);
        }
        if (_.contains(dobErrors, error)) {
            memo.push(`${your} ${Localize.translateLocal('common.dob').toLowerCase()}`);
        }
        if (_.contains(ssnErrors, error)) {
            memo.push(`${your} SSN`);
        }
        if (_.contains(nameErrors, error)) {
            memo.push(`${your} ${Localize.translateLocal('additionalDetailsStep.legalLastNameLabel').toLowerCase()}`);
        }

        return memo;
    }, []));

    if (_.isEmpty(errorsTranslated)) {
        return '';
    }

    const errorStart = Localize.translateLocal('additionalDetailsStep.weCouldNotVerify');
    const errorEnd = Localize.translateLocal('additionalDetailsStep.pleaseFixIt');
    return `${errorStart} ${Localize.arrayToString(errorsTranslated)}. ${errorEnd}`;
}

/**
 * This action can be called repeatedly with different steps until an Expensify Wallet has been activated.
 *
 * Possible steps:
 *
 *     - OnfidoStep - Creates an identity check by calling Onfido's API (via Web-Secure) with data returned from the SDK
 *     - AdditionalDetailsStep - Validates a user's provided details against a series of checks
 *     - TermsStep - Ensures that a user has agreed to all of the terms and conditions
 *
 * The API will always return the updated userWallet in the response as a convenience so we can avoid calling
 * Get&returnValueList=userWallet after we call Wallet_Activate.
 *
 * @param {String} currentStep
 * @param {Object} parameters
 * @param {String} [parameters.onfidoData] - JSON string
 * @param {Object} [parameters.personalDetails]
 * @param {Object} [parameters.idologyAnswers]
 * @param {Boolean} [parameters.hasAcceptedTerms]
 */
function activateWallet(currentStep, parameters) {
    let personalDetails;
    let idologyAnswers;
    let onfidoData;
    let hasAcceptedTerms;

    if (!_.contains(CONST.WALLET.STEP, currentStep)) {
        throw new Error('Invalid currentStep passed to activateWallet()');
    }

    setWalletShouldShowFailedKYC(false);
    if (currentStep === CONST.WALLET.STEP.ONFIDO) {
        onfidoData = parameters.onfidoData;
        Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: '', loading: true});
    } else if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
        if (parameters.personalDetails) {
            setAdditionalDetailsLoading(true);
            setAdditionalDetailsErrors(null);
            setAdditionalDetailsErrorMessage('');
            personalDetails = JSON.stringify(parameters.personalDetails);
        }
        if (parameters.idologyAnswers) {
            idologyAnswers = JSON.stringify(parameters.idologyAnswers);
        }
    } else if (currentStep === CONST.WALLET.STEP.TERMS) {
        hasAcceptedTerms = parameters.hasAcceptedTerms;
        Onyx.merge(ONYXKEYS.WALLET_TERMS, {loading: true});
    }

    API.Wallet_Activate({
        currentStep,
        personalDetails,
        idologyAnswers,
        onfidoData,
        hasAcceptedTerms,
    })
        .then((response) => {
            if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                // Hide the loader
                setAdditionalDetailsLoading(false);

                // Make sure we remove any questions from Onyx once we've answered them
                setAdditionalDetailsQuestions(null);
            }

            if (response.jsonCode !== 200) {
                if (currentStep === CONST.WALLET.STEP.ONFIDO) {
                    Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {loading: false});
                    if (response.title === CONST.WALLET.ERROR.ONFIDO_FIXABLE_ERROR) {
                        Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {fixableErrors: lodashGet(response, 'data.fixableErrors', [])});
                        return;
                    }
                    setWalletShouldShowFailedKYC(true);
                    return;
                }

                if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                    if (response.title === CONST.WALLET.ERROR.KBA_NEEDED) {
                        setAdditionalDetailsQuestions(response.data.questions, response.data.idNumber);
                    }

                    if (response.title === CONST.WALLET.ERROR.MISSING_FIELD) {
                        // Convert array of strings to object with field names as keys and boolean for values (true if error, false if not)
                        const errorFields = _.has(response, ['data', 'fieldNames']) ? _.reduce(response.data.fieldNames, (errors, fieldName) => ({
                            ...errors,
                            [fieldName]: true,
                        }), {}) : {};
                        setAdditionalDetailsErrors(errorFields);
                    }

                    if (response.title === CONST.WALLET.ERROR.FULL_SSN_NOT_FOUND) {
                        setAdditionalDetailsShouldAskForFullSSN(true);
                        setAdditionalDetailsErrorMessage(Localize.translateLocal('additionalDetailsStep.needSSNFull9'));
                        return;
                    }

                    let qualifiers = lodashGet(response, 'data.requestorIdentityID.apiResult.qualifiers.qualifier', []);

                    // ExpectID sometimes returns qualifier as an object when there is only one, or as an array if there are several
                    if (qualifiers.key) {
                        qualifiers = [qualifiers];
                    }
                    const idologyErrors = _.map(qualifiers, error => error.key);

                    if (!_.isEmpty(idologyErrors)) {
                        // These errors should redirect to the KYC failure page
                        const hardFailures = [
                            'resultcode.newer.record.found',
                            'resultcode.high.risk.address.alert',
                            'resultcode.ssn.not.available',
                            'resultcode.subject.deceased',
                            'resultcode.thin.file',
                            'resultcode.pa.dob.match',
                            'resultcode.pa.dob.not.available',
                            'resultcode.pa.dob.does.not.match',
                        ];
                        if (_.some(hardFailures, hardFailure => _.contains(idologyErrors, hardFailure))) {
                            setWalletShouldShowFailedKYC(true);
                            return;
                        }

                        const identityError = buildIdologyError(idologyErrors);
                        if (identityError) {
                            setAdditionalDetailsErrorMessage(identityError);
                            return;
                        }
                    }

                    if (lodashGet(response, 'data.requestorIdentityID.apiResult.results.key') === 'result.no.match'
                        || response.title === CONST.WALLET.ERROR.WRONG_ANSWERS) {
                        setWalletShouldShowFailedKYC(true);
                        return;
                    }
                    if (Str.endsWith(response.type, 'AutoVerifyFailure')) {
                        setAdditionalDetailsErrorMessage(response.message);
                    }

                    return;
                }

                return;
            }

            const userWallet = response.userWallet;
            Onyx.merge(ONYXKEYS.USER_WALLET, userWallet)
                .then(() => {
                    if (userWallet.currentStep !== CONST.WALLET.STEP.ACTIVATE || userWallet.tierName !== CONST.WALLET.TIER_NAME.GOLD) {
                        return;
                    }

                    PaymentMethods.continueSetup();
                });
            if (currentStep === CONST.WALLET.STEP.ONFIDO) {
                Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: '', loading: true});
            } else if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                setAdditionalDetailsLoading(false);
            } else if (currentStep === CONST.WALLET.STEP.TERMS) {
                Onyx.merge(ONYXKEYS.WALLET_TERMS, {loading: false});
            }
        });
}

/**
 * Fetches information about a user's Expensify Wallet
 *
 * @typedef {Object} UserWallet
 * @property {Number} availableBalance
 * @property {Number} currentBalance
 * @property {String} currentStep - used to track which step of the "activate wallet" flow a user is in
 * @property {('SILVER'|'GOLD')} tierName - will be GOLD when fully activated. SILVER is able to recieve funds only.
 */
function fetchUserWallet() {
    API.Get({returnValueList: 'userWallet'})
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            // When refreshing the wallet, we should not show the failed KYC page anymore, as we should allow them to retry.
            Onyx.merge(ONYXKEYS.USER_WALLET, {...response.userWallet, shouldShowFailedKYC: false});
        });
}

/**
 * @param {Object} keyValuePair
 */
function updateAdditionalDetailsDraft(keyValuePair) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS_DRAFT, keyValuePair);
}

/**
 * @param {string} currentStep
 */
function updateCurrentStep(currentStep) {
    Onyx.merge(ONYXKEYS.USER_WALLET, {currentStep});
}

export {
    fetchOnfidoToken,
    activateWallet,
    fetchUserWallet,
    setAdditionalDetailsErrors,
    updateAdditionalDetailsDraft,
    setAdditionalDetailsErrorMessage,
    setAdditionalDetailsQuestions,
    buildIdologyError,
    updateCurrentStep,
};
