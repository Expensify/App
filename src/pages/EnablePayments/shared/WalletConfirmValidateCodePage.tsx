import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import getSubstepValues from '@pages/EnablePayments/Wallet/utils/getSubstepValues';

import {clearWalletAdditionalDetailsErrors, updatePersonalDetails} from '@userActions/Wallet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useEffect, useRef} from 'react';

import getWalletPersonalDetailsParams from './getWalletPersonalDetailsParams';
import WalletValidateCodePrompt from './WalletValidateCodePrompt';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;

type WalletConfirmValidateCodePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE | typeof SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE
>;

/**
 * Dedicated screen for entering the validateCode that authorizes a wallet phone-number change. Living on its own route
 * (rather than being rendered inline in the step page) keeps the code form stably mounted, so a wrong-code error is
 * not wiped by a remount while the submission response settles.
 */
function WalletConfirmValidateCodePage({route}: WalletConfirmValidateCodePageProps) {
    // The dynamic route is opened on top of the IOU pay flow, which must stay the only flow on screen
    const isPayFlow = route.name === SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE.path, isPayFlow);
    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [walletAdditionalDetailsDraft] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
    const [formData] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS);

    // The submitted details live in the form draft, so rebuild them here and submit together with the entered code.
    const values = getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails);
    const personalDetails = getWalletPersonalDetailsParams(values);

    const confirm = (validateCode: string) => {
        updatePersonalDetails({...personalDetails, validateCode});
    };

    // Tracked via ref because the unmount cleanup below runs with a stale closure ([] deps).
    const errorCodeRef = useRef(walletAdditionalDetails?.errorCode);
    useEffect(() => {
        errorCodeRef.current = walletAdditionalDetails?.errorCode;
    });

    useEffect(
        () => () => {
            clearWalletAdditionalDetailsErrors(errorCodeRef.current);
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
            // The pay flow page underneath already renders the next step from userWallet.currentStep, so return to it.
            // Opening the Settings wallet page on top would mount a second Onfido instance behind the visible one.
            if (isPayFlow) {
                Navigation.goBack(backPath);
            } else {
                Navigation.navigate(ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute({page: CONST.ENABLE_PAYMENTS.PAGE_NAMES.VERIFY_IDENTITY}));
            }
        }
        wasLoading.current = false;
    }, [formData?.isLoading, hasErrors, isPayFlow, backPath]);

    return (
        <WalletValidateCodePrompt
            onConfirm={confirm}
            onClose={() => Navigation.goBack(isPayFlow ? backPath : undefined)}
        />
    );
}

WalletConfirmValidateCodePage.displayName = 'WalletConfirmValidateCodePage';

export default WalletConfirmValidateCodePage;
