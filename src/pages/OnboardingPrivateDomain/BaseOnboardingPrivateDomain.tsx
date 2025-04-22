import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {resendValidateCode, validateUserAndGetAccessiblePolicies} from '@libs/actions/Session';
import Navigation from '@libs/Navigation/Navigation';
import {isCurrentUserValidated} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingPrivateDomainProps} from './types';

function BaseOnboardingPrivateDomain({shouldUseNativeStyles, route}: BaseOnboardingPrivateDomainProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const {shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    const isValidated = isCurrentUserValidated(loginList);

    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);

    const email = session?.email ?? '';
    const domain = email.split('@').at(1) ?? '';

    const sendValidateCode = useCallback(() => {
        if (!credentials?.login) {
            return;
        }
        resendValidateCode(credentials.login);
    }, [credentials?.login]);

    useEffect(() => {
        if (!isValidated) {
            sendValidateCode();
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute());
    }, [sendValidateCode, isValidated]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingPrivateDomain"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={40}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text style={styles.textHeadlineH1}>{translate('onboarding.peopleYouMayKnow')}</Text>
                <Text style={[styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workspaceYouMayJoin', {domain, email})}</Text>
                <ValidateCodeForm
                    handleSubmitForm={(code) => {
                        validateUserAndGetAccessiblePolicies(code);
                        return Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute(route.params?.backTo));
                    }}
                    validateCodeActionErrorField="getAccessiblePolicies"
                    sendValidateCode={sendValidateCode}
                    clearError={() => {}}
                    hideSubmitButton
                />
                <View style={[styles.flex2, styles.justifyContentEnd]}>
                    <Button
                        isDisabled={isOffline}
                        success={false}
                        large
                        style={[styles.mb5]}
                        text={translate('common.skip')}
                        isLoading={isValidateCodeFormSubmitting}
                        onPress={() => Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo))}
                    />
                    {shouldUseNarrowLayout && <OfflineIndicator />}
                </View>
            </View>
        </ScreenWrapper>
    );
}

BaseOnboardingPrivateDomain.displayName = 'BaseOnboardingPrivateDomain';

export default BaseOnboardingPrivateDomain;
