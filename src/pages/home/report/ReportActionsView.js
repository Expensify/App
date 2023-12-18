/* eslint-disable no-else-return */

/* eslint-disable rulesdir/prefer-underscore-method */
import {useIsFocused, useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
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

const useHandleList = (linkedID, messageArray, fetchFn, route, isLoadingLinkedMessage, cb) => {
    const [edgeID, setEdgeID] = useState(linkedID);
    const prevLinkedID = useRef(linkedID);
    const test = useRef(true);
    // Function to calculate the current slice of the message array

    // const listID = useMemo(() => {
    //     //  return reportActionID || 'list'
    //     console.log('route.key', route);
    //     return route.key + Math.random().toString;
    // }, [route]);

    const index = useMemo(() => {
        if (!linkedID) {
            return -1;
        }

        return messageArray.findIndex((obj) => String(obj.reportActionID) === String(edgeID || linkedID));
    }, [messageArray, linkedID, edgeID, isLoadingLinkedMessage]);

    useEffect(() => {
        console.log('get.useHandleList.setEdgeID_EMPTY', linkedID !== prevLinkedID.current, linkedID, prevLinkedID.current);
        setEdgeID('');
        // if (linkedID !== prevLinkedID.current) {
        //     setEdgeID('');
        //     prevLinkedID.current = linkedID;
        // }
        test.current = false;
    }, [route, linkedID]);

    console.log('get.useHandleList.INFO.index', index);
    console.log('get.useHandleList.INFO.linkedID', linkedID);
    console.log('get.useHandleList.INFO.messageArray', messageArray.length);

    const cattedArray = useMemo(() => {
        if (!linkedID) {
            return messageArray;
        }

        if (index === -1) {
            return messageArray;
        }
        console.log('get.useHandleList.calculateSlice.0.index', index);
        if (linkedID && !edgeID) {
            console.log('get.useHandleList.calculateSlice.1.linkedID', linkedID);
            cb();
            return messageArray.slice(index, messageArray.length);
        } else if (linkedID && edgeID) {
            console.log('get.useHandleList.calculateSlice.2.linkedID_edgeID', linkedID, edgeID);
            const amountOfItemsBeforeLinkedOne = 49;
            const newStartIndex = index >= amountOfItemsBeforeLinkedOne ? index - amountOfItemsBeforeLinkedOne : 0;
            console.log('get.useHandleList.calculateSlice.2.index_newStartIndex', index, newStartIndex);
            if (index) {
                return messageArray.slice(newStartIndex, messageArray.length);
            }
            return messageArray;
        }
        return messageArray;
    }, [linkedID, messageArray, edgeID, index, isLoadingLinkedMessage]);

    // const cattedArray = calculateSlice();

    const hasMoreCashed = cattedArray.length < messageArray.length;

    // Function to handle pagination (dummy in this case, as actual slicing is done in calculateSlice)
    const paginate = useCallback(
        ({firstReportActionID, distanceFromStart}) => {
            // This function is a placeholder as the actual pagination is handled by calculateSlice
            // It's here if you need to trigger any side effects during pagination
            if (!hasMoreCashed) {
                console.log('get.useHandleList.paginate.0.NO_CACHE');
                fetchFn({distanceFromStart});
            }
            console.log('get.useHandleList.paginate.1.firstReportActionID');
            setEdgeID(firstReportActionID);
        },
        [setEdgeID, fetchFn, hasMoreCashed],
    );

    return {
        cattedArray,
        fetchFunc: paginate,
        linkedIdIndex: index,
        setNull: () => {
            setEdgeID('');
        },
    };
};

function ReportActionsView({reportActions: allReportActions, fetchReport, ...props}) {
    useCopySelectionHelper();
    const reactionListRef = useContext(ReactionListContext);
    const reportScrollManager = useReportScrollManager();
    const {scrollToBottom} = reportScrollManager;
    const route = useRoute();
    const {reportActionID} = getReportActionID(route);
    const didLayout = useRef(false);
    const didSubscribeToReportTypingEvents = useRef(false);
    // const isFirstRender = useRef(true);

    const [listID, setListID] = useState('1');
    const [isLinkingLoading, setLinkingLoading] = useState(!!reportActionID);
    const isLoadingLinkedMessage = !!reportActionID && props.isLoadingInitialReportActions;

    console.log('get.isLoadingLinkedMessage', isLoadingLinkedMessage);
    // const {catted: reportActionsBeforeAndIncludingLinked, expanded: reportActionsBeforeAndIncludingLinkedExpanded} = useMemo(() => {
    //     if (reportActionID && allReportActions?.length) {
    //         return ReportActionsUtils.getSlicedRangeFromArrayByID(allReportActions, reportActionID);
    //     }
    //     // catted means the reportActions before and including the linked message
    //     // expanded means the reportActions before and including the linked message plus the next 5
    //     return {catted: [], expanded: []};
    // }, [allReportActions, reportActionID]);

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const throttledLoadNewerChats = useCallback(
        ({distanceFromStart}) => {
            console.log('get.throttledLoadNewerChats.0');
            // return null;
            if (props.isLoadingNewerReportActions || props.isLoadingInitialReportActions) {
                return;
            }
            console.log('get.throttledLoadNewerChats.1');

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
            // if (isFirstRender.current || isLinkingToExtendedMessage || distanceFromStart <= CONST.CHAT_HEADER_LOADER_HEIGHT) {
            // if (isLinkingToExtendedMessage) {
            //     console.log('get.throttledLoadNewerChats.2', isFirstRender.current, isLinkingToExtendedMessage, distanceFromStart <= CONST.CHAT_HEADER_LOADER_HEIGHT, distanceFromStart);
            //     // isFirstRender.current = false;
            //     return;
            // }

            console.log('get.throttledLoadNewerChats.3');
            const newestReportAction = reportActions[0];
            Report.getNewerActions(reportID, newestReportAction.reportActionID);
        },
        // [props.isLoadingNewerReportActions, props.isLoadingInitialReportActions, reportID, reportActions, hasNewestReportAction],
        [props.isLoadingNewerReportActions, props.isLoadingInitialReportActions, reportID, reportActions],
    );
    const triggerList = useCallback(() => {
      setListID(id => id + 1)
    },[setListID])

    const {
        cattedArray: reportActions,
        fetchFunc,
        linkedIdIndex,
        setNull,
    } = useHandleList(
        reportActionID,
        allReportActions,
        throttledLoadNewerChats,
        route,
        isLoadingLinkedMessage,
        triggerList
    );

    useEffect(() => {
        console.log('get.useEffect.reportActionID', reportActionID);
        if (!reportActionID) {
            return;
        }
        console.log('get.useEffect.route', JSON.stringify(route));
        fetchReport();
        // setNull()
        // setListID(`${route.key}_${reportActionID}` )
    }, [route, reportActionID, fetchReport, scrollToBottom]);

    const hasCachedActions = useInitialValue(() => _.size(props.reportActions) > 0);
    const mostRecentIOUReportActionID = useInitialValue(() => ReportActionsUtils.getMostRecentIOURequestActionID(props.reportActions));

    const prevNetworkRef = useRef(props.network);
    const prevAuthTokenType = usePrevious(props.session.authTokenType);

    const prevIsSmallScreenWidthRef = useRef(props.isSmallScreenWidth);

    const isFocused = useIsFocused();
    const reportID = props.report.reportID;
    const hasNewestReportAction = lodashGet(reportActions[0], 'isNewestReportAction');

    // const listID = useMemo(
    //     () =>
    //         // return reportActionID || 'list';
    //         // console.log('route.key', route);
    //         `${route.key}_${reportActionID}`,
    //     // `${route.key}`,
    //     [reportActionID, route, isLinkingLoading],
    // );
    // useEffect(() => {
    //     scrollToBottom();
    // }, [listID, scrollToBottom]);

    useEffect(() => {
        if (!reportActionID) {
            return;
        }
        setLinkingLoading(!!reportActionID);
    }, [route, reportActionID]);

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
        openReportIfNecessary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = () => {
        // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
        if (props.network.isOffline || props.isLoadingOlderReportActions) {
            return;
        }

        const oldestReportAction = _.last(reportActions);

        // Don't load more chats if we're already at the beginning of the chat history
        if (!oldestReportAction || oldestReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return;
        }
        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
        Report.getOlderActions(reportID, oldestReportAction.reportActionID);
    };

    const firstReportActionID = useMemo(() => reportActions[0]?.reportActionID, [reportActions]);
    const handleLoadNewerChats = useCallback(
        ({distanceFromStart}) => {
            if ((reportActionID && linkedIdIndex > -1) || (!reportActionID && !hasNewestReportAction)) {
                setLinkingLoading(false);
                fetchFunc({firstReportActionID, distanceFromStart});
            }
        },
        [hasNewestReportAction, linkedIdIndex, firstReportActionID, fetchFunc, reportActionID],
    );

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = () => {
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
    };

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
