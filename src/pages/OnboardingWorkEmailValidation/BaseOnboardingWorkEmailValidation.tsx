import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {openOldDotLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {MergeIntoAccountAndLogin} from '@userActions/Session';
import {resendValidateCode} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingWorkEmailValidationProps} from './types';

function BaseOnboardingWorkEmailValidation({shouldUseNativeStyles, route}: BaseOnboardingWorkEmailValidationProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [onboardingEmail] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM);
    const workEmail = onboardingEmail?.onboardingWorkEmail;

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const {shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [isMergingAccountBlocked, setIsMergingAccountBlocked] = useState(false);

    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE);
    useEffect(() => {
        if (!!onboardingErrorMessage && onboardingErrorMessage !== CONST.MERGE_ACCOUNT_INVALID_CODE_ERROR) {
            setIsMergingAccountBlocked(true);
        }
    }, [onboardingErrorMessage]);

    const sendValidateCode = useCallback(() => {
        if (!credentials?.login) {
            return;
        }
        resendValidateCode(credentials.login);
    }, [credentials?.login]);

    const validateAccountAndMerge = useCallback(
        (validateCode: string) => {
            MergeIntoAccountAndLogin(workEmail, validateCode, session?.accountID);
        },
        [workEmail, session?.accountID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingPrivateDomain"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton={!isMergingAccountBlocked}
                progressBarPercentage={40}
                onBackButtonPress={() => Navigation.goBack(ROUTES.ONBOARDING_WORK_EMAIL.getRoute())}
            />
            {isMergingAccountBlocked ? (
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
                        success={isMergingAccountBlocked}
                        large
                        style={[styles.mb5]}
                        text={translate('common.buttonConfirm')}
                        onPress={() => Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute())}
                    />
                </View>
            ) : (
                <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.workEmailValidation.title')}</Text>
                    <Text style={[styles.textNormal, styles.colorMuted, styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workEmailValidation.magicCodeSent', {workEmail})}</Text>
                    <ValidateCodeForm
                        validateCodeAction={validateCodeAction}
                        handleSubmitForm={validateAccountAndMerge}
                        sendValidateCode={sendValidateCode}
                        clearError={() => {}}
                        buttonStyles={[styles.flex2, styles.justifyContentEnd, styles.mb5]}
                        shouldShowSkipButton
                        handleSkipButtonPress={() => Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute())}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

BaseOnboardingWorkEmailValidation.displayName = 'BaseOnboardingWorkEmailValidation';

export default BaseOnboardingWorkEmailValidation;
