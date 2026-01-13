import React, {useCallback, useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearContactMethodErrors, clearUnvalidatedNewContactMethodAction, requestValidateCodeAction, validateSecondaryLogin} from '@libs/actions/User';
import {getEarliestErrorField, getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type VerifyAccountPageBaseProps = {navigateBackTo?: Route; navigateForwardTo?: Route; handleClose?: () => void};

/**
 * This is a base page as RHP for account verification. The back & forward url logic should be handled on per case basis in higher component.
 */
function VerifyAccountPageBase({navigateBackTo, navigateForwardTo, handleClose}: VerifyAccountPageBaseProps) {
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    // sometimes primaryLogin can be empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const contactMethod = (account?.primaryLogin || currentUserPersonalDetails.email) ?? '';
    const {translate, formatPhoneNumber} = useLocalize();
    const loginData = loginList?.[contactMethod];
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const isUserValidated = account?.validated ?? false;

    useEffect(() => () => clearUnvalidatedNewContactMethodAction(), []);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            validateSecondaryLogin(currentUserPersonalDetails, loginList, contactMethod, validateCode, formatPhoneNumber, true);
        },
        [currentUserPersonalDetails, loginList, contactMethod, formatPhoneNumber],
    );

    const handleCloseWithFallback = useCallback(() => {
        if (handleClose) {
            handleClose();
            return;
        }
        Navigation.goBack(navigateBackTo);
    }, [handleClose, navigateBackTo]);

    // Handle navigation once the user is validated
    useEffect(() => {
        if (!isUserValidated) {
            return;
        }
        if (navigateForwardTo) {
            Navigation.navigate(navigateForwardTo, {forceReplace: true});
        } else {
            handleCloseWithFallback();
        }
    }, [isUserValidated, navigateForwardTo, handleCloseWithFallback, handleClose]);

    // Once user is validated or the modal is dismissed, we don't want to show empty content.
    if (isUserValidated) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID="VerifyAccountPageBase"
            >
                <HeaderWithBackButton
                    title={translate('contacts.validateAccount')}
                    onBackButtonPress={handleCloseWithFallback}
                />
                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            </ScreenWrapper>
        );
    }

    return (
        <ValidateCodeActionContent
            title={translate('contacts.validateAccount')}
            descriptionPrimary={translate('contacts.featureRequiresValidate')}
            descriptionSecondary={translate('contacts.enterMagicCode', contactMethod)}
            sendValidateCode={requestValidateCodeAction}
            validateCodeActionErrorField="validateLogin"
            validatePendingAction={loginData?.pendingFields?.validateCodeSent}
            handleSubmitForm={handleSubmitForm}
            validateError={!isEmptyObject(validateLoginError) ? validateLoginError : getLatestErrorField(loginData, 'validateCodeSent')}
            clearError={() => clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent')}
            onClose={handleCloseWithFallback}
        />
    );
}

export default VerifyAccountPageBase;
