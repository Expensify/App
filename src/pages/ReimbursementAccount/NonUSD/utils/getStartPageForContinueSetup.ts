import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';
import requiresDocusignStep from './requiresDocusignStep';

const PAGE_NAME = CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME;

/**
 * Determines which page the user should start on when continuing a NonUSD bank account setup.
 * Maps progress state (achData) to the correct page name to resume from.
 */
function getStartPageForContinueSetup(
    achData: ACHDataReimbursementAccount | undefined,
    nonUSDCountryDraftValue: string,
    policyCurrency: string | undefined,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
): string {
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
        return PAGE_NAME.BANK_INFO;
    }

    if (achData?.created && achData?.corpay?.companyName === undefined) {
        return PAGE_NAME.BUSINESS_INFO;
    }

    if (achData?.corpay?.companyName && achData?.corpay?.anyIndividualOwn25PercentOrMore === undefined) {
        return PAGE_NAME.BENEFICIAL_OWNER_INFO;
    }

    if (!isPastSignerStep()) {
        return PAGE_NAME.SIGNER_INFO;
    }

    if (isPastSignerStep() && !allAgreementsChecked) {
        return PAGE_NAME.AGREEMENTS;
    }

    if (isPastSignerStep() && allAgreementsChecked && !isDocusignStepRequired && achData?.state !== CONST.BANK_ACCOUNT.STATE.VERIFYING) {
        return PAGE_NAME.AGREEMENTS;
    }

    if (isPastSignerStep() && allAgreementsChecked && isDocusignStepRequired && achData?.state !== CONST.BANK_ACCOUNT.STATE.VERIFYING) {
        return PAGE_NAME.DOCUSIGN;
    }

    if (achData?.state === CONST.BANK_ACCOUNT.STATE.VERIFYING) {
        return PAGE_NAME.FINISH;
    }

    return PAGE_NAME.COUNTRY;
}

export default getStartPageForContinueSetup;
