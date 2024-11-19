import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as App from '@userActions/App';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';

type ConciergePageOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ConciergePageProps = ConciergePageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.CONCIERGE>;

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage({session}: ConciergePageProps) {
    const styles = useThemeStyles();
    const isUnmounted = useRef(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {initialValue: true});

    useFocusEffect(
        useCallback(() => {
            if (session && 'authToken' in session) {
                App.confirmReadyToOpenApp();
                Navigation.isNavigationReady().then(() => {
                    if (isUnmounted.current || isLoadingReportData === undefined || !!isLoadingReportData) {
                        return;
                    }
                    Report.navigateToConciergeChat(true, () => !isUnmounted.current);
                });
            } else {
                Navigation.navigate();
            }
        }, [session, isLoadingReportData]),
    );

    useEffect(() => {
        isUnmounted.current = false;
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    return (
        <ScreenWrapper testID={ConciergePage.displayName}>
            <View style={[styles.borderBottom, styles.appContentHeader, !shouldUseNarrowLayout && styles.headerBarDesktopHeight]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

ConciergePage.displayName = 'ConciergePage';

export default withOnyx<ConciergePageProps, ConciergePageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConciergePage);
