import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';

import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigateToConciergeChat} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {OnyxValue} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import {isActingAsDelegateSelector} from '@selectors/Account';
import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {guidedSetupAndTourStatusSelector, tryNewDotOnyxSelector, wasInvitedToNewDotSelector} from '@selectors/Onboarding';
import {isSupportalSessionSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

const isMigratedUserSelector = (tryNewDot: OnyxValue<typeof ONYXKEYS.NVP_TRY_NEW_DOT>) => tryNewDotOnyxSelector(tryNewDot).hasBeenAddedToNudgeMigration;

function isOnboardingOpen() {
    return navigationRef.isReady() && !!navigationRef.getRootState()?.routes.some((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
}

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage() {
    const styles = useThemeStyles();
    const {contentHeaderHeightStyle} = useContentHeaderHeight();
    const isUnmounted = useRef(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const isSelfTourViewed = guidedSetupAndTourStatus?.isSelfTourViewed;
    const hasCompletedGuidedSetupFlow = guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow;
    const delegateAccountID = useDelegateAccountID();
    const [hasNonPersonalPolicy] = useOnyx(ONYXKEYS.HAS_NON_PERSONAL_POLICY);
    const [isMigratedUser] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: isMigratedUserSelector});
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const [isSingleNewDotEntry] = useOnyx(ONYXKEYS.HYBRID_APP, {selector: isSingleNewDotEntrySelector});

    // The accounts useOnboardingFlow never sends to onboarding, so their flag can stay false for good.
    const isOnboardingSkipped =
        !!hasNonPersonalPolicy ||
        !!wasInvitedToNewDotSelector(introSelected) ||
        !!isMigratedUser ||
        isSupportalSessionSelector(session) ||
        !!isActingAsDelegate ||
        (CONFIG.IS_HYBRID_APP && !!isSingleNewDotEntry);

    // Onboarding opens on top of this page for a new account, and the redirect below dismisses the top modal, so it
    // would close onboarding before it is finished. The link is opened once onboarding completes instead.
    const isWaitingForOnboarding = !CONFIG.SKIP_ONBOARDING && hasCompletedGuidedSetupFlow === false;

    useFocusEffect(
        useCallback(() => {
            if (session && 'authToken' in session) {
                Navigation.isNavigationReady().then(() => {
                    if (isUnmounted.current || isLoadingReportData === undefined || !!isLoadingReportData) {
                        return;
                    }

                    // Onboarding can join or create a workspace before it finishes, so an open onboarding still wins.
                    if (isWaitingForOnboarding && (!isOnboardingSkipped || isOnboardingOpen())) {
                        return;
                    }

                    navigateToConciergeChat({
                        conciergeReportID,
                        introSelected,
                        currentUserAccountID: session.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        isSelfTourViewed,
                        hasCompletedGuidedSetupFlow,
                        conciergePersonalDetails,
                        shouldDismissModal: true,
                        checkIfCurrentPageActive: () => !isUnmounted.current,
                        delegateAccountID,
                    });
                });
            } else {
                Navigation.navigate(ROUTES.INBOX);
            }
        }, [
            session,
            isLoadingReportData,
            conciergeReportID,
            introSelected,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            conciergePersonalDetails,
            isWaitingForOnboarding,
            isOnboardingSkipped,
            delegateAccountID,
        ]),
    );

    useEffect(() => {
        isUnmounted.current = false;
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    return (
        <ScreenWrapper testID="ConciergePage">
            <View style={[styles.borderBottom, styles.appContentHeader, contentHeaderHeightStyle]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

export default ConciergePage;
