import {PortalHost} from '@gorhom/portal';
import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';
import useActionListContextValue from '@hooks/useActionListContextValue';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubmitToDestinationVisible from '@hooks/useSubmitToDestinationVisible';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import AccountManagerBanner from './AccountManagerBanner';
import DeleteTransactionNavigateBackHandler from './DeleteTransactionNavigateBackHandler';
import ReactionListWrapper from './ReactionListWrapper';
import ReportActionsList from './ReportActionsList';
import ReportComposer from './ReportComposer';
import ReportFetchController from './ReportFetchController';
import ReportHeader from './ReportHeader';
import ReportLifecycleHandler from './ReportLifecycleHandler';
import ReportNotFoundGuard from './ReportNotFoundGuard';
import ReportRouteParamHandler from './ReportRouteParamHandler';
import {ActionListContext} from './ReportScreenContext';
import WideRHPReceiptPanel from './WideRHPReceiptPanel';

type ReportScreenNavigationProps =
    | PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

type ReportScreenProps = ReportScreenNavigationProps;

function ReportScreen({route, navigation}: ReportScreenProps) {
    const styles = useThemeStyles();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const viewportOffsetTop = useViewportOffsetTop();
    const actionListValue = useActionListContextValue();

    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];

    useSubmitToDestinationVisible(
        [CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY],
        reportIDFromRoute,
        CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.FOCUS,
    );

    return (
        <WideRHPOverlayWrapper shouldWrap={route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT}>
            <ActionListContext.Provider value={actionListValue}>
                <ReactionListWrapper>
                    <ScreenWrapper
                        navigation={navigation}
                        style={screenWrapperStyle}
                        shouldEnableKeyboardAvoidingView={isTopMostReportId || isInNarrowPaneModal}
                        testID={`report-screen-${reportIDFromRoute}`}
                    >
                        <DeleteTransactionNavigateBackHandler />
                        <ReportRouteParamHandler
                            route={route}
                            navigation={navigation}
                        />
                        <ReportLifecycleHandler reportIDFromRoute={reportIDFromRoute} />
                        <ReportFetchController />
                        <ReportNotFoundGuard>
                            <ReportHeader />
                            <AccountManagerBanner reportID={reportIDFromRoute} />
                            <View style={[styles.flex1, styles.flexRow]}>
                                <WideRHPReceiptPanel />
                                <View
                                    style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                    testID="report-actions-view-wrapper"
                                >
                                    <ReportActionsList />
                                    <ReportComposer />
                                </View>
                            </View>
                            <PortalHost name="suggestions" />
                        </ReportNotFoundGuard>
                    </ScreenWrapper>
                </ReactionListWrapper>
            </ActionListContext.Provider>
        </WideRHPOverlayWrapper>
    );
}

export default ReportScreen;
