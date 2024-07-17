import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import * as ReportUtils from '@libs/ReportUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ROUTES from '@src/ROUTES';
import useNetwork from '@hooks/useNetwork';
import { useOnyx } from "react-native-onyx";

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their self DM and and start a Track Expense
 *     - Else re-route to the login page
 */
function TrackExpensePage() {
    const styles = useThemeStyles();
    const isUnmounted = useRef(false);
    const {isOffline} = useNetwork();
    const [hasSeenTrackTraining] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING);

    useFocusEffect(() => {
        interceptAnonymousUser(() => {
            App.confirmReadyToOpenApp();
            Navigation.isNavigationReady().then(() => {
                if (isUnmounted.current) {
                    return;
                }
                Navigation.goBack();
                IOU.startMoneyRequest(
                    CONST.IOU.TYPE.TRACK,
                    ReportUtils.findSelfDMReportID() || ReportUtils.generateReportID(),
                )

                if (!hasSeenTrackTraining && !isOffline) {
                    setTimeout(() => {
                        Navigation.navigate(ROUTES.TRACK_TRAINING_MODAL);
                    }, CONST.ANIMATED_TRANSITION);
                }
            });
        });
    });

    useEffect(
        () => () => {
            isUnmounted.current = true;
        },
        [],
    );

    return (
        <ScreenWrapper testID={TrackExpensePage.displayName}>
            <View style={[styles.borderBottom]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

TrackExpensePage.displayName = 'TrackExpensePage';

export default TrackExpensePage;