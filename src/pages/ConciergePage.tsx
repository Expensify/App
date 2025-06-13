import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {navigateToConciergeChat} from '@libs/actions/Report';
import {completeTask} from '@libs/actions/Task';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
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
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {initialValue: true, canBeMissing: true});
    const route = useRoute();

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const viewTourTaskReportID = introSelected?.viewTour;
    const [viewTourTaskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourTaskReportID}`, {canBeMissing: true});

    useFocusEffect(
        useCallback(() => {
            if (session && 'authToken' in session) {
                confirmReadyToOpenApp();
                Navigation.isNavigationReady().then(() => {
                    if (isUnmounted.current || isLoadingReportData === undefined || !!isLoadingReportData) {
                        return;
                    }

                    // Mark the viewTourTask as complete if we are redirected to Concierge after finishing the Navattic tour
                    const {navattic} = (route.params as {navattic?: string}) ?? {};
                    if (navattic === CONST.NAVATTIC.COMPLETED) {
                        if (viewTourTaskReport) {
                            if (viewTourTaskReport.stateNum !== CONST.REPORT.STATE_NUM.APPROVED || viewTourTaskReport.statusNum !== CONST.REPORT.STATUS_NUM.APPROVED) {
                                completeTask(viewTourTaskReport);
                            }
                        }
                    }
                    navigateToConciergeChat(true, () => !isUnmounted.current);
                });
            } else {
                Navigation.navigate(ROUTES.HOME);
            }
        }, [session, isLoadingReportData, route.params, viewTourTaskReport]),
    );

    useEffect(() => {
        isUnmounted.current = false;
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    return (
        <ScreenWrapper testID={ConciergePage.displayName}>
            <View style={[styles.borderBottom, styles.appContentHeader]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

ConciergePage.displayName = 'ConciergePage';

export default ConciergePage;
