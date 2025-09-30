import React, {useCallback, useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearContactMethodErrors, clearUnvalidatedNewContactMethodAction, requestValidateCodeAction, validateSecondaryLogin} from '@libs/actions/User';
import {getEarliestErrorField, getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type VerifyAccountPageBaseProps = {navigateBackTo?: Route; navigateForwardTo?: Route};

/**
 * This is a base page as RHP for account verification. The back & forward url logic should be handled on per case basis in higher component.
 */
function VerifyAccountPageBase({navigateBackTo, navigateForwardTo}: VerifyAccountPageBaseProps) {
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const contactMethod = account?.primaryLogin ?? '';
    const {translate, formatPhoneNumber} = useLocalize();
    const loginData = loginList?.[contactMethod];
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const isUserValidated = account?.validated ?? false;

    useEffect(() => () => clearUnvalidatedNewContactMethodAction(), []);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            validateSecondaryLogin(loginList, contactMethod, validateCode, formatPhoneNumber, true);
        },
        [loginList, contactMethod, formatPhoneNumber],
    );

    const handleClose = useCallback(() => {
        Navigation.goBack(navigateBackTo);
    }, [navigateBackTo]);

    // Handle navigation once the user is validated
    useEffect(() => {
        if (!isUserValidated) {
            return;
        }

        if (navigateForwardTo) {
            Navigation.navigate(navigateForwardTo, {forceReplace: true});
        } else {
            handleClose();
        }
    }, [isUserValidated, navigateForwardTo, handleClose]);

    // Once user is validated or the modal is dismissed, we don't want to show empty content.
    if (isUserValidated) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID={VerifyAccountPageBase.displayName}
            >
                <HeaderWithBackButton
                    title={translate('contacts.validateAccount')}
                    onBackButtonPress={handleClose}
                />
                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            </ScreenWrapper>
        );
    }

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
            onClose={handleClose}
        />
    );
}

VerifyAccountPageBase.displayName = 'VerifyAccountPageBase';

export default VerifyAccountPageBase;
