import {useIsFocused} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import lodashThrottle from 'lodash/throttle';
import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {InteractionManager} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useInitialValue from '@hooks/useInitialValue';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getIsReportFullyVisible from '@libs/getIsReportFullyVisible';
import Performance from '@libs/Performance';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import {isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import {didUserLogInDuringSession} from '@libs/SessionUtils';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PopoverReactionList from './ReactionList/PopoverReactionList';
import ReportActionsList from './ReportActionsList';
import type {LoadNewerChats} from './ReportActionsList';

type ReportActionsViewOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};

type ReportActionsViewProps = ReportActionsViewOnyxProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The report metadata loading states */
    isLoadingInitialReportActions?: boolean;

    /** The report actions are loading more data */
    isLoadingOlderReportActions?: boolean;

    /** The report actions are loading newer data */
    isLoadingNewerReportActions?: boolean;
};

function ReportActionsView({
    report,
    session,
    parentReportAction,
    reportActions = [],
    isLoadingInitialReportActions = false,
    isLoadingOlderReportActions = false,
    isLoadingNewerReportActions = false,
}: ReportActionsViewProps) {
    useCopySelectionHelper();
    const reactionListRef = useContext(ReactionListContext);
    const didLayout = useRef(false);
    const didSubscribeToReportTypingEvents = useRef(false);
    const isFirstRender = useRef(true);
    const hasCachedActions = useInitialValue(() => reportActions.length > 0);
    const mostRecentIOUReportActionID = useMemo(() => ReportActionsUtils.getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const network = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const prevNetworkRef = useRef(network);
    const prevAuthTokenType = usePrevious(session?.authTokenType);

    const prevIsSmallScreenWidthRef = useRef(isSmallScreenWidth);

    const isFocused = useIsFocused();
    const reportID = report.reportID;
    const hasNewestReportAction = reportActions[0]?.isNewestReportAction;

    const isReportFullyVisible = useMemo((): boolean => getIsReportFullyVisible(isFocused), [isFocused]);

    const openReportIfNecessary = () => {
        const createChatError = report.errorFields?.createChat;
        // If the report is optimistic (AKA not yet created) we don't need to call openReport again
        if (!!report.isOptimisticReport || !isEmptyObject(createChatError)) {
            return;
        }

        Report.openReport(reportID);
    };

    useEffect(() => {
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            openReportIfNecessary();
        });
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (interactionTask) {
            return () => {
                interactionTask.cancel();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const prevNetwork = prevNetworkRef.current;
        // When returning from offline to online state we want to trigger a request to OpenReport which
        // will fetch the reportActions data and mark the report as read. If the report is not fully visible
        // then we call ReconnectToReport which only loads the reportActions data without marking the report as read.
        const wasNetworkChangeDetected = prevNetwork.isOffline && !network.isOffline;
        if (wasNetworkChangeDetected) {
            if (isReportFullyVisible) {
                openReportIfNecessary();
            } else {
                Report.reconnect(reportID);
            }
        }
        // update ref with current network state
        prevNetworkRef.current = network;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [network, isReportFullyVisible]);

    useEffect(() => {
        const wasLoginChangedDetected = prevAuthTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS && !session?.authTokenType;
        if (wasLoginChangedDetected && didUserLogInDuringSession() && isUserCreatedPolicyRoom(report)) {
            if (isReportFullyVisible) {
                openReportIfNecessary();
            } else {
                Report.reconnect(reportID);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, report, isReportFullyVisible]);

    useEffect(() => {
        const prevIsSmallScreenWidth = prevIsSmallScreenWidthRef.current;
        // If the view is expanded from mobile to desktop layout
        // we update the new marker position, mark the report as read, and fetch new report actions
        const didScreenSizeIncrease = prevIsSmallScreenWidth && !isSmallScreenWidth;
        const didReportBecomeVisible = isReportFullyVisible && didScreenSizeIncrease;
        if (didReportBecomeVisible) {
            openReportIfNecessary();
        }
        // update ref with current state
        prevIsSmallScreenWidthRef.current = isSmallScreenWidth;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth, reportActions, isReportFullyVisible]);

    useEffect(() => {
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);
        if (!didSubscribeToReportTypingEvents.current && didCreateReportSuccessfully) {
            const interactionTask = InteractionManager.runAfterInteractions(() => {
                Report.subscribeToReportTypingEvents(reportID);
                didSubscribeToReportTypingEvents.current = true;
            });
            return () => {
                interactionTask.cancel();
            };
        }
    }, [report.pendingFields, didSubscribeToReportTypingEvents, reportID]);

    const oldestReportAction = useMemo(() => reportActions?.at(-1), [reportActions]);

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = useCallback(() => {
        // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
        if (!!network.isOffline || isLoadingOlderReportActions) {
            return;
        }

        // Don't load more chats if we're already at the beginning of the chat history
        if (!oldestReportAction || oldestReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return;
        }
        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
        Report.getOlderActions(reportID);
    }, [isLoadingOlderReportActions, network.isOffline, oldestReportAction, reportID]);

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadNewerChats: LoadNewerChats = useMemo(
        () =>
            lodashThrottle(({distanceFromStart}) => {
                if (isLoadingNewerReportActions || isLoadingInitialReportActions || hasNewestReportAction) {
                    return;
                }

                // Ideally, we wouldn't need to use the 'distanceFromStart' variable. However, due to the low value set for 'maxToRenderPerBatch',
                // the component undergoes frequent re-renders. This frequent re-rendering triggers the 'onStartReached' callback multiple times.
                //
                // To mitigate this issue, we use 'CONST.CHAT_HEADER_LOADER_HEIGHT' as a threshold. This ensures that 'onStartReached' is not
                // triggered unnecessarily when the chat is initially opened or when the user has reached the end of the list but hasn't scrolled further.
                //
                // Additionally, we use throttling on the 'onStartReached' callback to further reduce the frequency of its invocation.
                // This should be removed once the issue of frequent re-renders is resolved.
                //
                // onStartReached is triggered during the first render. Since we use OpenReport on the first render and are confident about the message ordering, we can safely skip this call
                if (isFirstRender.current || distanceFromStart <= CONST.CHAT_HEADER_LOADER_HEIGHT) {
                    isFirstRender.current = false;
                    return;
                }

                Report.getNewerActions(reportID);
            }, 500),
        [isLoadingNewerReportActions, isLoadingInitialReportActions, reportID, hasNewestReportAction],
    );

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = useCallback(() => {
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;
        Timing.end(CONST.TIMING.SWITCH_REPORT, hasCachedActions ? CONST.TIMING.WARM : CONST.TIMING.COLD);

        // Capture the init measurement only once not per each chat switch as the value gets overwritten
        if (!ReportActionsView.initMeasured) {
            Performance.markEnd(CONST.TIMING.REPORT_INITIAL_RENDER);
            ReportActionsView.initMeasured = true;
        } else {
            Performance.markEnd(CONST.TIMING.SWITCH_REPORT);
        }
    }, [hasCachedActions]);

    // Comments have not loaded at all yet do nothing
    if (!reportActions.length) {
        return null;
    }

    return (
        <>
            <ReportActionsList
                report={report}
                parentReportAction={parentReportAction}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={reportActions}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                isLoadingInitialReportActions={isLoadingInitialReportActions}
                isLoadingOlderReportActions={isLoadingOlderReportActions}
                isLoadingNewerReportActions={isLoadingNewerReportActions}
            />
            <PopoverReactionList ref={reactionListRef} />
        </>
    );
}

ReportActionsView.displayName = 'ReportActionsView';
ReportActionsView.initMeasured = false;

function arePropsEqual(oldProps: ReportActionsViewProps, newProps: ReportActionsViewProps): boolean {
    if (!lodashIsEqual(oldProps.reportActions, newProps.reportActions)) {
        return false;
    }

    if (!lodashIsEqual(oldProps.parentReportAction, newProps.parentReportAction)) {
        return false;
    }

    if (oldProps.session?.authTokenType !== newProps.session?.authTokenType) {
        return false;
    }

    if (oldProps.isLoadingInitialReportActions !== newProps.isLoadingInitialReportActions) {
        return false;
    }

    if (oldProps.isLoadingOlderReportActions !== newProps.isLoadingOlderReportActions) {
        return false;
    }

    if (oldProps.isLoadingNewerReportActions !== newProps.isLoadingNewerReportActions) {
        return false;
    }

    return lodashIsEqual(oldProps.report, newProps.report);
}

const MemoizedReportActionsView = React.memo(ReportActionsView, arePropsEqual);

export default Performance.withRenderTrace({id: '<ReportActionsView> rendering'})(
    withOnyx<ReportActionsViewProps, ReportActionsViewOnyxProps>({
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(MemoizedReportActionsView),
);
