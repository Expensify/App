import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import {useKeyboardDismissibleFlatListActions, useKeyboardDismissibleFlatListState} from '@components/KeyboardDismissibleFlatList/KeyboardDismissibleFlatListContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';

import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useSubmitToDestinationVisible from '@hooks/useSubmitToDestinationVisible';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';

import {removeFailedReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {isMoneyRequestReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {ViewStyle} from 'react-native';

import {PortalHost} from '@gorhom/portal';
import React from 'react';
import {View} from 'react-native';
import {KeyboardGestureArea, KeyboardStickyView} from 'react-native-keyboard-controller';

import type ReportScreenNavigationProps from './types';

import AccountManagerBanner from './AccountManagerBanner';
import {ActionListContextProvider} from './ActionListContext';
import {AgentZeroStatusProvider} from './AgentZeroStatusContext';
import {ConciergeDraftProvider} from './ConciergeDraftContext';
import DeleteTransactionNavigateBackHandler from './DeleteTransactionNavigateBackHandler';
import useDeferNonEssentials from './hooks/useDeferNonEssentials';
import useFlushDeferredWriteOnFocus from './hooks/useFlushDeferredWriteOnFocus';
import LinkedActionNotFoundGuard from './LinkedActionNotFoundGuard';
import ReactionListWrapper from './ReactionListWrapper';
import ReportActionCompose from './report/ReportActionCompose/ReportActionCompose';
import {ReportActionEditMessageContextProvider, ReportScreenEditMessageProviderWithTransactionThread} from './report/ReportActionEditMessageContext';
import ReportFooter from './report/ReportFooter';
import useClearReportActionDraftsOnReportChange from './report/useClearReportActionDraftsOnReportChange';
import ReportActions from './ReportActions';
import ReportDragAndDropProvider from './ReportDragAndDropProvider';
import ReportFetchHandler from './ReportFetchHandler';
import ReportHeader from './ReportHeader';
import ReportLifecycleHandler from './ReportLifecycleHandler';
import ReportNavigateAwayHandler from './ReportNavigateAwayHandler';
import ReportNotFoundGuard from './ReportNotFoundGuard';
import ReportRouteParamHandler from './ReportRouteParamHandler';
import WideRHPReceiptPanel from './WideRHPReceiptPanel';

type ReportScreenProps = ReportScreenNavigationProps;

type ReportScreenEditMessageProviderProps = {
    /** The report ID */
    reportID: string | undefined;
    /** The children */
    children: React.ReactNode;
};

/** Money-request screens need transaction-thread derivation; others use the lighter provider path. */
function ReportScreenEditMessageProvider({reportID, children}: ReportScreenEditMessageProviderProps) {
    const [shouldDeriveMoneyRequestTransactionThread] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        selector: (reportEntry) => !!reportEntry && isMoneyRequestReport(reportEntry),
    });

    if (shouldDeriveMoneyRequestTransactionThread !== true) {
        return <ReportActionEditMessageContextProvider reportID={reportID}>{children}</ReportActionEditMessageContextProvider>;
    }

    return <ReportScreenEditMessageProviderWithTransactionThread reportID={reportID}>{children}</ReportScreenEditMessageProviderWithTransactionThread>;
}

function ReportScreen({route, navigation}: ReportScreenProps) {
    const styles = useThemeStyles();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const viewportOffsetTop = useViewportOffsetTop();
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];
    const safeAreaPaddings = useSafeAreaPaddings();
    const {composerHeight} = useKeyboardDismissibleFlatListState();
    const {onComposerLayout} = useKeyboardDismissibleFlatListActions();

    const keyboardGestureAreaOffset = composerHeight - safeAreaPaddings.paddingBottom;

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`);

    const shouldDeferNonEssentials = useDeferNonEssentials(reportIDFromRoute);

    useSubmitToDestinationVisible(
        [CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY],
        reportIDFromRoute,
        CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.FOCUS,
    );

    useFlushDeferredWriteOnFocus(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

    const [reportPendingActionAndErrors] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {
        selector: (r) => ({
            reportPendingAction: r?.pendingFields?.createReport ?? r?.pendingFields?.reportName,
            reportErrors: r?.errorFields?.createReport,
        }),
    });
    const {reportPendingAction, reportErrors} = reportPendingActionAndErrors ?? {};

    const dismissReportCreationError = () => {
        Navigation.goBack(undefined, {
            afterTransition: () => removeFailedReport(reportIDFromRoute),
        });
    };

    useClearReportActionDraftsOnReportChange(reportIDFromRoute);

    return (
        <KeyboardGestureArea
            style={styles.flex1}
            offset={keyboardGestureAreaOffset}
            interpolator="ios"
            textInputNativeID={CONST.COMPOSER.NATIVE_ID}
            enableSwipeToDismiss={!isComposerFullSize}
        >
            <ReportScreenEditMessageProvider reportID={reportIDFromRoute}>
                <WideRHPOverlayWrapper shouldWrap={route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT}>
                    <ActionListContextProvider>
                        <ReactionListWrapper>
                            <ScreenWrapper
                                navigation={navigation}
                                style={screenWrapperStyle}
                                shouldEnableKeyboardAvoidingView={false}
                                shouldShowOfflineIndicator={false}
                                shouldShowOfflineIndicatorInWideScreen={false}
                                enableEdgeToEdgeBottomSafeAreaPadding
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
                                                                <ReportActions />
                                                                <KeyboardStickyView
                                                                    onLayout={onComposerLayout}
                                                                    offset={{closed: 0, opened: safeAreaPaddings.paddingBottom}}
                                                                >
                                                                    {shouldDeferNonEssentials ? <ReportActionCompose.Placeholder /> : <ReportFooter />}
                                                                </KeyboardStickyView>
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
                    </ActionListContextProvider>
                </WideRHPOverlayWrapper>
            </ReportScreenEditMessageProvider>
        </KeyboardGestureArea>
    );
}

export default ReportScreen;
