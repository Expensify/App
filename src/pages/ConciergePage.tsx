import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {navigateToConciergeChat} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage() {
    const styles = useThemeStyles();
    const isUnmounted = useRef(false);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    useFocusEffect(
        useCallback(() => {
            if (session && 'authToken' in session) {
                confirmReadyToOpenApp();
                Navigation.isNavigationReady().then(() => {
                    if (isUnmounted.current || isLoadingReportData === undefined || !!isLoadingReportData) {
                        return;
                    }

                    navigateToConciergeChat(conciergeReportID, true, () => !isUnmounted.current);
                });
            } else {
                Navigation.navigate(ROUTES.HOME);
            }
        }, [session, isLoadingReportData, conciergeReportID]),
    );

    useEffect(() => {
        isUnmounted.current = false;
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    return (
        <ScreenWrapper testID="ConciergePage">
            <View style={[styles.borderBottom, styles.appContentHeader]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

export default ConciergePage;
