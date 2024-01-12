import {useIsFocused, useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useInitialValue from '@hooks/useInitialValue';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
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
import PopoverReactionList from './ReactionList/PopoverReactionList';
import reportActionPropTypes from './reportActionPropTypes';
import ReportActionsList from './ReportActionsList';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

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
};

const DIFF_BETWEEN_SCREEN_HEIGHT_AND_LIST = 120;
const SPACER = 16;
const PAGINATION_SIZE = 15;

let listIDCount = Math.round(Math.random() * 100);

/**
 * useHandleList manages the logic for handling a list of messages with pagination and dynamic loading.
 * It determines the part of the message array to display ('cattedArray') based on the current linked message,
 * and manages pagination through 'paginate' function.
 *
 * @param {string} linkedID - ID of the linked message used for initial focus.
 * @param {array} messageArray - Array of messages.
 * @param {function} fetchNewerActon - Function to fetch more messages.
 * @param {string} route - Current route, used to reset states on route change.
 * @param {boolean} isLoading - Loading state indicator.
 * @returns {object} An object containing the sliced message array, the pagination function,
 *                   index of the linked message, and a unique list ID.
 */
const useHandleList = (linkedID, messageArray, fetchNewerActon, route, isLoading) => {
    // we don't set edgeID on initial render as linkedID as it should trigger cattedArray after linked message was positioned
    const [edgeID, setEdgeID] = useState('');
    const isCuttingForFirstRender = useRef(true);

    useLayoutEffect(() => {
        setEdgeID('');
    }, [route]);

    const listID = useMemo(() => {
        isCuttingForFirstRender.current = true;
        listIDCount += 1;
        return listIDCount;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route]);

    const index = useMemo(() => {
        if (!linkedID || isLoading) {
            return -1;
        }

        return _.findIndex(messageArray, (obj) => String(obj.reportActionID) === String(isCuttingForFirstRender.current ? linkedID : edgeID));
    }, [messageArray, edgeID, linkedID, isLoading]);

    const cattedArray = useMemo(() => {
        if (!linkedID) {
            return messageArray;
        }
        if (isLoading || index === -1) {
            return [];
        }

        if (isCuttingForFirstRender.current) {
            return messageArray.slice(index, messageArray.length);
        }
        const newStartIndex = index >= PAGINATION_SIZE ? index - PAGINATION_SIZE : 0;
        return newStartIndex ? messageArray.slice(newStartIndex, messageArray.length) : messageArray;
        // edgeID is needed to trigger batching once the report action has been positioned
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkedID, messageArray, index, isLoading, edgeID]);

    const hasMoreCached = cattedArray.length < messageArray.length;
    const newestReportAction = lodashGet(cattedArray, '[0]');

    const paginate = useCallback(
        ({firstReportActionID}) => {
            // This function is a placeholder as the actual pagination is handled by cattedArray
            if (!hasMoreCached) {
                isCuttingForFirstRender.current = false;
                fetchNewerActon(newestReportAction);
            }
            if (isCuttingForFirstRender.current) {
                isCuttingForFirstRender.current = false;
            }
            setEdgeID(firstReportActionID);
        },
        [fetchNewerActon, hasMoreCached, newestReportAction],
    );

    return {
        cattedArray,
        fetchFunc: paginate,
        linkedIdIndex: index,
        listID,
    };
};

function ReportActionsView({reportActions: allReportActions, fetchReport, ...props}) {
    useCopySelectionHelper();
    const reactionListRef = useContext(ReactionListContext);
    const route = useRoute();
    const reportScrollManager = useReportScrollManager();
    const reportActionID = lodashGet(route, 'params.reportActionID', null);
    const didLayout = useRef(false);
    const didSubscribeToReportTypingEvents = useRef(false);
    const contentListHeight = useRef(0);
    const layoutListHeight = useRef(0);
    const hasCachedActions = useInitialValue(() => _.size(props.reportActions) > 0);
    const mostRecentIOUReportActionID = useInitialValue(() => ReportActionsUtils.getMostRecentIOURequestActionID(props.reportActions));
    const {windowHeight} = useWindowDimensions();
    const isFocused = useIsFocused();

    const prevNetworkRef = useRef(props.network);
    const prevAuthTokenType = usePrevious(props.session.authTokenType);

    const prevIsSmallScreenWidthRef = useRef(props.isSmallScreenWidth);
    const reportID = props.report.reportID;
    const isLoading = (!!reportActionID && props.isLoadingInitialReportActions)|| !props.isContentReady;

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
        cattedArray: reportActions,
        fetchFunc,
        linkedIdIndex,
        listID,
    } = useHandleList(reportActionID, allReportActions, fetchNewerAction, route, isLoading);

    const hasNewestReportAction = lodashGet(reportActions[0], 'created') === props.report.lastVisibleActionCreated;
    const newestReportAction = lodashGet(reportActions, '[0]');
    const oldestReportAction = useMemo(() => _.last(reportActions), [reportActions]);
    const hasCreatedAction = lodashGet(oldestReportAction, 'actionName') === CONST.REPORT.ACTIONS.TYPE.CREATED;

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
    }, [props.network, props.report, isReportFullyVisible]);

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
    }, [props.isSmallScreenWidth, props.report, reportActions, isReportFullyVisible]);

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
    }, [props.report, didSubscribeToReportTypingEvents, reportID]);

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
        if (props.network.isOffline || props.isLoadingOlderReportActions) {
            return;
        }

        // Don't load more chats if we're already at the beginning of the chat history
        if (!oldestReportAction || hasCreatedAction) {
            return;
        }
        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
        Report.getOlderActions(reportID, oldestReportAction.reportActionID);
    }, [props.network.isOffline, props.isLoadingOlderReportActions, oldestReportAction, hasCreatedAction, reportID]);

    const firstReportActionID = useMemo(() => lodashGet(newestReportAction, 'reportActionID'), [newestReportAction]);
    const handleLoadNewerChats = useCallback(
        // eslint-disable-next-line rulesdir/prefer-early-return
        () => {
            if (props.isLoadingInitialReportActions || props.isLoadingOlderReportActions || props.network.isOffline) {
                return;
            }
            const isContentSmallerThanList = checkIfContentSmallerThanList();
            if ((reportActionID && linkedIdIndex > -1 && !hasNewestReportAction && !isContentSmallerThanList) || (!reportActionID && !hasNewestReportAction && !isContentSmallerThanList)) {
                fetchFunc({firstReportActionID});
            }
        },
        [
            props.isLoadingInitialReportActions,
            props.isLoadingOlderReportActions,
            checkIfContentSmallerThanList,
            reportActionID,
            linkedIdIndex,
            hasNewestReportAction,
            fetchFunc,
            firstReportActionID,
            props.network.isOffline,
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

    // Comments have not loaded at all yet do nothing
    if (!_.size(reportActions)) {
        return null;
    }

    return (
        <>
            <ReportActionsList
                report={props.report}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={reportActions}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                loadOlderChats={loadOlderChats}
                loadNewerChats={handleLoadNewerChats}
                isLinkingLoader={!!reportActionID && props.isLoadingInitialReportActions}
                isLoadingInitialReportActions={props.isLoadingInitialReportActions}
                isLoadingOlderReportActions={props.isLoadingOlderReportActions}
                isLoadingNewerReportActions={props.isLoadingNewerReportActions}
                policy={props.policy}
                listID={listID}
                onContentSizeChange={onContentSizeChange}
                reportScrollManager={reportScrollManager}
            />
            <PopoverReactionList ref={reactionListRef} />
        </>
    );
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;
ReportActionsView.displayName = 'ReportActionsView';

function arePropsEqual(oldProps, newProps) {
    if (!_.isEqual(oldProps.isContentReady, newProps.isContentReady)) {
        return false;
    }
    if (!_.isEqual(oldProps.reportActions, newProps.reportActions)) {
        return false;
    }

    if (!_.isEqual(oldProps.report.pendingFields, newProps.report.pendingFields)) {
        return false;
    }

    if (!_.isEqual(oldProps.report.errorFields, newProps.report.errorFields)) {
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

    if (oldProps.isLoadingNewerReportActions !== newProps.isLoadingNewerReportActions) {
        return false;
    }

    if (oldProps.report.lastReadTime !== newProps.report.lastReadTime) {
        return false;
    }

    if (newProps.isSmallScreenWidth !== oldProps.isSmallScreenWidth) {
        return false;
    }

    if (newProps.isComposerFullSize !== oldProps.isComposerFullSize) {
        return false;
    }

    if (lodashGet(newProps.report, 'statusNum') !== lodashGet(oldProps.report, 'statusNum') || lodashGet(newProps.report, 'stateNum') !== lodashGet(oldProps.report, 'stateNum')) {
        return false;
    }

    if (lodashGet(newProps, 'policy.avatar') !== lodashGet(oldProps, 'policy.avatar')) {
        return false;
    }

    if (lodashGet(newProps, 'policy.name') !== lodashGet(oldProps, 'policy.name')) {
        return false;
    }

    if (lodashGet(newProps, 'report.reportName') !== lodashGet(oldProps, 'report.reportName')) {
        return false;
    }

    if (lodashGet(newProps, 'report.description') !== lodashGet(oldProps, 'report.description')) {
        return false;
    }

    if (lodashGet(newProps, 'report.managerID') !== lodashGet(oldProps, 'report.managerID')) {
        return false;
    }

    if (lodashGet(newProps, 'report.total') !== lodashGet(oldProps, 'report.total')) {
        return false;
    }

    if (lodashGet(newProps, 'report.nonReimbursableTotal') !== lodashGet(oldProps, 'report.nonReimbursableTotal')) {
        return false;
    }

    if (lodashGet(newProps, 'report.writeCapability') !== lodashGet(oldProps, 'report.writeCapability')) {
        return false;
    }

    if (lodashGet(newProps, 'report.participantAccountIDs', 0) !== lodashGet(oldProps, 'report.participantAccountIDs', 0)) {
        return false;
    }

    return _.isEqual(lodashGet(newProps.report, 'icons', []), lodashGet(oldProps.report, 'icons', []));
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
