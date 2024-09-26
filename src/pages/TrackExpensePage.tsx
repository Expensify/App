import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their self DM and and start a Track Expense
 *     - Else re-route to the login page
 */
function TrackExpensePage() {
    const styles = useThemeStyles();
    const isUnmounted = useRef(false);
    const {isOffline} = useNetwork();
    const [hasSeenTrackTraining, hasSeenTrackTrainingResult] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING);
    const isLoadingHasSeenTrackTraining = isLoadingOnyxValue(hasSeenTrackTrainingResult);

    useFocusEffect(() => {
        interceptAnonymousUser(() => {
            App.confirmReadyToOpenApp();
            Navigation.isNavigationReady().then(() => {
                if (isUnmounted.current || isLoadingHasSeenTrackTraining) {
                    return;
                }
                Navigation.goBack();
                IOU.startMoneyRequest(
                    CONST.IOU.TYPE.TRACK,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    ReportUtils.findSelfDMReport()?.reportID || ReportUtils.generateReportID(),
                );

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
