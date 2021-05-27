import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import ReportActionPropTypes from '../home/report/ReportActionPropTypes';
import ReportTransaction from '../../components/ReportTransaction';

const propTypes = {
    /** Actions from the ChatReport */
    reportActions: PropTypes.shape(ReportActionPropTypes),

    /** ReportID for the associated chat report */
    chatReportID: PropTypes.number.isRequired,

    /** ReportID for the associated IOU report */
    iouReportID: PropTypes.number.isRequired,

    /** Email for the authenticated user */
    userEmail: PropTypes.string.isRequired,

    /** Has the iouReport been paid? */
    isReportPaid: PropTypes.bool,
};

const defaultProps = {
    reportActions: {},
    isReportPaid: false,
};

class IOUTransactions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rejectableTransactionIDs: [],
        };

        this.updateRejectableTransactions = this.updateRejectableTransactions.bind(this);
    }

    componentDidMount() {
        this.updateRejectableTransactions();
    }

    componentDidUpdate(oldProps) {
        if (oldProps.reportActions !== this.props.reportActions) {
            this.updateRejectableTransactions();
        }
    }

    /**
     * Update the rejectableTransactionIDs state array. A transaction must meet multiple requirements in order to be
     * rejectable. We must exclude transactions not associated with the iouReportID, actions which have already been
     * rejected, and those which are not of type 'create').
     */
    updateRejectableTransactions() {
        if (this.props.isReportPaid) {
            this.setState({rejectableTransactionIDs: []});
            return;
        }

        const actionsForIOUReport = _.filter(this.props.reportActions, action => action.originalMessage
            && action.originalMessage.type && action.originalMessage.IOUReportID === this.props.iouReportID);

        const rejectedTransactions = _.filter(actionsForIOUReport, action => ['cancel', 'decline']
            .includes(action.originalMessage.type));

        const rejectedTransactionIDs = _.map(rejectedTransactions, rejectedTransaction => Number(lodashGet(
            rejectedTransaction, 'originalMessage.IOUTransactionID', 0,
        )));

        const rejectableTransactions = _.filter(actionsForIOUReport, (action) => {
            if (action.originalMessage.type !== 'create') {
                return;
            }
            return !rejectedTransactionIDs.includes(action.originalMessage.IOUTransactionID);
        });

        const rejectableTransactionIDs = _.map(rejectableTransactions, transaction => lodashGet(
            transaction, 'originalMessage.IOUTransactionID', 0,
        ));

        this.setState({rejectableTransactionIDs});
    }

    render() {
        return (
            <View style={[styles.mt3]}>
                {_.map(this.props.reportActions, (reportAction) => {
                    if (reportAction.originalMessage
                        && reportAction.originalMessage.IOUReportID === this.props.iouReportID) {
                        const isRejectable = this.state.rejectableTransactionIDs.includes(
                            reportAction.originalMessage.IOUTransactionID,
                        );
                        const isTransactionCreator = this.props.userEmail === reportAction.actorEmail;
                        return (
                            <ReportTransaction
                                chatReportID={this.props.chatReportID}
                                iouReportID={this.props.iouReportID}
                                action={reportAction}
                                key={reportAction.sequenceNumber}
                                isRejectable={isRejectable}
                                isTransactionCreator={isTransactionCreator}
                            />
                        );
                    }
                })}
            </View>
        );
    }
}

IOUTransactions.defaultProps = defaultProps;
IOUTransactions.propTypes = propTypes;
export default withOnyx({
    reportActions: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        canEvict: false,
    },
})(IOUTransactions);
