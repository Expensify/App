import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
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

type ConciergePageProps = ConciergePageOnyxProps & PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.CONCIERGE>;

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage({session}: ConciergePageProps) {
    const styles = useThemeStyles();
    const isUnmounted = useRef(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useFocusEffect(() => {
        if (session && 'authToken' in session) {
            App.confirmReadyToOpenApp();
            // Pop the concierge loading page before opening the concierge report.
            Navigation.isNavigationReady().then(() => {
                if (isUnmounted.current) {
                    return;
                }
                Report.navigateToConciergeChat(true, () => !isUnmounted.current);
            });
        } else {
            Navigation.navigate();
        }
    });

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
