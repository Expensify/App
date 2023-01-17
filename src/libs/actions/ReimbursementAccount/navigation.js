import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import * as store from './store';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import Navigation from '../../Navigation/Navigation';

const WITHDRAWAL_ACCOUNT_STEPS = [
    {
        id: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
        title: 'Bank Account',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.COMPANY,
        title: 'Company Information',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.REQUESTOR,
        title: 'Requestor Information',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
        title: 'Beneficial Owners',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.VALIDATION,
        title: 'Validate',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.ENABLE,
        title: 'Enable',
    },
];

/**
 * Get step position in the array
 * @private
 * @param {String} stepID
 * @return {Number}
 */
function getIndexByStepID(stepID) {
    return _.findIndex(WITHDRAWAL_ACCOUNT_STEPS, step => step.id === stepID);
}

/**
 * Get next step ID
 * @param {String} [stepID]
 * @return {String}
 */
function getNextStepID(stepID) {
    const nextStepIndex = Math.min(
        getIndexByStepID(stepID || store.getReimbursementAccountInSetup().currentStep) + 1,
        WITHDRAWAL_ACCOUNT_STEPS.length - 1,
    );
    return lodashGet(WITHDRAWAL_ACCOUNT_STEPS, [nextStepIndex, 'id'], CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
}

/**
 * @param {Object} achData
 * @returns {String}
 */
function getNextStepToComplete(achData) {
    if (achData.currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR && !achData.isOnfidoSetupComplete) {
        return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
    }

    return getNextStepID(achData.currentStep);
}

/**
 * Navigate to a specific step in the VBA flow
 *
 * @param {String} stepID
 * @param {Object} achData
 */
function goToWithdrawalAccountSetupStep(stepID, achData) {
    const newACHData = {...store.getReimbursementAccountInSetup()};

    // If we go back to Requestor Step, reset any validation and previously answered questions from expectID.
    if (!newACHData.useOnfido && stepID === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
        delete newACHData.questions;
        delete newACHData.answers;
    }

    // When going back to the BankAccountStep from the Company Step, show the manual form instead of Plaid
    if (newACHData.currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY && stepID === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT) {
        newACHData.subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    }

    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {...newACHData, ...achData, currentStep: stepID}});
}

/**
 * Navigate to the correct bank account route based on the bank account state and type
 */
function navigateToBankAccountRoute() {
    Navigation.navigate(ROUTES.getBankAccountRoute());
}

export {
    goToWithdrawalAccountSetupStep,
    getNextStepToComplete,
    getNextStepID,
    navigateToBankAccountRoute,
};
