import {CardStyleInterpolators} from '@react-navigation/stack';
import {accountIDSelector, emailSelector} from '@selectors/Session';
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
import RHP_WEB_TRANSITION_SPEC from '@libs/Navigation/AppNavigator/RHPTransitionSpec';
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
import OnboardingPersonalTrackGoal from '@pages/OnboardingPersonalTrackGoal';
import OnboardingPrivateDomain from '@pages/OnboardingPrivateDomain';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import OnboardingWorkEmail from '@pages/OnboardingWorkEmail';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation';
import OnboardingWorkspaces from '@pages/OnboardingWorkspaces';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import OnboardingModalNavigatorContentWrapper from './OnboardingModalNavigatorContentWrapper';
import Overlay from './Overlay';

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

let signUpEventPublishedForAccountID: number | undefined;

function OnboardingModalNavigator() {
    const styles = useThemeStyles();
    const {onboardingIsMediumOrLargerScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const outerViewRef = React.useRef<View>(null);
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);
    const isOnPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && account?.hasAccessibleDomainPolicies;

    let initialRouteName: ValueOf<typeof SCREENS.ONBOARDING> = SCREENS.ONBOARDING.PURPOSE;

    if (isOnPrivateDomainAndHasAccessiblePolicies) {
        initialRouteName = SCREENS.ONBOARDING.PERSONAL_DETAILS;
    }

    if (account?.isFromPublicDomain) {
        initialRouteName = SCREENS.ONBOARDING.WORK_EMAIL;
    }

    const [accountID] = useOnyx(ONYXKEYS.SESSION, {
        selector: accountIDSelector,
    });
    const [email] = useOnyx(ONYXKEYS.SESSION, {
        selector: emailSelector,
    });

    // Publish a sign_up event when we start the onboarding flow. This should track basic sign ups
    // as well as Google and Apple SSO.
    useEffect(() => {
        if (!accountID || !email || signUpEventPublishedForAccountID === accountID) {
            return;
        }

        signUpEventPublishedForAccountID = accountID;
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.SIGN_UP.NAME, accountID, email);
    }, [accountID, email]);

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
                cardStyleInterpolator: isMobileSafari() ? (props) => customInterpolator({props, enter: {kind: 'slide-from-width'}}) : CardStyleInterpolators.forHorizontalIOS,
                gestureDirection: 'horizontal',
                cardStyle: {
                    height: '100%',
                },
                transitionSpec: shouldUseNarrowLayout ? undefined : RHP_WEB_TRANSITION_SPEC,
            },
        };
    }, [customInterpolator, shouldUseNarrowLayout]);

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
                    <OnboardingModalNavigatorContentWrapper onboardingIsMediumOrLargerScreenWidth={onboardingIsMediumOrLargerScreenWidth}>
                        <Stack.Navigator
                            screenOptions={defaultScreenOptions}
                            initialRouteName={initialRouteName}
                        >
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.PURPOSE}
                                component={OnboardingPurpose}
                                options={{animationTypeForReplace: 'push'}}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                                component={OnboardingPersonalDetails}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.WORK_EMAIL}
                                component={OnboardingWorkEmail}
                                options={{animationTypeForReplace: 'push'}}
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
                                name={SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL}
                                component={OnboardingPersonalTrackGoal}
                            />
                        </Stack.Navigator>
                    </OnboardingModalNavigatorContentWrapper>
                </FocusTrapForScreens>
            </View>
        </NoDropZone>
    );
}

export default OnboardingModalNavigator;
