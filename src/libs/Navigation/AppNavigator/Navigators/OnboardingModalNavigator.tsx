import {CardStyleInterpolators} from '@react-navigation/stack';
import {accountIDSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import GoogleTagManager from '@libs/GoogleTagManager';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import OnboardingAccounting from '@pages/OnboardingAccounting';
import OnboardingEmployees from '@pages/OnboardingEmployees';
import OnboardingInterestedFeatures from '@pages/OnboardingInterestedFeatures';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import OnboardingPrivateDomain from '@pages/OnboardingPrivateDomain';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import OnboardingWorkEmail from '@pages/OnboardingWorkEmail';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation';
import OnboardingWorkspaceConfirmation from '@pages/OnboardingWorkspaceConfirmation';
import OnboardingWorkspaceCurrency from '@pages/OnboardingWorkspaceCurrency';
import OnboardingWorkspaceInvite from '@pages/OnboardingWorkspaceInvite';
import OnboardingWorkspaceOptional from '@pages/OnboardingWorkspaceOptional';
import OnboardingWorkspaces from '@pages/OnboardingWorkspaces';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Overlay from './Overlay';

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator() {
    const styles = useThemeStyles();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const outerViewRef = React.useRef<View>(null);
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const isOnPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && account?.hasAccessibleDomainPolicies;

    let initialRouteName: ValueOf<typeof SCREENS.ONBOARDING> = SCREENS.ONBOARDING.PURPOSE;

    if (isOnPrivateDomainAndHasAccessiblePolicies) {
        initialRouteName = SCREENS.ONBOARDING.PERSONAL_DETAILS;
    }

    if (account?.isFromPublicDomain) {
        initialRouteName = SCREENS.ONBOARDING.WORK_EMAIL;
    }

    if (onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND && !!onboardingPolicyID) {
        initialRouteName = SCREENS.ONBOARDING.WORKSPACE_INVITE;
    }

    const [accountID] = useOnyx(ONYXKEYS.SESSION, {
        selector: accountIDSelector,
        canBeMissing: false,
    });

    // Publish a sign_up event when we start the onboarding flow. This should track basic sign ups
    // as well as Google and Apple SSO.
    useEffect(() => {
        if (!accountID) {
            return;
        }

        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.SIGN_UP, accountID);
    }, [accountID]);

    const handleOuterClick = useCallback(() => {
        OnboardingRefManager.handleOuterClick();
    }, []);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleOuterClick, {shouldBubble: true});

    const customInterpolator = useModalCardStyleInterpolator();
    const defaultScreenOptions = useMemo<PlatformStackNavigationOptions>(() => {
        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            animationTypeForReplace: 'pop',
            gestureDirection: 'horizontal',
            web: {
                // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
                cardStyleInterpolator: isMobileSafari() ? (props) => customInterpolator({props}) : CardStyleInterpolators.forHorizontalIOS,
                gestureDirection: 'horizontal',
                cardStyle: {
                    height: '100%',
                },
            },
        };
    }, [customInterpolator]);

    // If the account data is not loaded yet, we don't want to show the onboarding modal
    if (isLoadingOnyxValue(accountMetadata)) {
        return null;
    }

    return (
        <NoDropZone>
            <Overlay />
            <View
                ref={outerViewRef}
                onClick={handleOuterClick}
                style={styles.onboardingNavigatorOuterView}
            >
                <FocusTrapForScreens>
                    <View
                        onClick={(e) => e.stopPropagation()}
                        style={[styles.maxHeight100Percentage, styles.overflowHidden, styles.OnboardingNavigatorInnerView(onboardingIsMediumOrLargerScreenWidth)]}
                    >
                        <Stack.Navigator
                            screenOptions={defaultScreenOptions}
                            initialRouteName={initialRouteName}
                        >
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.PURPOSE}
                                component={OnboardingPurpose}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                                component={OnboardingPersonalDetails}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORK_EMAIL}
                                component={OnboardingWorkEmail}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION}
                                component={OnboardingWorkEmailValidation}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.PRIVATE_DOMAIN}
                                component={OnboardingPrivateDomain}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORKSPACES}
                                component={OnboardingWorkspaces}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.EMPLOYEES}
                                component={OnboardingEmployees}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.ACCOUNTING}
                                component={OnboardingAccounting}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.INTERESTED_FEATURES}
                                component={OnboardingInterestedFeatures}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORKSPACE_OPTIONAL}
                                component={OnboardingWorkspaceOptional}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORKSPACE_CONFIRMATION}
                                component={OnboardingWorkspaceConfirmation}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORKSPACE_CURRENCY}
                                component={OnboardingWorkspaceCurrency}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORKSPACE_INVITE}
                                component={OnboardingWorkspaceInvite}
                            />
                        </Stack.Navigator>
                    </View>
                </FocusTrapForScreens>
            </View>
        </NoDropZone>
    );
}

export default OnboardingModalNavigator;
