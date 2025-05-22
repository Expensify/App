import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {openOldDotLink} from '@libs/actions/Link';
import {setOnboardingErrorMessage, setOnboardingMergeAccountStepValue, updateOnboardingValuesAndNavigation} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {MergeIntoAccountAndLogin} from '@userActions/Session';
import {resendValidateCode} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingWorkEmailValidationProps} from './types';

function BaseOnboardingWorkEmailValidation({shouldUseNativeStyles}: BaseOnboardingWorkEmailValidationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [onboardingEmail] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {canBeMissing: true});
    const workEmail = onboardingEmail?.onboardingWorkEmail;

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE, {canBeMissing: true});
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (onboardingValues?.isMergeAccountStepCompleted === undefined) {
            return;
        }
        setOnboardingErrorMessage('');
        if (onboardingValues?.shouldRedirectToClassicAfterMerge) {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
            return;
        }
        // Once we verify that shouldValidate is false, we need to force replace the screen
        // so that we don't navigate back on back button press
        if (isVsb) {
            Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(), {forceReplace: true});
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
    }, [onboardingValues, isVsb, isFocused]);

    const sendValidateCode = useCallback(() => {
        if (!credentials?.login) {
            return;
        }
        resendValidateCode(credentials.login);
    }, [credentials?.login]);

    const validateAccountAndMerge = useCallback(
        (validateCode: string) => {
            setOnboardingErrorMessage('');
            MergeIntoAccountAndLogin(workEmail, validateCode, session?.accountID);
        },
        [workEmail, session?.accountID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingWorkEmailValidation"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton={!onboardingValues?.isMergingAccountBlocked}
                progressBarPercentage={15}
                onBackButtonPress={() => {
                    updateOnboardingValuesAndNavigation(onboardingValues);
                }}
            />
            {onboardingValues?.isMergingAccountBlocked ? (
                <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <BlockingView
                        icon={Illustrations.ToddBehindCloud}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={translate('onboarding.mergeBlockScreen.title')}
                        subtitle={translate('onboarding.mergeBlockScreen.subtitle', {workEmail})}
                        subtitleStyle={[styles.colorMuted]}
                    />
                    <Button
                        success={onboardingValues?.isMergingAccountBlocked}
                        large
                        style={[styles.mb5]}
                        text={translate('common.buttonConfirm')}
                        onPress={() => {
                            setOnboardingErrorMessage('');
                            if (isVsb) {
                                Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
                                return;
                            }
                            Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute());
                        }}
                    />
                </View>
            ) : (
                <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.workEmailValidation.title')}</Text>
                    <Text style={[styles.textNormal, styles.colorMuted, styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workEmailValidation.magicCodeSent', {workEmail})}</Text>
                    <ValidateCodeForm
                        handleSubmitForm={validateAccountAndMerge}
                        sendValidateCode={sendValidateCode}
                        validateCodeActionErrorField="mergeIntoAccountAndLogIn"
                        clearError={() => setOnboardingErrorMessage('')}
                        buttonStyles={[styles.flex2, styles.justifyContentEnd, styles.mb5]}
                        shouldShowSkipButton
                        handleSkipButtonPress={() => {
                            setOnboardingErrorMessage('');
                            setOnboardingMergeAccountStepValue(true);
                            // Once we skip the private email step, we need to force replace the screen
                            // so that we don't navigate back on back button press
                            if (isVsb) {
                                Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(), {forceReplace: true});
                                return;
                            }
                            Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
                        }}
                        isLoading={isValidateCodeFormSubmitting}
                        validateError={onboardingErrorMessage ? {invalidCodeError: onboardingErrorMessage} : undefined}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

BaseOnboardingWorkEmailValidation.displayName = 'BaseOnboardingWorkEmailValidation';

export default BaseOnboardingWorkEmailValidation;
