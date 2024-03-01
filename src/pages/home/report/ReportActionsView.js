import {useIsFocused, useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useInitialValue from '@hooks/useInitialValue';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import getIsReportFullyVisible from '@libs/getIsReportFullyVisible';
import Performance from '@libs/Performance';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import {isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import {didUserLogInDuringSession} from '@libs/SessionUtils';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import reportPropTypes from '@pages/reportPropTypes';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import getInitialPaginationSize from './getInitialPaginationSize';
import PopoverReactionList from './ReactionList/PopoverReactionList';
import reportActionPropTypes from './reportActionPropTypes';
import ReportActionsList from './ReportActionsList';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** The report's parentReportAction */
    parentReportAction: PropTypes.shape(reportActionPropTypes),

    /** The report metadata loading states */
    isLoadingInitialReportActions: PropTypes.bool,

    /** The report actions are loading more data */
    isLoadingOlderReportActions: PropTypes.bool,

    /** The report actions are loading newer data */
    isLoadingNewerReportActions: PropTypes.bool,

    /** Whether the composer is full size */
    /* eslint-disable-next-line react/no-unused-prop-types */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    reportActions: [],
    policy: null,
    isLoadingInitialReportActions: false,
    isLoadingOlderReportActions: false,
    isLoadingNewerReportActions: false,
    session: {
        authTokenType: '',
    },
    parentReportAction: {},
};

const DIFF_BETWEEN_SCREEN_HEIGHT_AND_LIST = 120;
const SPACER = 16;

let listIDCount = Math.round(Math.random() * 100);

/**
 * usePaginatedReportActionList manages the logic for handling a list of messages with pagination and dynamic loading.
 * It determines the part of the message array to display ('visibleReportActions') based on the current linked message,
 * and manages pagination through 'handleReportActionPagination' function.
 *
 * @param {string} linkedID - ID of the linked message used for initial focus.
 * @param {array} allReportActions - Array of messages.
 * @param {function} fetchNewerReportActions - Function to fetch more messages.
 * @param {string} route - Current route, used to reset states on route change.
 * @param {boolean} isLoading - Loading state indicator.
 * @param {boolean} triggerListID - Used to trigger a listID change.
 * @returns {object} An object containing the sliced message array, the pagination function,
 *                   index of the linked message, and a unique list ID.
 */
const usePaginatedReportActionList = (linkedID, allReportActions, fetchNewerReportActions, route, isLoading, triggerListID) => {
    // triggerListID is used when navigating to a chat with messages loaded from LHN. Typically, these include thread actions, task actions, etc. Since these messages aren't the latest, we don't maintain their position and instead trigger a recalculation of their positioning in the list.
    // we don't set currentReportActionID on initial render as linkedID as it should trigger visibleReportActions after linked message was positioned
    const [currentReportActionID, setCurrentReportActionID] = useState('');
    const isFirstLinkedActionRender = useRef(true);

    useLayoutEffect(() => {
        setCurrentReportActionID('');
    }, [route]);

    const listID = useMemo(() => {
        isFirstLinkedActionRender.current = true;
        listIDCount += 1;
        return listIDCount;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, triggerListID]);

    const index = useMemo(() => {
        if (!linkedID || isLoading) {
            return -1;
        }

        return _.findIndex(allReportActions, (obj) => String(obj.reportActionID) === String(isFirstLinkedActionRender.current ? linkedID : currentReportActionID));
    }, [allReportActions, currentReportActionID, linkedID, isLoading]);

    const visibleReportActions = useMemo(() => {
        if (!linkedID) {
            return allReportActions;
        }
        if (isLoading || index === -1) {
            return [];
        }

        if (isFirstLinkedActionRender.current) {
            return allReportActions.slice(index, allReportActions.length);
        }
        const paginationSize = getInitialPaginationSize();
        const newStartIndex = index >= paginationSize ? index - paginationSize : 0;
        return newStartIndex ? allReportActions.slice(newStartIndex, allReportActions.length) : allReportActions;
        // currentReportActionID is needed to trigger batching once the report action has been positioned
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkedID, allReportActions, index, isLoading, currentReportActionID]);

    const hasMoreCached = visibleReportActions.length < allReportActions.length;
    const newestReportAction = lodashGet(visibleReportActions, '[0]');

    const handleReportActionPagination = useCallback(
        ({firstReportActionID}) => {
            // This function is a placeholder as the actual pagination is handled by visibleReportActions
            if (!hasMoreCached) {
                isFirstLinkedActionRender.current = false;
                fetchNewerReportActions(newestReportAction);
            }
            if (isFirstLinkedActionRender.current) {
                isFirstLinkedActionRender.current = false;
            }
            setCurrentReportActionID(firstReportActionID);
        },
        [fetchNewerReportActions, hasMoreCached, newestReportAction],
    );

    return {
        visibleReportActions,
        loadMoreReportActionsHandler: handleReportActionPagination,
        linkedIdIndex: index,
        listID,
    };
};

function ReportActionsView({reportActions: allReportActions, ...props}) {
    useCopySelectionHelper();
    const reactionListRef = useContext(ReactionListContext);
    const route = useRoute();
    const reportActionID = lodashGet(route, 'params.reportActionID', null);
    const didLayout = useRef(false);
    const didSubscribeToReportTypingEvents = useRef(false);

    const contentListHeight = useRef(0);
    const layoutListHeight = useRef(0);
    const {windowHeight} = useWindowDimensions();
    const isFocused = useIsFocused();
    const mostRecentIOUReportActionID = useMemo(() => ReportActionsUtils.getMostRecentIOURequestActionID(props.reportActions), [props.reportActions]);
    const prevNetworkRef = useRef(props.network);
    const prevAuthTokenType = usePrevious(props.session.authTokenType);
    const [isInitialLinkedView, setIsInitialLinkedView] = useState(!!reportActionID);
    const prevIsSmallScreenWidthRef = useRef(props.isSmallScreenWidth);
    const reportID = props.report.reportID;
    const isLoading = (!!reportActionID && props.isLoadingInitialReportActions) || !props.isReadyForCommentLinking;

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const fetchNewerAction = useCallback(
        (newestReportAction) => {
            if (props.isLoadingNewerReportActions || props.isLoadingInitialReportActions) {
                return;
            }

            Report.getNewerActions(reportID, newestReportAction.reportActionID);
        },
        [props.isLoadingNewerReportActions, props.isLoadingInitialReportActions, reportID],
    );

    const {
        visibleReportActions: reportActions,
        loadMoreReportActionsHandler,
        linkedIdIndex,
        listID,
    } = usePaginatedReportActionList(reportActionID, allReportActions, fetchNewerAction, route, isLoading, props.isLoadingInitialReportActions);
    const hasCachedActions = useInitialValue(() => _.size(reportActions) > 0);
    const hasNewestReportAction = lodashGet(reportActions, ['0', 'created']) === props.report.lastVisibleActionCreated;
    const newestReportAction = lodashGet(reportActions, ['0']);
    const oldestReportAction = useMemo(() => _.last(reportActions), [reportActions]);
    const hasCreatedAction = lodashGet(oldestReportAction, 'actionName') === CONST.REPORT.ACTIONS.TYPE.CREATED;
    const firstReportActionName = lodashGet(reportActions, ['0', 'actionName']);

    /**
     * @returns {Boolean}
     */
    const isReportFullyVisible = useMemo(() => getIsReportFullyVisible(isFocused), [isFocused]);

    const openReportIfNecessary = () => {
        const createChatError = _.get(props.report, ['errorFields', 'createChat']);
        // If the report is optimistic (AKA not yet created) we don't need to call openReport again
        if (props.report.isOptimisticReport || !_.isEmpty(createChatError)) {
            return;
        }

        Report.openReport(reportID, reportActionID);
    };

    useEffect(() => {
        if (reportActionID) {
            return;
        }
        openReportIfNecessary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!reportActionID) {
            return;
        }

        // This function is triggered when a user clicks on a link to navigate to a report.
        // For each link click, we retrieve the report data again, even though it may already be cached.
        // There should be only one openReport execution per page start or navigating
        Report.openReport(reportID, reportActionID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route]);

    useEffect(() => {
        const prevNetwork = prevNetworkRef.current;
        // When returning from offline to online state we want to trigger a request to OpenReport which
        // will fetch the reportActions data and mark the report as read. If the report is not fully visible
        // then we call ReconnectToReport which only loads the reportActions data without marking the report as read.
        const wasNetworkChangeDetected = lodashGet(prevNetwork, 'isOffline') && !lodashGet(props.network, 'isOffline');
        if (wasNetworkChangeDetected) {
            if (isReportFullyVisible) {
                openReportIfNecessary();
            } else {
                Report.reconnect(reportID);
            }
        }
        // update ref with current network state
        prevNetworkRef.current = props.network;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.network, isReportFullyVisible]);

    useEffect(() => {
        const wasLoginChangedDetected = prevAuthTokenType === 'anonymousAccount' && !props.session.authTokenType;
        if (wasLoginChangedDetected && didUserLogInDuringSession() && isUserCreatedPolicyRoom(props.report)) {
            if (isReportFullyVisible) {
                openReportIfNecessary();
            } else {
                Report.reconnect(reportID);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.session, props.report, isReportFullyVisible]);

    useEffect(() => {
        const prevIsSmallScreenWidth = prevIsSmallScreenWidthRef.current;
        // If the view is expanded from mobile to desktop layout
        // we update the new marker position, mark the report as read, and fetch new report actions
        const didScreenSizeIncrease = prevIsSmallScreenWidth && !props.isSmallScreenWidth;
        const didReportBecomeVisible = isReportFullyVisible && didScreenSizeIncrease;
        if (didReportBecomeVisible) {
            openReportIfNecessary();
        }
        // update ref with current state
        prevIsSmallScreenWidthRef.current = props.isSmallScreenWidth;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isSmallScreenWidth, reportActions, isReportFullyVisible]);

    useEffect(() => {
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !props.report.pendingFields || (!props.report.pendingFields.addWorkspaceRoom && !props.report.pendingFields.createChat);
        if (!didSubscribeToReportTypingEvents.current && didCreateReportSuccessfully) {
            Report.subscribeToReportTypingEvents(reportID);
            didSubscribeToReportTypingEvents.current = true;
        }
    }, [props.report.pendingFields, didSubscribeToReportTypingEvents, reportID]);

    const onContentSizeChange = useCallback((w, h) => {
        contentListHeight.current = h;
    }, []);

    const checkIfContentSmallerThanList = useCallback(() => windowHeight - DIFF_BETWEEN_SCREEN_HEIGHT_AND_LIST - SPACER > contentListHeight.current, [windowHeight]);

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = useCallback(() => {
        // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
        if (props.network.isOffline || props.isLoadingOlderReportActions || props.isLoadingInitialReportActions) {
            return;
        }

        // Don't load more chats if we're already at the beginning of the chat history
        if (!oldestReportAction || hasCreatedAction) {
            return;
        }
        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
        Report.getOlderActions(reportID, oldestReportAction.reportActionID);
    }, [props.network.isOffline, props.isLoadingOlderReportActions, props.isLoadingInitialReportActions, oldestReportAction, hasCreatedAction, reportID]);

    const firstReportActionID = useMemo(() => lodashGet(newestReportAction, 'reportActionID'), [newestReportAction]);
    const loadNewerChats = useCallback(
        // eslint-disable-next-line rulesdir/prefer-early-return
        () => {
            if (
                props.isLoadingInitialReportActions ||
                props.isLoadingOlderReportActions ||
                props.network.isOffline ||
                newestReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
            ) {
                return;
            }
            // Determines if loading older reports is necessary when the content is smaller than the list
            // and there are fewer than 23 items, indicating we've reached the oldest message.
            const isLoadingOlderReportsFirstNeeded = checkIfContentSmallerThanList() && reportActions.length > 23;

            if (
                (reportActionID && linkedIdIndex > -1 && !hasNewestReportAction && !isLoadingOlderReportsFirstNeeded) ||
                (!reportActionID && !hasNewestReportAction && !isLoadingOlderReportsFirstNeeded)
            ) {
                loadMoreReportActionsHandler({firstReportActionID});
            }
        },
        [
            props.isLoadingInitialReportActions,
            props.isLoadingOlderReportActions,
            checkIfContentSmallerThanList,
            reportActionID,
            linkedIdIndex,
            hasNewestReportAction,
            loadMoreReportActionsHandler,
            firstReportActionID,
            props.network.isOffline,
            reportActions.length,
            newestReportAction,
        ],
    );

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = useCallback(
        (e) => {
            layoutListHeight.current = e.nativeEvent.layout.height;

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
        },
        [hasCachedActions],
    );

    useEffect(() => {
        // Temporary solution for handling REPORTPREVIEW. More details: https://expensify.slack.com/archives/C035J5C9FAP/p1705417778466539?thread_ts=1705035404.136629&cid=C035J5C9FAP
        // This code should be removed once REPORTPREVIEW is no longer repositioned.
        // We need to call openReport for gaps created by moving REPORTPREVIEW, which causes mismatches in previousReportActionID and reportActionID of adjacent reportActions. The server returns the correct sequence, allowing us to overwrite incorrect data with the correct one.
        const shouldOpenReport =
            firstReportActionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW &&
            !hasCreatedAction &&
            props.isReadyForCommentLinking &&
            reportActions.length < 24 &&
            reportActions.length >= 1 &&
            !props.isLoadingInitialReportAction &&
            !props.isLoadingOlderReportActions &&
            !props.isLoadingNewerReportActions;

        if (shouldOpenReport) {
            Report.openReport(reportID, reportActionID);
        }
    }, [
        hasCreatedAction,
        reportID,
        reportActions,
        reportActionID,
        firstReportActionName,
        props.isReadyForCommentLinking,
        props.isLoadingOlderReportActions,
        props.isLoadingNewerReportActions,
        props.isLoadingInitialReportAction,
    ]);

    // Check if the first report action in the list is the one we're currently linked to
    const isTheFirstReportActionIsLinked = firstReportActionID === reportActionID;

    useEffect(() => {
        let timerId;

        if (isTheFirstReportActionIsLinked) {
            setIsInitialLinkedView(true);
        } else {
            // After navigating to the linked reportAction, apply this to correctly set
            // `autoscrollToTopThreshold` prop when linking to a specific reportAction.
            InteractionManager.runAfterInteractions(() => {
                // Using a short delay to ensure the view is updated after interactions
                timerId = setTimeout(() => setIsInitialLinkedView(false), 10);
            });
        }

        return () => {
            if (!timerId) {
                return;
            }
            clearTimeout(timerId);
        };
    }, [isTheFirstReportActionIsLinked]);

    // Comments have not loaded at all yet do nothing
    if (!_.size(reportActions)) {
        return null;
    }
    // AutoScroll is disabled when we do linking to a specific reportAction
    const shouldEnableAutoScroll = hasNewestReportAction && (!reportActionID || !isInitialLinkedView);

    return (
        <>
            <ReportActionsList
                report={props.report}
                parentReportAction={props.parentReportAction}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={reportActions}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                isLinkingLoader={!!reportActionID && props.isLoadingInitialReportActions}
                isLoadingInitialReportActions={props.isLoadingInitialReportActions}
                isLoadingOlderReportActions={props.isLoadingOlderReportActions}
                isLoadingNewerReportActions={props.isLoadingNewerReportActions}
                policy={props.policy}
                listID={listID}
                onContentSizeChange={onContentSizeChange}
                shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScroll}
            />
            <PopoverReactionList ref={reactionListRef} />
        </>
    );
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;
ReportActionsView.displayName = 'ReportActionsView';

function arePropsEqual(oldProps, newProps) {
    if (!_.isEqual(oldProps.isReadyForCommentLinking, newProps.isReadyForCommentLinking)) {
        return false;
    }
    if (!_.isEqual(oldProps.reportActions, newProps.reportActions)) {
        return false;
    }

    if (!_.isEqual(oldProps.parentReportAction, newProps.parentReportAction)) {
        return false;
    }

    if (lodashGet(oldProps.network, 'isOffline') !== lodashGet(newProps.network, 'isOffline')) {
        return false;
    }

    if (lodashGet(oldProps.session, 'authTokenType') !== lodashGet(newProps.session, 'authTokenType')) {
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

    if (newProps.isSmallScreenWidth !== oldProps.isSmallScreenWidth) {
        return false;
    }

    if (newProps.isComposerFullSize !== oldProps.isComposerFullSize) {
        return false;
    }

    if (lodashGet(newProps, 'policy.avatar') !== lodashGet(oldProps, 'policy.avatar')) {
        return false;
    }

    if (lodashGet(newProps, 'policy.name') !== lodashGet(oldProps, 'policy.name')) {
        return false;
    }

    return _.isEqual(oldProps.report, newProps.report);
}

const MemoizedReportActionsView = React.memo(ReportActionsView, arePropsEqual);

export default compose(
    Performance.withRenderTrace({id: '<ReportActionsView> rendering'}),
    withWindowDimensions,
    withLocalize,
    withNetwork(),
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MemoizedReportActionsView);
