import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import getSubstepValues from '@pages/EnablePayments/Wallet/utils/getSubstepValues';

import {clearWalletAdditionalDetailsErrors, updatePersonalDetails} from '@userActions/Wallet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useEffect, useRef} from 'react';

import getWalletPersonalDetailsParams from './getWalletPersonalDetailsParams';
import WalletMagicCodePrompt from './WalletMagicCodePrompt';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;

/**
 * Dedicated screen for entering the magic code that authorizes a wallet phone-number change. Living on its own route
 * (rather than being rendered inline in the step page) keeps the code form stably mounted, so a wrong-code error is
 * not wiped by a remount while the submission response settles.
 */
function WalletConfirmMagicCodePage() {
    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [walletAdditionalDetailsDraft] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
    const [formData] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS);

    // The submitted details live in the form draft, so rebuild them here and submit together with the entered code.
    const values = getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails);
    const personalDetails = getWalletPersonalDetailsParams(values);

    const confirm = (validateCode: string) => {
        updatePersonalDetails({...personalDetails, validateCode});
    };

    useEffect(
        () => () => {
            clearWalletAdditionalDetailsErrors();
        },
        [],
    );

    const hasErrors = !!walletAdditionalDetails?.errorCode || !isEmptyObject(walletAdditionalDetails?.errors);

    const wasLoading = useRef(false);
    useEffect(() => {
        if (formData?.isLoading) {
            wasLoading.current = true;
            return;
        }
        // Once a submission finishes cleanly the code was accepted, so advance to the identity-verification step;
        // EnablePaymentsPage corrects the URL if the real next step differs (e.g. KBA questions). Any error (incorrect
        // code, SSN, or a generic failure) keeps the screen open to retry.
        if (wasLoading.current && !hasErrors) {
            wasLoading.current = false;
            Navigation.navigate(ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute({page: CONST.ENABLE_PAYMENTS.PAGE_NAMES.VERIFY_IDENTITY}));
        }
        wasLoading.current = false;
    }, [formData?.isLoading, hasErrors]);

    return (
        <WalletMagicCodePrompt
            onConfirm={confirm}
            onClose={() => Navigation.goBack()}
        />
    );
}

WalletConfirmMagicCodePage.displayName = 'WalletConfirmMagicCodePage';

export default WalletConfirmMagicCodePage;
