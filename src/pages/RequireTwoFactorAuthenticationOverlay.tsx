import Button from '@components/Button';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import GpsDraftDetailsRefSync from '@components/GpsDraftDetailsRefSync';
import Icon from '@components/Icon';
import OfflineIndicator from '@components/OfflineIndicator';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRequire2FAOverlayVisibility from '@hooks/useRequire2FAOverlayVisibility';
import useSignOut from '@hooks/useSignOut';
import useThemeStyles from '@hooks/useThemeStyles';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import {updateOnboardingLastVisitedPath} from '@userActions/Welcome';
import {buildOnboardingFlowParams, getRequired2FAOnboardingResumePath} from '@userActions/Welcome/OnboardingFlow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';

import type {OnyxCollection} from 'react-native-onyx';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

/**
 * Checks if the 2FA is required because of Xero.
 * - User is an admin of a workspace
 * - Xero connection is enabled in the workspace
 */
const is2FARequiredBecauseOfXeroSelector = (email?: string) => {
    return (workspaces: OnyxCollection<Policy>) => {
        return Object.values(workspaces ?? {})?.some((workspace) => {
            const isXeroConnectionEnabled = workspace?.connections?.xero;
            const isAdmin = email && workspace?.employeeList?.[email]?.role === CONST.POLICY.ROLE.ADMIN;
            return !!isXeroConnectionEnabled && !!isAdmin;
        });
    };
};

function RequireTwoFactorAuthenticationOverlay() {
    const {isRequire2FAOverlayVisible, isTestToolsRouteFocused} = useRequire2FAOverlayVisibility();

    const illustrations = useMemoizedLazyIllustrations(['Encryption']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getTwoFactorAuthRoute} = useTwoFactorAuthRoute();
    const {signOut, leaveDelegateAccount, isActingAsDelegate, isTrackingGPS} = useSignOut();
    const gpsDraftDetailsRef = useRef<GpsDraftDetails | undefined>(undefined);
    const [isEscapeInFlight, setIsEscapeInFlight] = useState(false);
    const [onboardingInitialPath] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const requires2FAForXeroSelector = useCallback((workspaces: OnyxCollection<Policy>) => is2FARequiredBecauseOfXeroSelector(email)(workspaces), [email]);
    const [is2FARequiredBecauseOfXero = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: requires2FAForXeroSelector});

    const snapshotOnboardingResumePathIfNeeded = useCallback(() => {
        const activeRoute = Navigation.getActiveRoute();
        if (activeRoute.startsWith(`/${ROUTES.ONBOARDING_ROOT.route}`)) {
            updateOnboardingLastVisitedPath(activeRoute);
            return;
        }
        if (onboardingInitialPath) {
            return;
        }
        const onboardingFlowParams = buildOnboardingFlowParams(account, onboardingValues, onboardingCompanySize, onboardingPurposeSelected, onboardingInitialPath);
        const resumePath = getRequired2FAOnboardingResumePath(onboardingFlowParams);
        if (resumePath.startsWith(`/${ROUTES.ONBOARDING_ROOT.route}`)) {
            updateOnboardingLastVisitedPath(resumePath);
        }
    }, [account, onboardingValues, onboardingCompanySize, onboardingPurposeSelected, onboardingInitialPath]);

    useEffect(() => {
        if (!isRequire2FAOverlayVisible) {
            return;
        }
        snapshotOnboardingResumePathIfNeeded();
    }, [isRequire2FAOverlayVisible, snapshotOnboardingResumePathIfNeeded]);

    const onEscapePress = () => {
        if (isEscapeInFlight) {
            return;
        }
        setIsEscapeInFlight(true);
        const escapeAction = isActingAsDelegate ? leaveDelegateAccount({gpsDraftDetailsRef}) : signOut();
        escapeAction.finally(() => {
            setIsEscapeInFlight(false);
        });
    };

    const enableTwoFactorAuth = () => {
        snapshotOnboardingResumePathIfNeeded();
        Navigation.navigate(getTwoFactorAuthRoute(ROUTES.SETTINGS_SECURITY, {forceSetup: true}));
    };

    if (!isRequire2FAOverlayVisible) {
        return null;
    }

    return (
        <>
            {isActingAsDelegate && isTrackingGPS && <GpsDraftDetailsRefSync gpsDraftDetailsRef={gpsDraftDetailsRef} />}
            <FocusTrapForModal active={!isTestToolsRouteFocused}>
                <View
                    style={[StyleSheet.absoluteFill, styles.twoFARequiredOverlay]}
                    testID="RequireTwoFactorAuthenticationOverlay"
                >
                    <View style={[styles.flex1, styles.appBG]}>
                        <View style={styles.twoFARequiredContainer}>
                            <View style={[styles.twoFAIllustration, styles.alignItemsCenter]}>
                                <Icon
                                    src={illustrations.Encryption}
                                    width={variables.twoFAIconHeight}
                                    height={variables.twoFAIconHeight}
                                />
                            </View>
                            <View style={[styles.mt2, styles.mh5, styles.dFlex, styles.alignItemsCenter]}>
                                <View style={styles.mb5}>
                                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mv2]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsHeader')}</Text>
                                    <Text style={[styles.textSupporting, styles.textAlignCenter]}>
                                        {translate(is2FARequiredBecauseOfXero ? 'twoFactorAuth.twoFactorAuthIsRequiredXero' : 'twoFactorAuth.twoFactorAuthIsRequiredCompany')}
                                    </Text>
                                </View>
                                <View style={[styles.flexRow, styles.gap2, styles.justifyContentCenter, styles.alignSelfCenter]}>
                                    <Button
                                        size={CONST.BUTTON_SIZE.LARGE}
                                        isLoading={isEscapeInFlight}
                                        onPress={onEscapePress}
                                    >
                                        <Button.Text>{translate(isActingAsDelegate ? 'delegate.leaveAccount' : 'initialSettingsPage.signOut')}</Button.Text>
                                    </Button>
                                    <Button
                                        size={CONST.BUTTON_SIZE.LARGE}
                                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                                        onPress={enableTwoFactorAuth}
                                    >
                                        <Button.KeyboardShortcut />
                                        <Button.Text>{translate('twoFactorAuth.enable2FA')}</Button.Text>
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </FocusTrapForModal>
            <View
                pointerEvents="box-none"
                style={[StyleSheet.absoluteFill, styles.twoFARequiredOfflineBanner]}
                testID="RequireTwoFactorOfflineBanner"
            >
                <OfflineIndicator
                    style={styles.pl5}
                    containerStyles={[styles.stickToBottom, styles.appBG]}
                    addBottomSafeAreaPadding
                />
            </View>
        </>
    );
}

export default RequireTwoFactorAuthenticationOverlay;
