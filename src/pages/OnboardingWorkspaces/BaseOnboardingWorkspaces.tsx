import React, { useCallback, useEffect, useRef, useState } from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import OfflineIndicator from '@components/OfflineIndicator';
import Button from '@components/Button';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import { BaseOnboardingWorkspacesProps } from './types';

function BaseOnboardingWorkspaces({shouldUseNativeStyles, route}: BaseOnboardingWorkspacesProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isSmallScreenWidth, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingWorkspaces"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={80}
                onBackButtonPress={OnboardingFlow.goBack}
            />
            <View style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
            <Text style={styles.textHeadlineH1}>{translate('onboarding.joinAWorkspace')}</Text>
            <Text style={[styles.textAlignLeft, styles.mt5]}>{translate('onboarding.listOfWorkspaces')}</Text>
            <Button
                    isDisabled={isOffline}
                    success={false}
                    large
                    style={[styles.mb5]}
                    text={translate('common.skip')}
                    onPress={() => {Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));}} 
                />
                </View>
            {isSmallScreenWidth && <OfflineIndicator />}
        </ScreenWrapper>
    );
}

BaseOnboardingWorkspaces.displayName = 'BaseOnboardingWorkspaces';

export default BaseOnboardingWorkspaces;
