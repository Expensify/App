import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
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

    /** Does the associaed have an outstanding IOU? */
    hasOutstandingIOU: PropTypes.bool,

    /** IOU Report data object */
    iouReport: PropTypes.shape({
        /** The report ID of the IOU */
        reportID: PropTypes.number,

        /** The report ID of the chat associated with the IOU */
        chatReportID: PropTypes.number,

        /** The total amount in cents */
        total: PropTypes.number,

        /** The owner of the IOUReport */
        ownerEmail: PropTypes.string,

        /** The currency of the IOUReport */
        currency: PropTypes.string,
    }).isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(PropTypes.shape({

        /** This is either the user's full name, or their login if full name is an empty string */
        displayName: PropTypes.string.isRequired,
    })),


    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    reportActions: {},
    hasOutstandingIOU: false,
    session: {},
    personalDetails: {},
};

class IOUTransactions extends Component {
    constructor(props) {
        super(props);

        this.getRejectableTransactions = this.getRejectableTransactions.bind(this);
    }

    /**
     * Builds and returns the rejectableTransactionIDs array. A transaction must meet multiple requirements in order
     * to be rejectable. We must exclude transactions not associated with the iouReportID, actions which have already
     * been rejected, and those which are not of type 'create'.
     *
     * @returns {Array}
     */
    getRejectableTransactions() {
        if (!this.props.hasOutstandingIOU) {
            return [];
        }

        const actionsForIOUReport = _.filter(this.props.reportActions, action => action.originalMessage
            && action.originalMessage.type && action.originalMessage.IOUReportID === this.props.iouReportID);

        const rejectedTransactionIDs = _.chain(actionsForIOUReport)
            .filter(action => _.contains(['cancel', 'decline'], action.originalMessage.type))
            .map(rejectedAction => lodashGet(rejectedAction, 'originalMessage.IOUTransactionID', ''))
            .compact()
            .value();

        return _.chain(actionsForIOUReport)
            .filter(action => action.originalMessage.type === 'create')
            .filter(action => !_.contains(rejectedTransactionIDs, action.originalMessage.IOUTransactionID))
            .map(action => lodashGet(action, 'originalMessage.IOUTransactionID', ''))
            .compact()
            .value();
    }

    render() {
        const {session, personalDetails, iouReport} = this.props;
        const sessionEmail = lodashGet(session, 'email', '');
        const participantEmail = sessionEmail === iouReport.managerEmail ? iouReport.ownerEmail : iouReport.managerEmail;

        const currentUserName = lodashGet(personalDetails, [sessionEmail, 'firstName'], '')
                        || Str.removeSMSDomain(sessionEmail);
        const participantName = lodashGet(personalDetails, [participantEmail, 'firstName'], '') || Str.removeSMSDomain(participantEmail);

        return (
            <View style={[styles.mt3]}>
                {_.map(this.props.reportActions, (reportAction) => {
                    if (reportAction.originalMessage
                        && reportAction.originalMessage.IOUReportID === this.props.iouReportID) {
                        const rejectableTransactions = this.getRejectableTransactions();
                        const canBeRejected = _.contains(rejectableTransactions,
                            reportAction.originalMessage.IOUTransactionID);
                        const isCurrentUserTransactionCreator = this.props.userEmail === reportAction.actorEmail;
                        return (
                            <ReportTransaction
                                chatReportID={this.props.chatReportID}
                                iouReportID={this.props.iouReportID}
                                action={reportAction}
                                key={reportAction.sequenceNumber}
                                canBeRejected={canBeRejected}
                                currentUserName={currentUserName}
                                participantName={participantName}
                                sessionEmail={sessionEmail}
                                rejectButtonLabelText={isCurrentUserTransactionCreator
                                    ? this.props.translate('common.cancel')
                                    : this.props.translate('iou.decline')}
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
export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        reportActions: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            canEvict: false,
        },
        iouReport: {
            key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(IOUTransactions);
