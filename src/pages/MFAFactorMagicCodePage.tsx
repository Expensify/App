/* eslint-disable default-case */
import React, {useCallback, useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {
    validateMagicCode, // TODO: ni mo
    requestValidateCodeAction,
    clearValidateCodeActionError
} from '@libs/actions/User';

function MFAFactorMagicCodePage() {
    const {translate} = useLocalize();

    const [validateMagicCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const prevValidateMagicCodeAction = usePrevious(validateMagicCodeAction);

    const validateError = getLatestErrorField(validateMagicCodeAction, 'validateMagicCode');

    const sendCode = useCallback(() => {
        requestValidateCodeAction();
    }, []);

    useEffect(() => {
        const isVerified = validateMagicCodeAction?.pendingFields?.actionVerified === null;
        const wasVerified = prevValidateMagicCodeAction?.pendingFields?.actionVerified === null;

        if (!isVerified || wasVerified) {
            return;
        }

        clearValidateCodeActionError('validateMagicCode');

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
            sendValidateCode={sendCode}
            descriptionPrimary={translate('multiFactorAuthentication.biometrics.fallbackPageMagicCodeContent')}
            validateCodeActionErrorField='validateMagicCode'
            validateError={validateError}
            handleSubmitForm={() => validateMagicCode()} // TODO: ni mo
            clearError={() => {
                clearValidateCodeActionError('validateMagicCode');
            }}
            onClose={() => {
                clearValidateCodeActionError('validateMagicCode');
                // TODO: jakies info zwrotne do contextu
                Navigation.dismissModal();
            }}
        />
    );
}

MFAFactorMagicCodePage.displayName = 'MFAFactorMagicCodePage';

export default MFAFactorMagicCodePage;