import React, { useCallback, useEffect, useRef, useState } from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import type {BaseOnboardingPrivateDomainProps} from './types';
import { useOnyx } from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as User from '@userActions/User';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import OfflineIndicator from '@components/OfflineIndicator';
import ValidateCodeForm from '@pages/signin/ValidateCodeForm';
import AccountUtils from '@libs/AccountUtils';
import Button from '@components/Button';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import { BaseValidateCodeFormRef } from '@pages/signin/ValidateCodeForm/BaseValidateCodeForm';


function BaseOnboardingPrivateDomain({shouldUseNativeStyles, route}: BaseOnboardingPrivateDomainProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const {shouldUseNarrowLayout, isSmallScreenWidth, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);

    const validateCodeFormRef = useRef<BaseValidateCodeFormRef>(null);

    useEffect(() => {
        User.requestValidateCodeAction();
        //return () => User.clearUnvalidatedNewContactMethodAction();
    }, []);
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingPrivateDomain"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={25}
                onBackButtonPress={OnboardingFlow.goBack}
            />
            <View style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
            <Text style={styles.textHeadlineH1}>{translate('onboarding.peopleYouMayKnow')}</Text>
            <Text style={[styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workspaceYouMayJoin', {domain: "test", email: "test@gmail.com"})}</Text>
            <ValidateCodeForm
                isVisible={true}
                isUsingRecoveryCode={false}
                setIsUsingRecoveryCode={() => {}}
                ref={validateCodeFormRef} 
                useOnboardingPrivateDomainSettings={true}/>
            </View>
            <View style={[styles.justifyContentEnd, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
            <Button
                    isDisabled={isOffline}
                    success={false}
                    large
                    style={[styles.mb5]}
                    text={translate('common.skip')}
                    isLoading={isValidateCodeFormSubmitting}
                    // TODO change below to test new screen
                    onPress={() => {Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));}} 
                />
            </View>
            {isSmallScreenWidth && <OfflineIndicator />}
        </ScreenWrapper>
    );
}

BaseOnboardingPrivateDomain.displayName = 'BaseOnboardingPrivateDomain';

export default BaseOnboardingPrivateDomain;
