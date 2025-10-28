import React, {useCallback, useEffect, useMemo} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
// import usePrevious from '@hooks/usePrevious';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type { MultiFactorAuthenticationParamList } from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {
    // validateMagicCode,
    // validateAuthenticatorCode,
    // validateSmsOtp,
    requestValidateCodeAction,
    clearValidateCodeActionError
} from '@libs/actions/User';
import type { TranslationPaths } from '@src/languages/types';

type FallbackFactorType = 'magic-code' | 'authenticator' | 'sms-otp';

type ValidateSecurityFactorPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.FALLBACK>;

function ValidateSecurityFactorPage({route}: ValidateSecurityFactorPageProps) {
    const {translate} = useLocalize();
    const factorType = route.params.factorType;

    const [validateMagicCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    // const mfaContext = useContext(MFA cos tam)
    // const prevValidateMagicCodeAction = usePrevious(validateMagicCodeAction);

    const errorField = useMemo(() => {
        switch (factorType) {
            // TODO: reach out to the internal engineer in order to set up on backend
            // case 'magic-code':
            //     return 'validateMagicCode';
            // case 'authenticator':
            //     return 'validateAuthenticatorCode';
            // case 'sms-otp':
            //     return 'validateSmsOtp';
            default:
                return 'addedLogin'; // UNDO: this is not needed at all but for now serves as a placeholder as those errorFields above aren't implemented on backend yet
        }
    }, [factorType]);

    const validateError = getLatestErrorField(validateMagicCodeAction, errorField);

    const handleValidate = useCallback(
        (code: string) => {
            // eslint-disable-next-line default-case
            switch (factorType) {
                case 'magic-code':
                    // validateMagicCode(code); // TODO: we need to have an actual method here for validating magic code that was was send through email
                    break;
                case 'authenticator':
                    // validateAuthenticatorCode(code); // TODO: we we need to have an actual method here for validating authenticator code - idk how that works
                    break;
                case 'sms-otp':
                    // validateSmsOtp(code); // TODO: we need to have an actual method here for validating magic code that was was send through sms
                    break;
            }
        },
        [factorType],
    );

    const sendCode = useCallback(() => {
        // ?dla magic code'u i SMS-OTP wysyłamy kod a dla authenticatora nie ma wysyłania?
        if (factorType === 'authenticator') {
            return;
        }
        requestValidateCodeAction();
    }, [factorType]);

    const {description} = useMemo(() => {
        // eslint-disable-next-line default-case
        switch (factorType) {
            case 'magic-code':
                return {
                    description: 'multiFactorAuthentication.biometrics.fallbackPageMagicCodeContent',
                };
            case 'authenticator':
                return {
                    description: 'multiFactorAuthentication.biometrics.fallbackPage2FAContent',
                };
            case 'sms-otp':
                return {
                    description: 'multiFactorAuthentication.biometrics.fallbackPageSMSotpContent',
                };
        }
    }, [factorType]);


    // TODO: potrzebna jest jaka
    useEffect(() => {
        // if (!validateMagicCodeAction?.actionVerified) {
        //     return;
        // }

        // if (prevValidateMagicCodeAction?.actionVerified) {
        //     return;
        // }
        
        clearValidateCodeActionError(errorField);
        
        // if (mfaContext?.nextFactor) {
        //     Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION.FALLBACK.getRoute(mfaContext.nextFactor));
        // } else if (mfaContext?.targetRoute) {
        //     Navigation.navigate(mfaContext.targetRoute);
        // }
    }, [
        // validateMagicCodeAction?.actionVerified,
        // prevValidateMagicCodeAction?.actionVerified,
        // mfaContext?.nextFactor,
        // mfaContext?.targetRoute,
        errorField,
    ]);

    return (
        <ValidateCodeActionContent
            title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
            sendValidateCode={sendCode}
            descriptionPrimary={translate(description as TranslationPaths)}
            validateCodeActionErrorField={errorField}
            validateError={validateError}
            handleSubmitForm={handleValidate}
            clearError={() => {
                clearValidateCodeActionError(errorField);
            }}
            onClose={() => {
                clearValidateCodeActionError(errorField);
                // jakies anulowanie procesu mfa by sie chyba przydało
                Navigation.dismissModal();
            }}
        />
    );
}

ValidateSecurityFactorPage.displayName = 'ValidateSecurityFactorPage';

export default ValidateSecurityFactorPage;

export type {FallbackFactorType};