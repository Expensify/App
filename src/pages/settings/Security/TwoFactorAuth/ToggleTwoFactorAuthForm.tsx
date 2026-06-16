import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import type {Ref} from 'react';
import React from 'react';
import TwoFactorAuthForm from '@components/TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from '@components/TwoFactorAuthForm/types';
import useOnyx from '@hooks/useOnyx';
import AccountUtils from '@libs/AccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {clearAccountMessages, toggleTwoFactorAuth, validateTwoFactorAuth} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

type BaseTwoFactorAuthFormProps = {
    // Set this to true in order to call the validateTwoFactorAuth action which is used when setting up 2FA for the first time.
    // Set this to false in order to disable 2FA when a valid code is entered.
    validateInsteadOfDisable?: boolean;

    /** Callback that is called when the text input is focused */
    onFocus?: () => void;

    /** Whether the form should autofocus on mobile devices */
    shouldAutoFocusOnMobile?: boolean;

    /** Reference to the outer element */
    ref: Ref<BaseTwoFactorAuthFormRef>;
};

function ToggleTwoFactorAuthForm({validateInsteadOfDisable, onFocus, shouldAutoFocusOnMobile = true, ref}: BaseTwoFactorAuthFormProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const shouldKeepTwoFactorAuthFlowOpen = AccountUtils.isForced2FAOnboardingSetup(account, hasCompletedGuidedSetupFlow);
    const shouldClearData = (account?.needsTwoFactorAuthSetup ?? false) && !shouldKeepTwoFactorAuthFlowOpen;
    const shouldAllowRecoveryCode = validateInsteadOfDisable === false;

    /**
     * Handle text input and clear formError upon text change
     */
    const clearAccountErrorsIfPresent = () => {
        if (!account?.errors) {
            return;
        }
        clearAccountMessages();
    };

    const handleSubmit = (code: string) => {
        if (validateInsteadOfDisable !== false) {
            validateTwoFactorAuth(code, shouldClearData, {shouldKeepTwoFactorAuthFlowOpen});
            return;
        }
        toggleTwoFactorAuth(false, code);
    };

    const errorMessage = getLatestErrorMessage(account);

    return (
        <TwoFactorAuthForm
            ref={ref}
            shouldAllowRecoveryCode={shouldAllowRecoveryCode}
            onSubmit={handleSubmit}
            onInputChange={clearAccountErrorsIfPresent}
            errorMessage={errorMessage}
            shouldAutoFocus={shouldAutoFocusOnMobile}
            onFocus={onFocus}
        />
    );
}

export default ToggleTwoFactorAuthForm;
