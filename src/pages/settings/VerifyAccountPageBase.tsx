import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearContactMethodErrors, clearUnvalidatedNewContactMethodAction, requestValidateCodeAction, validateSecondaryLogin} from '@libs/actions/User';
import {getEarliestErrorField, getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import {getAccessiblePolicies} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

type VerifyAccountPageBaseProps = {
    navigateBackTo?: Route;
    navigateForwardTo?: Route;
    handleClose?: () => void;
    /** Callback called ONLY when user successfully validates their account (not on dismiss/back) */
    onValidationSuccess?: () => void;
};

/**
 * This is a base page as RHP for account verification. The back & forward url logic should be handled on per case basis in higher component.
 */
function VerifyAccountPageBase({navigateBackTo, navigateForwardTo, handleClose, onValidationSuccess}: VerifyAccountPageBaseProps) {
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    // sometimes primaryLogin can be empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const contactMethod = (account?.primaryLogin || currentUserPersonalDetails.email) ?? '';
    const {translate} = useLocalize();
    const loginData = loginList?.[contactMethod];
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const isUserValidated = account?.validated ?? false;

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const onboardingIntent = useOnboardingIntent();
    // This page has many unrelated callers (wallet enablement, 2FA, generic contact methods). The join-workspace
    // intent's "validate your email" task is the only one of them that needs to fetch and land on the joinable
    // workspace list after validating, so that behaviour is gated on Onyx state rather than on how this page was
    // reached - a route match alone cannot tell these callers apart, since several of them can also land on
    // home/verify-account depending on which screen was active when they were opened.
    const isValidatingForJoinWorkspaceTask = onboardingIntent === CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE && hasCompletedGuidedSetupFlowSelector(onboardingValues);

    useEffect(() => () => clearUnvalidatedNewContactMethodAction(), []);

    const sendValidateCode = () => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT});

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            validateSecondaryLogin(contactMethod, validateCode);
        },
        [contactMethod],
    );

    const handleCloseWithFallback = useCallback(() => {
        if (handleClose) {
            handleClose();
            return;
        }
        Navigation.goBack(navigateBackTo);
    }, [handleClose, navigateBackTo]);

    // Handle navigation once the user is validated.
    // This transition must happen exactly once: after it runs, this page stays mounted (see the loading state below),
    // and callers commonly derive navigateForwardTo/navigateBackTo from the live navigation state (useDynamicBackPath).
    // Those props therefore change as soon as we navigate, so without this guard the effect would re-run and navigate
    // again - to the path we just landed on, nesting it into the backTo param.
    const hasNavigatedAfterValidation = useRef(false);
    useEffect(() => {
        if (!isUserValidated || hasNavigatedAfterValidation.current) {
            return;
        }
        hasNavigatedAfterValidation.current = true;

        onValidationSuccess?.();

        if (isValidatingForJoinWorkspaceTask) {
            getAccessiblePolicies();
            Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute(), {forceReplace: true});
            return;
        }

        if (navigateForwardTo) {
            Navigation.navigate(navigateForwardTo, {forceReplace: true});
        } else {
            handleCloseWithFallback();
        }
    }, [isUserValidated, navigateForwardTo, handleCloseWithFallback, handleClose, onValidationSuccess, isValidatingForJoinWorkspaceTask]);

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
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ValidateCodeActionContent
            title={translate('contacts.validateAccount')}
            descriptionPrimary={translate('contacts.featureRequiresValidate')}
            descriptionSecondary={translate('contacts.enterSecurityCode', contactMethod)}
            sendValidateCode={sendValidateCode}
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
