import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';
import getInitialSubPageForSignerInfoStep from './getInitialSubPageForSignerInfoStep';
import requiresDocusignStep from './requiresDocusignStep';

const PAGE_NAME = CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME;
const BANK_INFO_SUB_PAGES = CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES;
const BUSINESS_INFO_SUB_PAGES = CONST.NON_USD_BANK_ACCOUNT.BUSINESS_INFO_STEP.SUB_PAGE_NAMES;
const BENEFICIAL_OWNER_INFO_SUB_PAGES = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUB_PAGE_NAMES;

type StartPageResult = {
    page: string;
    subPage?: string;
};

/**
 * Determines which page the user should start on when continuing a NonUSD bank account setup.
 * Maps progress state (achData) to the correct page name and sub-page to resume from.
 */
function getStartPageForContinueSetup(
    achData: ACHDataReimbursementAccount | undefined,
    nonUSDCountryDraftValue: string,
    policyCurrency: string | undefined,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
): StartPageResult {
    const isDocusignStepRequired = requiresDocusignStep(policyCurrency);

    const isPastSignerStep = () => {
        if (achData?.state === CONST.NON_USD_BANK_ACCOUNT.STATE.VERIFYING) {
            return true;
        }

        if (policyCurrency === CONST.CURRENCY.AUD) {
            return !!(achData?.corpay?.signerFullName && achData?.corpay?.secondSignerFullName && achData?.corpay?.authorizedToBindClientToAgreement === undefined);
        }

        return !!(achData?.corpay?.signerFullName && achData?.corpay?.authorizedToBindClientToAgreement === undefined);
    };

    const allAgreementsChecked =
        !!(reimbursementAccountDraft?.authorizedToBindClientToAgreement ?? achData?.corpay?.authorizedToBindClientToAgreement) &&
        !!(reimbursementAccountDraft?.agreeToTermsAndConditions ?? achData?.corpay?.agreeToTermsAndConditions) &&
        !!(reimbursementAccountDraft?.consentToPrivacyNotice ?? achData?.corpay?.consentToPrivacyNotice) &&
        !!(reimbursementAccountDraft?.provideTruthfulInformation ?? achData?.corpay?.provideTruthfulInformation);

    if (nonUSDCountryDraftValue !== '' && achData?.created === undefined) {
        return {page: PAGE_NAME.BANK_INFO, subPage: BANK_INFO_SUB_PAGES.BANK_ACCOUNT_DETAILS};
    }

    if (achData?.created && achData?.corpay?.companyName === undefined) {
        return {page: PAGE_NAME.BUSINESS_INFO, subPage: BUSINESS_INFO_SUB_PAGES.NAME};
    }

    if (achData?.corpay?.companyName && achData?.corpay?.anyIndividualOwn25PercentOrMore === undefined) {
        return {page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: BENEFICIAL_OWNER_INFO_SUB_PAGES.IS_USER_BENEFICIAL_OWNER};
    }

    if (!isPastSignerStep()) {
        const signerSubPage = getInitialSubPageForSignerInfoStep(achData?.corpay?.signerEmail, achData?.corpay?.signerFullName, achData?.corpay?.secondSignerEmail, policyCurrency ?? '');
        return {page: PAGE_NAME.SIGNER_INFO, subPage: signerSubPage};
    }

    if (isPastSignerStep() && !allAgreementsChecked) {
        return {page: PAGE_NAME.AGREEMENTS};
    }

    if (isPastSignerStep() && allAgreementsChecked && !isDocusignStepRequired && achData?.state !== CONST.BANK_ACCOUNT.STATE.VERIFYING) {
        return {page: PAGE_NAME.AGREEMENTS};
    }

    if (isPastSignerStep() && allAgreementsChecked && isDocusignStepRequired && achData?.state !== CONST.BANK_ACCOUNT.STATE.VERIFYING) {
        return {page: PAGE_NAME.DOCUSIGN};
    }

    if (achData?.state === CONST.BANK_ACCOUNT.STATE.VERIFYING) {
        return {page: PAGE_NAME.FINISH};
    }

    return {page: PAGE_NAME.CURRENCY_AND_COUNTRY};
}

export default getStartPageForContinueSetup;
