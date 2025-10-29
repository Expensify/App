/* eslint-disable default-case */
import React, {useCallback, useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {
    validateMagicCode, // TODO: ni mo
    resendValidateCode,
    // clearValidateCodeActionError
} from '@libs/actions/User';
import { clearAccountMessages } from '@libs/actions/Session';
function MFAFactorMagicCodePage() {
    const {translate} = useLocalize();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const [validateMagicCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const prevValidateMagicCodeAction = usePrevious(validateMagicCodeAction);

    const clearError = useCallback(() => {
        if (!account?.errors) {
            return;
        }
        clearAccountMessages();
    }, [account?.errors]);

    useEffect(() => {
        const isVerified = validateMagicCodeAction?.pendingFields?.actionVerified === null;
        const wasVerified = prevValidateMagicCodeAction?.pendingFields?.actionVerified === null;

        if (!isVerified || wasVerified) {
            return;
        }

        // clearValidateCodeActionError('validateMagicCode');

        // TODO: jakas nawigacja w zaleznosci od tego co sie tutaj wydarzy albo nawigacja w samym handleSubmiteForm po poprawnej walidacji ale sam nie wiem - musze zobaczyc context
        // if (mfaContext?.nextFactor) {
        //     Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_FALLBACK.getRoute(mfaContext.nextFactor));
        // } else if (mfaContext?.targetRoute) {
        //     Navigation.navigate(mfaContext.targetRoute);
        // } else {
        //     Navigation.dismissModal();
        // }
        
        Navigation.dismissModal();
    }, [
        validateMagicCodeAction?.pendingFields?.actionVerified,
        prevValidateMagicCodeAction?.pendingFields?.actionVerified,
    ]);

    return (
        <ValidateCodeActionContent
            title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
            sendValidateCode={() => resendValidateCode('jakub.kalinski+1@smwansion.com')}
            descriptionPrimary={translate('multiFactorAuthentication.biometrics.fallbackPageMagicCodeContent')}
            validateCodeActionErrorField='validateMagicCode'
            handleSubmitForm={() => validateMagicCode()} // TODO: ni mom pojencia co robia - jakies wysylanie info do contextu
            clearError={clearError}
            onClose={() => {
                clearAccountMessages();
                // TODO: jakies info zwrotne do contextu
                Navigation.dismissModal();
            }}
        />
    );
}

MFAFactorMagicCodePage.displayName = 'MFAFactorMagicCodePage';

export default MFAFactorMagicCodePage;