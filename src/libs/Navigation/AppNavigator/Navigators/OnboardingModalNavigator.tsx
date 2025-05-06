import {CardStyleInterpolators} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import GoogleTagManager from '@libs/GoogleTagManager';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import OnboardingAccounting from '@pages/OnboardingAccounting';
import OnboardingEmployees from '@pages/OnboardingEmployees';
import OnboardingPersonalDetails from '@pages/OnboardingPersonalDetails';
import OnboardingPrivateDomain from '@pages/OnboardingPrivateDomain';
import OnboardingPurpose from '@pages/OnboardingPurpose';
import OnboardingWorkEmail from '@pages/OnboardingWorkEmail';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation';
import OnboardingWorkspaces from '@pages/OnboardingWorkspaces';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

const defaultScreenOptions: PlatformStackNavigationOptions = {
    headerShown: false,
    web: {
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
};

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

function OnboardingModalNavigator() {
    const styles = useThemeStyles();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const outerViewRef = React.useRef<View>(null);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const {canUsePrivateDomainOnboarding} = usePermissions();

    const isOnPrivateDomainAndHasAccessiblePolicies = canUsePrivateDomainOnboarding && !account?.isFromPublicDomain && account?.hasAccessibleDomainPolicies;

    const [accountID] = useOnyx(ONYXKEYS.SESSION, {
        selector: (session) => session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
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
                        style={styles.OnboardingNavigatorInnerView(onboardingIsMediumOrLargerScreenWidth)}
                    >
                        <Stack.Navigator screenOptions={defaultScreenOptions}>
                            {/* The OnboardingPurpose screen is shown after the workspace step when the user is on a private domain and has accessible policies.
                             */}
                            {!isOnPrivateDomainAndHasAccessiblePolicies && (
                                <Stack.Screen
                                    name={SCREENS.ONBOARDING.PURPOSE}
                                    component={OnboardingPurpose}
                                />
                            )}
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
                            {/* The OnboardingPurpose screen is only shown after the workspace step when the user is on a private domain and has accessible policies
                             */}
                            {!!isOnPrivateDomainAndHasAccessiblePolicies && (
                                <Stack.Screen
                                    name={SCREENS.ONBOARDING.PURPOSE}
                                    component={OnboardingPurpose}
                                />
                            )}
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.EMPLOYEES}
                                component={OnboardingEmployees}
                            />
                            <Stack.Screen
                                name={SCREENS.ONBOARDING.ACCOUNTING}
                                component={OnboardingAccounting}
                            />
                        </Stack.Navigator>
                    </View>
                </FocusTrapForScreens>
            </View>
        </NoDropZone>
    );
}

OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';

export default OnboardingModalNavigator;
