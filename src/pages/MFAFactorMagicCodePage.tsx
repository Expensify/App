/* eslint-disable default-case */
import React, {useCallback, useEffect, useMemo} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {
    validateMagicCode, // TODO: ni mo
    validateSmsOtp, // TODO: ni mo
    requestValidateCodeAction,
    clearValidateCodeActionError
} from '@libs/actions/User';
import type {TranslationPaths} from '@src/languages/types';

type FallbackFactorType = 'magic-code' | 'sms-otp';


function MFAFactorMagicCodePage() {
    const {translate} = useLocalize();

    const [validateMagicCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const prevValidateMagicCodeAction = usePrevious(validateMagicCodeAction);

    const errorField = useMemo(() => {
        switch (factorType) {
            case 'magic-code':
                return 'validateMagicCode';
            case 'sms-otp':
                return 'validateSmsOtp';
        }
    }, [factorType]);

    const validateError = getLatestErrorField(validateMagicCodeAction, errorField);

    const handleValidate = useCallback(
        (code: string) => {
            switch (factorType) {
                case 'magic-code':
                    validateMagicCode(code); // TODO: ni mo
                    break;
                case 'sms-otp':
                    validateSmsOtp(code); // TODO: ni mo
                    break;
            }
        },
        [factorType],
    );

    const sendCode = useCallback(() => {
        requestValidateCodeAction();
    }, []);

    // const {description} = useMemo(() => {
    //     switch (factorType) {
    //         case 'magic-code':
    //             return {
    //                 description: 'multiFactorAuthentication.biometrics.fallbackPageMagicCodeContent',
    //             };
    //         case 'sms-otp':
    //             return {
    //                 description: 'multiFactorAuthentication.biometrics.fallbackPageSMSotpContent',
    //             };
    //     }
    // }, [factorType]);

    useEffect(() => {
        const isVerified = validateMagicCodeAction?.pendingFields?.actionVerified === null;
        const wasVerified = prevValidateMagicCodeAction?.pendingFields?.actionVerified === null;

        if (!isVerified || wasVerified) {
            return;
        }

        clearValidateCodeActionError('validateMagicCode');

        // TODO: jakas nawigacja w zaleznosci od tego co sie tutaj wydarzy albo nawigacja w samym handleSubmiteForm po poprawnej walidacji ale sam nie wiem - musze zobaczy context i backendowe endpointy
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
        errorField,
    ]);

    return (
        <ValidateCodeActionContent
            title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
            sendValidateCode={sendCode}
            descriptionPrimary={translate('multiFactorAuthentication.biometrics.fallbackPageMagicCodeContent')}
            validateCodeActionErrorField='validateMagicCode'
            validateError={validateError}
            handleSubmitForm={handleValidate}
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

export type {FallbackFactorType};