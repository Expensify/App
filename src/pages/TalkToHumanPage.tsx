import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';

import useNetwork from '@hooks/useNetwork';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useFocusEffect} from '@react-navigation/native';
import React, {useRef} from 'react';
import {View} from 'react-native';

// Utility page: goes back, then does what the Help page's Talk to a human row does (offline it shows Help instead).
function TalkToHumanPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {openSupportTicketOrConcierge} = useOpenSupportTicket();
    const hasHandledLink = useRef(false);

    useFocusEffect(() => {
        let isCancelled = false;

        Navigation.isNavigationReady().then(() => {
            if (isCancelled || hasHandledLink.current) {
                return;
            }
            hasHandledLink.current = true;

            // A wide to narrow resize leaves a pending pop to the sidebar, which targets the page underneath
            // rather than this one. goBack would consume it here and leave this page open, so it is set aside
            // while this page pops and handed back to the next Back.
            const hadPendingPopToSidebar = Navigation.getShouldPopToSidebar();
            Navigation.setShouldPopToSidebar(false);
            Navigation.goBack();
            Navigation.setShouldPopToSidebar(hadPendingPopToSidebar);
            if (isOffline) {
                Navigation.navigate(ROUTES.SETTINGS_HELP);
                return;
            }
            openSupportTicketOrConcierge();
        });

        return () => {
            isCancelled = true;
        };
    });

    return (
        <ScreenWrapper testID="TalkToHumanPage">
            <View style={[styles.borderBottom]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

export default TalkToHumanPage;
