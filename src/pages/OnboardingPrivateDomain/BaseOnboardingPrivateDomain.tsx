import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import type { BaseOnboardingPrivateDomainProps } from './types';
import { useOnyx } from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as User from '@userActions/User';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import OfflineIndicator from '@components/OfflineIndicator';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import AccountUtils from '@libs/AccountUtils';
import Button from '@components/Button';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';


function BaseOnboardingPrivateDomain({ shouldUseNativeStyles, route }: BaseOnboardingPrivateDomainProps) {
    const { isOffline } = useNetwork();
    const styles = useThemeStyles();
    const { translate } = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const { shouldUseNarrowLayout, isSmallScreenWidth, onboardingIsMediumOrLargerScreenWidth } = useResponsiveLayout();

    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);

    const accountID = session?.accountID;
    const email = session?.email || '';
    const domain = email.split('@').at(1);

    // TODO get list of available policies and process them
    const handleSubmitForm = (submitCode: string) => {
        if (accountID) {
            User.validateUserAndGetAccessiblePolicies(submitCode).then((response) => {
                console.log(response);
            });
            // TODO only navigate if validated
            Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute(route.params?.backTo));
        }
    }

    // TODO
    const clearError = useCallback(() => {
    }, []);

    useEffect(() => {
        User.resendValidateCode(credentials?.login ?? '');
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingPrivateDomain"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={60}
                onBackButtonPress={OnboardingFlow.goBack}
            />
            <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text style={styles.textHeadlineH1}>{translate('onboarding.peopleYouMayKnow')}</Text>
                <Text style={[styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workspaceYouMayJoin', { domain: `${domain}`, email: `${email}` })}</Text>
                <ValidateCodeForm
                    validateCodeAction={validateCodeAction}
                    handleSubmitForm={handleSubmitForm}
                    clearError={clearError}
                    hideButton={true}
                />
            </View>
            <Button
                isDisabled={isOffline}
                success={false}
                large
                style={[styles.mb5]}
                text={translate('common.skip')}
                isLoading={isValidateCodeFormSubmitting}
                onPress={() => { Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo)); }}
            />
            {isSmallScreenWidth && <OfflineIndicator />}
        </ScreenWrapper>
    );
}

BaseOnboardingPrivateDomain.displayName = 'BaseOnboardingPrivateDomain';

export default BaseOnboardingPrivateDomain;
