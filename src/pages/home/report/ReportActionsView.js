import React from 'react';
import {View, Keyboard, AppState} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import Text from '../../../components/Text';
import withIon from '../../../components/withIon';
import {fetchActions, updateLastReadActionID} from '../../../libs/actions/Report';
import IONKEYS from '../../../IONKEYS';
import ReportActionItem from './ReportActionItem';
import styles from '../../../styles/StyleSheet';
import ReportActionPropTypes from './ReportActionPropTypes';
import {lastItem} from '../../../libs/CollectionUtils';
import Visibility from '../../../libs/Visibility';
import InvertedChatList from '../../../components/InvertedChatList';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    // Is this report currently in view?
    isActiveReport: PropTypes.bool.isRequired,

    /* Ion Props */

    // Array of report actions for this report
    reportActions: PropTypes.objectOf(PropTypes.shape(ReportActionPropTypes)),

    // The session of the logged in person
    session: PropTypes.shape({
        // Email of the logged in person
        email: PropTypes.string,
    }),
};

const defaultProps = {
    reportActions: {},
    session: {},
};

class ReportActionsView extends React.Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.scrollToListBottom = this.scrollToListBottom.bind(this);
        this.recordMaxAction = this.recordMaxAction.bind(this);
        this.sortedReportActions = this.updateSortedReportActions();

        this.state = {
            refetchNeeded: true,
        };
    }

    componentDidMount() {
        this.visibilityChangeEvent = AppState.addEventListener('change', () => {
            if (this.props.isActiveReport && Visibility.isVisible()) {
                setTimeout(this.recordMaxAction, 3000);
            }
        });
        if (this.props.isActiveReport) {
            this.keyboardEvent = Keyboard.addListener('keyboardDidShow', this.scrollToListBottom);
        }

        fetchActions(this.props.reportID);
    }

    componentDidUpdate(prevProps) {
        // If we previously had a value for reportActions but no longer have one
        // this can only mean that the reportActions have been deleted. So we must
        // refetch these actions the next time we switch to this chat.
        if (prevProps.reportActions && !this.props.reportActions) {
            this.setRefetchNeeded(true);
            return;
        }

        if (_.size(prevProps.reportActions) !== _.size(this.props.reportActions)) {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise
            // leave the user positioned where they are now in the list.
            const lastAction = lastItem(this.props.reportActions);
            if (lastAction && (lastAction.actorEmail === this.props.session.email)) {
                this.scrollToListBottom();
            }

            // When the number of actions change, wait three seconds, then record the max action
            // This will make the unread indicator go away if you receive comments in the same chat you're looking at
            if (this.props.isActiveReport && Visibility.isVisible()) {
                setTimeout(this.recordMaxAction, 3000);
            }

            return;
        }

        // If we are switching from not active to active report then mark comments as
        // read and bind the keyboard listener for this report
        if (!prevProps.isActiveReport && this.props.isActiveReport) {
            if (this.state.refetchNeeded) {
                fetchActions(this.props.reportID);
                this.setRefetchNeeded(false);
            }

            this.scrollToListBottom();
            this.recordMaxAction();
            this.keyboardEvent = Keyboard.addListener('keyboardDidShow', this.scrollToListBottom);
        }
    }

    componentWillUnmount() {
        if (this.keyboardEvent) {
            this.keyboardEvent.remove();
        }
        if (this.visibilityChangeEvent) {
            this.visibilityChangeEvent.remove();
        }
    }

    /**
     * When setting to true we will refetch the reportActions
     * the next time this report is switched to.
     *
     * @param {Boolean} refetchNeeded
     */
    setRefetchNeeded(refetchNeeded) {
        this.setState({refetchNeeded});
    }

    /**
     * Updates and sorts the report actions by sequence number
     */
    updateSortedReportActions() {
        this.sortedReportActions = _.chain(this.props.reportActions)
            .sortBy('sequenceNumber')
            .filter(action => action.actionName === 'ADDCOMMENT')
            .map((item, index) => ({action: item, index}))
            .value();
    }

    /**
     * When the bottom of the list is reached, this is triggered, so it's a little different than recording the max
     * action when scrolled
     */
    recordMaxAction() {
        const reportActions = lodashGet(this.props, 'reportActions', {});
        const maxVisibleSequenceNumber = _.chain(reportActions)
            .pluck('sequenceNumber')
            .max()
            .value();

        updateLastReadActionID(this.props.reportID, maxVisibleSequenceNumber);
    }

    /**
     * This function is triggered from the ref callback for the scrollview. That way it can be scrolled once all the
     * items have been rendered. If the number of actions has changed since it was last rendered, then
     * scroll the list to the end.
     */
    scrollToListBottom() {
        if (this.actionListElement) {
            this.actionListElement.scrollToIndex({animated: false, index: 0});
        }
        this.recordMaxAction();
    }

    /**
     * Do not move this or make it an anonymous function it is a method
     * so it will not be recreated each time we render an item
     *
     * See: https://reactnative.dev/docs/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem
     *
     * @param {Object} args
     * @param {Object} args.item
     *
     * @returns {React.Component}
     */
    renderItem({
        item,
        displayAsGroup,
    }) {
        return (
            <ReportActionItem
                action={item.action}
                displayAsGroup={displayAsGroup}
            />
        );
    }

    render() {
        // Comments have not loaded at all yet do nothing
        if (!_.size(this.props.reportActions)) {
            return null;
        }

        // If we only have the created action then no one has left a comment
        if (_.size(this.props.reportActions) === 1) {
            return (
                <View style={[styles.chatContent, styles.chatContentEmpty]}>
                    <Text style={[styles.textP]}>Be the first person to comment!</Text>
                </View>
            );
        }

        this.updateSortedReportActions();
        return (
            <InvertedChatList
                // Cross-platform style take care if modifying this
                contentContainerStyle={[styles.invertedChatListContainerStyle]}
                ref={el => this.actionListElement = el}
                data={this.sortedReportActions}
                renderItem={this.renderItem}
                keyExtractor={item => `${item.action.sequenceNumber}`}
                initialRowHeight={32}
            />
        );
    }
}

ReportActionsView.propTypes = propTypes;
ReportActionsView.defaultProps = defaultProps;

export default withIon({
    reportActions: {
        key: ({reportID}) => `${IONKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        canEvict: props => !props.isActiveReport,
    },
    session: {
        key: IONKEYS.SESSION,
    },
})(ReportActionsView);
