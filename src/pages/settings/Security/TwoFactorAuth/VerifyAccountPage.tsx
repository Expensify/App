import React, {useCallback, useEffect, useMemo} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getEarliestErrorField, getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import {quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import {clearContactMethodErrors, requestValidateCodeAction, validateSecondaryLogin} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type VerifyAccountPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();

    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const isUserValidated = account?.validated ?? false;
    const contactMethod = account?.primaryLogin ?? '';

    const loginData = useMemo(() => loginList?.[contactMethod], [loginList, contactMethod]);
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');

    const navigateForwardTo = route.params?.forwardTo;
    const backTo = route.params?.backTo;

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            validateSecondaryLogin(loginList, contactMethod, validateCode, formatPhoneNumber, true);
        },
        [loginList, contactMethod, formatPhoneNumber],
    );

    // Handle navigation once the user is validated
    useEffect(() => {
        if (!isUserValidated) {
            return;
        }

        if (navigateForwardTo) {
            Navigation.navigate(navigateForwardTo, {forceReplace: true});
        } else {
            Navigation.goBack(backTo);
        }
    }, [isUserValidated, navigateForwardTo, backTo]);

    return (
        <ValidateCodeActionContent
            title={translate('contacts.validateAccount')}
            descriptionPrimary={translate('contacts.featureRequiresValidate')}
            descriptionSecondary={translate('contacts.enterMagicCode', {contactMethod})}
            sendValidateCode={requestValidateCodeAction}
            validateCodeActionErrorField="validateLogin"
            validatePendingAction={loginData?.pendingFields?.validateCodeSent}
            handleSubmitForm={handleSubmitForm}
            validateError={!isEmptyObject(validateLoginError) ? validateLoginError : getLatestErrorField(loginData, 'validateCodeSent')}
            clearError={() => clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent')}
            onClose={quitAndNavigateBack}
        />
    );
}

VerifyAccountPage.displayName = 'CopyCodesPage';

export default VerifyAccountPage;
