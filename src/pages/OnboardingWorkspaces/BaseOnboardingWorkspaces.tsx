import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import PrivateDomainWorkspacesList from '@components/PrivateDomainWorkspacesList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isCurrentUserValidated} from '@libs/UserUtils';
import {getAccessiblePolicies} from '@userActions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingWorkspacesProps} from './types';

function BaseOnboardingWorkspaces({route, shouldUseNativeStyles}: BaseOnboardingWorkspacesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES, {canBeMissing: true});
    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {canBeMissing: true});

    const joinablePoliciesLoading = getAccessiblePoliciesAction?.loading;
    const joinablePoliciesLength = Object.keys(joinablePolicies ?? {}).length;

    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const isValidated = isCurrentUserValidated(loginList);

    useFocusEffect(
        useCallback(() => {
            if (!isValidated || joinablePoliciesLength > 0 || joinablePoliciesLoading) {
                return;
            }

            getAccessiblePolicies();
        }, [isValidated, joinablePoliciesLength, joinablePoliciesLoading]),
    );

    const handleBackButtonPress = useCallback(() => {
        Navigation.goBack();
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="BaseOnboardingWorkspaces"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldShowOfflineIndicator={isSmallScreenWidth}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={60}
                onBackButtonPress={handleBackButtonPress}
            />
            <PrivateDomainWorkspacesList
                footerContent={
                    <Button
                        success={false}
                        large
                        text={translate('common.skip')}
                        onPress={() => {
                            Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
                        }}
                        style={[styles.mt5]}
                    />
                }
            />
        </ScreenWrapper>
    );
}

BaseOnboardingWorkspaces.displayName = 'BaseOnboardingWorkspaces';

export default BaseOnboardingWorkspaces;
