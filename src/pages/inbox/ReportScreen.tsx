import {PortalHost} from '@gorhom/portal';
import React, {useEffect} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';
import useActionListContextValue from '@hooks/useActionListContextValue';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubmitToDestinationVisible from '@hooks/useSubmitToDestinationVisible';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {clearAllReportActionDrafts, removeFailedReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import AccountManagerBanner from './AccountManagerBanner';
import {AgentZeroStatusProvider} from './AgentZeroStatusContext';
import {ConciergeDraftProvider} from './ConciergeDraftContext';
import DeleteTransactionNavigateBackHandler from './DeleteTransactionNavigateBackHandler';
import useDeferNonEssentials from './hooks/useDeferNonEssentials';
import useFlushDeferredWriteOnFocus from './hooks/useFlushDeferredWriteOnFocus';
import LinkedActionNotFoundGuard from './LinkedActionNotFoundGuard';
import ReactionListWrapper from './ReactionListWrapper';
import ReportActionComposePlaceholder from './report/ReportActionCompose/ReportActionComposePlaceholder';
import {ReportActionEditMessageContextProvider} from './report/ReportActionEditMessageContext';
import ReportFooter from './report/ReportFooter';
import ReportActionsList from './ReportActionsList';
import ReportDragAndDropProvider from './ReportDragAndDropProvider';
import ReportFetchHandler from './ReportFetchHandler';
import ReportHeader from './ReportHeader';
import ReportLifecycleHandler from './ReportLifecycleHandler';
import ReportNavigateAwayHandler from './ReportNavigateAwayHandler';
import ReportNotFoundGuard from './ReportNotFoundGuard';
import ReportRouteParamHandler from './ReportRouteParamHandler';
import {ActionListContext} from './ReportScreenContext';
import type ReportScreenNavigationProps from './types';
import WideRHPReceiptPanel from './WideRHPReceiptPanel';

type ReportScreenProps = ReportScreenNavigationProps;

function ReportScreen({route, navigation}: ReportScreenProps) {
    const styles = useThemeStyles();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const viewportOffsetTop = useViewportOffsetTop();
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];

    // When the report screen is navigated away from or the report changes, clear all report action edit drafts
    useEffect(() => {
        clearAllReportActionDrafts();

        return () => {
            clearAllReportActionDrafts();
        };
    }, [reportIDFromRoute]);

    const shouldDeferNonEssentials = useDeferNonEssentials(reportIDFromRoute);

    useSubmitToDestinationVisible(
        [CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY],
        reportIDFromRoute,
        CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.FOCUS,
    );

    useFlushDeferredWriteOnFocus(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

    const actionListValue = useActionListContextValue();

    const [reportPendingActionAndErrors] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {
        selector: (r) => ({
            reportPendingAction: r?.pendingFields?.addWorkspaceRoom ?? r?.pendingFields?.createChat ?? r?.pendingFields?.createReport ?? r?.pendingFields?.reportName,
            reportErrors: r?.errorFields?.addWorkspaceRoom ?? r?.errorFields?.createChat ?? r?.errorFields?.createReport,
        }),
    });
    const {reportPendingAction, reportErrors} = reportPendingActionAndErrors ?? {};

    const dismissReportCreationError = () => {
        Navigation.goBack(undefined, {
            afterTransition: () => removeFailedReport(reportIDFromRoute),
        });
    };

    return (
        <WideRHPOverlayWrapper shouldWrap={route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT}>
            <ReportActionEditMessageContextProvider reportID={reportIDFromRoute}>
                <ActionListContext.Provider value={actionListValue}>
                    <ReactionListWrapper>
                        <ScreenWrapper
                            navigation={navigation}
                            style={screenWrapperStyle}
                            shouldEnableKeyboardAvoidingView={isTopMostReportId || isInNarrowPaneModal}
                            testID={`report-screen-${reportIDFromRoute}`}
                        >
                            {!shouldDeferNonEssentials && (
                                <>
                                    <DeleteTransactionNavigateBackHandler />
                                    <ReportRouteParamHandler />
                                    <ReportFetchHandler />
                                    <ReportNavigateAwayHandler />
                                </>
                            )}
                            <ReportNotFoundGuard>
                                <LinkedActionNotFoundGuard>
                                    <ReportDragAndDropProvider>
                                        {!shouldDeferNonEssentials && <ReportLifecycleHandler reportID={reportIDFromRoute} />}
                                        <CollapsibleHeaderOnKeyboard>
                                            <ReportHeader />
                                            {!shouldDeferNonEssentials && <AccountManagerBanner reportID={reportIDFromRoute} />}
                                        </CollapsibleHeaderOnKeyboard>
                                        <OfflineWithFeedback
                                            pendingAction={reportPendingAction}
                                            errors={reportErrors}
                                            onClose={dismissReportCreationError}
                                            needsOffscreenAlphaCompositing
                                            style={styles.flex1}
                                            contentContainerStyle={styles.flex1}
                                            errorRowStyles={[styles.ph5, styles.mv2]}
                                        >
                                            <View style={[styles.flex1, styles.flexRow]}>
                                                {!shouldDeferNonEssentials && <WideRHPReceiptPanel />}
                                                <AgentZeroStatusProvider reportID={reportIDFromRoute}>
                                                    <ConciergeDraftProvider reportID={reportIDFromRoute}>
                                                        <View
                                                            style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                                            testID="report-actions-view-wrapper"
                                                        >
                                                            <ReportActionsList />
                                                            {shouldDeferNonEssentials ? <ReportActionComposePlaceholder /> : <ReportFooter />}
                                                        </View>
                                                    </ConciergeDraftProvider>
                                                </AgentZeroStatusProvider>
                                            </View>
                                        </OfflineWithFeedback>
                                        <PortalHost name="suggestions" />
                                    </ReportDragAndDropProvider>
                                </LinkedActionNotFoundGuard>
                            </ReportNotFoundGuard>
                        </ScreenWrapper>
                    </ReactionListWrapper>
                </ActionListContext.Provider>
            </ReportActionEditMessageContextProvider>
        </WideRHPOverlayWrapper>
    );
}

export default ReportScreen;
