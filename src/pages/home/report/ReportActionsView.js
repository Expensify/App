/* eslint-disable no-else-return */

/* eslint-disable rulesdir/prefer-underscore-method */
import {useIsFocused, useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
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
import useReportScrollManager from '@hooks/useReportScrollManager';
// import useWindowDimensions from '@hooks/useWindowDimensions';
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

/**
 * Get the currently viewed report ID as number
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.reportID
 * @returns {String}
 */
function getReportActionID(route) {
    return {reportActionID: lodashGet(route, 'params.reportActionID', null), reportID: lodashGet(route, 'params.reportID', null)};
}

const useHandleList = (linkedID, messageArray, fetchFn, route, isLoadingLinkedMessage) => {
    const [edgeID, setEdgeID] = useState(linkedID);
    const [listID, setListID] = useState(1);
    const isFirstRender = useRef(true);

    const index = useMemo(() => {
        if (!linkedID) {
            return -1;
        }

        return messageArray.findIndex((obj) => String(obj.reportActionID) === String(edgeID || linkedID));
    }, [messageArray, linkedID, edgeID]);

    useMemo(() => {
        isFirstRender.current = true;
        setEdgeID('');
    }, [route, linkedID]);

    const cattedArray = useMemo(() => {
        if (!linkedID || index === -1) {
            return messageArray;
        }
        if ((linkedID && !edgeID) || (linkedID && isFirstRender.current)) {
            setListID((i) => i + 1);
            isFirstRender.current = false;
            return messageArray.slice(index, messageArray.length);
        } else if (linkedID && edgeID) {
            const amountOfItemsBeforeLinkedOne = 10;
            const newStartIndex = index >= amountOfItemsBeforeLinkedOne ? index - amountOfItemsBeforeLinkedOne : 0;
            if (index) {
                return messageArray.slice(newStartIndex, messageArray.length);
            }
            return messageArray;
        }
        return messageArray;
    }, [linkedID, messageArray, edgeID, index, isLoadingLinkedMessage]);

    const hasMoreCashed = cattedArray.length < messageArray.length;

    const paginate = useCallback(
        ({firstReportActionID, distanceFromStart}) => {
            // This function is a placeholder as the actual pagination is handled by cattedArray
            // It's here if you need to trigger any side effects during pagination
            if (!hasMoreCashed) {
                fetchFn({distanceFromStart});
            }

            setEdgeID(firstReportActionID);
        },
        [setEdgeID, fetchFn, hasMoreCashed],
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
    const reportScrollManager = useReportScrollManager();
    const route = useRoute();
    const {reportActionID} = getReportActionID(route);
    const didLayout = useRef(false);
    const didSubscribeToReportTypingEvents = useRef(false);
    const contentListHeight = useRef(0);
    const layoutListHeight = useRef(0);
    const isInitial = useRef(true);
    // const isLoadingLinkedMessage = !!reportActionID && props.isLoadingInitialReportActions;
    const hasCachedActions = useInitialValue(() => _.size(props.reportActions) > 0);
    const mostRecentIOUReportActionID = useInitialValue(() => ReportActionsUtils.getMostRecentIOURequestActionID(props.reportActions));
    // const {windowHeight} = useWindowDimensions();

    const prevNetworkRef = useRef(props.network);
    const prevAuthTokenType = usePrevious(props.session.authTokenType);

    const prevIsSmallScreenWidthRef = useRef(props.isSmallScreenWidth);

    const isFocused = useIsFocused();
    const reportID = props.report.reportID;

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const throttledLoadNewerChats = useCallback(
        () => {
            if (props.isLoadingNewerReportActions || props.isLoadingInitialReportActions) {
                return;
            }

            // eslint-disable-next-line no-use-before-define
            Report.getNewerActions(reportID, newestReportAction.reportActionID);
        },
        // eslint-disable-next-line no-use-before-define
        [props.isLoadingNewerReportActions, props.isLoadingInitialReportActions, reportID, newestReportAction],
    );

    const {cattedArray: reportActions, fetchFunc, linkedIdIndex, listID} = useHandleList(reportActionID, allReportActions, throttledLoadNewerChats, route);

    const hasNewestReportAction = lodashGet(reportActions[0], 'isNewestReportAction');
    const newestReportAction = lodashGet(reportActions, '[0]');
    const oldestReportAction = _.last(reportActions);
    const isWeReachedTheOldestAction = oldestReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;

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
        Report.openReport({reportID, reportActionID});
    };

    useEffect(() => {
        if (reportActionID) {
            return;
        }
        openReportIfNecessary();

        InteractionManager.runAfterInteractions(() => {
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!reportActionID) {
            return;
        }
        Report.openReport({reportID, reportActionID});
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

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = () => {
        // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
        if (props.network.isOffline || props.isLoadingOlderReportActions) {
            return;
        }

        // Don't load more chats if we're already at the beginning of the chat history
        if (!oldestReportAction || isWeReachedTheOldestAction) {
            return;
        }
        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
        Report.getOlderActions(reportID, oldestReportAction.reportActionID);
    };

    const firstReportActionID = useMemo(() => reportActions[0]?.reportActionID, [reportActions]);
    const handleLoadNewerChats = useCallback(
        // eslint-disable-next-line rulesdir/prefer-early-return
        ({distanceFromStart}) => {
            // const shouldFirstlyLoadOlderActions = Number(layoutListHeight.current) > Number(contentListHeight.current);
            // const DIFF_BETWEEN_SCREEN_HEIGHT_AND_LIST = 164;
            // const SPACER = 30;
            // const MIN_PREDEFINED_PADDING = 16;
            // const isListSmallerThanScreen = windowHeight - DIFF_BETWEEN_SCREEN_HEIGHT_AND_LIST - SPACER > contentListHeight.current;
            // const isListEmpty = contentListHeight.current === MIN_PREDEFINED_PADDING;
            // const shouldFirstlyLoadOlderActions = !isWeReachedTheOldestAction && isListSmallerThanScreen
            // const shouldFirstlyLoadOlderActions = !isListSmallerThanScreen
            if ((reportActionID && linkedIdIndex > -1 && !hasNewestReportAction && !isInitial.current) || (!reportActionID && !hasNewestReportAction)) {
                fetchFunc({firstReportActionID, distanceFromStart});
            }
            isInitial.current = false;
        },
        // [hasNewestReportAction, linkedIdIndex, firstReportActionID, fetchFunc, reportActionID, windowHeight, isWeReachedTheOldestAction],
        [hasNewestReportAction, linkedIdIndex, firstReportActionID, fetchFunc, reportActionID],
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
                reportScrollManager={reportScrollManager}
                policy={props.policy}
                listID={listID}
                onContentSizeChange={onContentSizeChange}
            />
            <PopoverReactionList ref={reactionListRef} />
        </>
    );
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;
ReportActionsView.displayName = 'ReportActionsView';

function arePropsEqual(oldProps, newProps) {
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
        sesion: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MemoizedReportActionsView);
