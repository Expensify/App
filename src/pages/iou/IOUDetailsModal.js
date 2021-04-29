import React, {Component} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import ReportTransaction from '../../components/ReportTransaction';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ButtonWithLoader from '../../components/ButtonWithLoader';
import ScreenWrapper from '../../components/ScreenWrapper';
import compose from '../../libs/compose';
import {settleIOUReport} from '../../libs/actions/IOU';
import ReportActionPropTypes from '../home/report/ReportActionPropTypes';
import ReportActionItemIOUPreview from '../../components/ReportActionItemIOUPreview';

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        // iouReportID passed via route /iou/details/:iouReportID
        iouReportID: PropTypes.string,
    }),
});

const defaultProps = {
    iouReport: {
        chatReportID: 0,
    },
    reportActions: [],
};

const propTypes = {
    /* Onyx Props */
    // Route params
    route: matchType.isRequired,

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({
        // Is the IOU Report currently being settled
        loading: PropTypes.bool,

        // Whether or not transaction creation has resulted to error
        error: PropTypes.bool,
    }).isRequired,

    // IOU Report data object
    iouReport: PropTypes.shape({
        // ID for the chatReport that this IOU is linked to
        chatReportID: PropTypes.number,

        // Manager is the person who currently owes money
        managerEmail: PropTypes.string,

        // Owner is the person who is owed money
        ownerEmail: PropTypes.string,

        transactions: PropTypes.arrayOf(PropTypes.shape({
            // The transaction currency
            currency: PropTypes.string,

            // The transaction amount
            total: PropTypes.number,

            // The transaction comment
            comment: PropTypes.string,
        })),
    }),

    reportActions: PropTypes.arrayOf(PropTypes.shape(ReportActionPropTypes)), // should this be array/object?

    // Session info for the currently logged in user.
    session: PropTypes.shape({
        // Currently logged in user email
        email: PropTypes.string,
    }).isRequired,
};

class IOUDetailsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settlementType: 'Elsewhere',
        };

        this.performIOUSettlement = this.performIOUSettlement.bind(this);
    }

    componentDidUpdate(prevProps) {
        console.debug('juless props: ', this.props);
        if (prevProps.reportActions !== this.props.reportActions) {
            console.debug('juless: reportActions: ', this.props.reportActions);
        }
    }

    performIOUSettlement() {
        settleIOUReport({
            reportID: this.props.route.params.iouReportID,
            paymentMethodType: this.state.settlementType,
        });
    }

    render() {
        const sessionEmail = lodashGet(this.props.session, 'email', null);
        const transactionsByCreationDate = this.props.iouReport.transactions ? this.props.iouReport.transactions.reverse() : [];
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title="Details"
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View
                    pointerEvents="box-none"
                    style={[styles.detailsPageContainer, styles.p5]}
                >
                    <ReportActionItemIOUPreview
                        iou={this.props.iouReport}
                        session={this.props.session}
                        onPayButtonPressed={null}
                        shouldHidePayButton
                    />
                    {_.map(transactionsByCreationDate, (transaction) => {
                        const actionForTransaction = _.find(this.props.reportActions, (action) => {
                            if (action && action.originalMessage) {
                                return action.originalMessage.IOUTransactionID == transaction.transactionID;
                            }
                            return false;
                        });
                        return (
                            <ReportTransaction
                                chatReportID={this.props.route.params.iouReportID}
                                transaction={transaction}
                                action={actionForTransaction}
                            />
                        );
                    })}
                    {(this.props.iouReport.managerEmail === sessionEmail && (
                        <ButtonWithLoader
                            text="I'll settle up elsewhere"
                            isLoading={this.props.iou.loading}
                            onClick={this.performIOUSettlement}
                        />
                    ))}
                </View>
            </ScreenWrapper>
        );
    }
}

IOUDetailsModal.propTypes = propTypes;
IOUDetailsModal.displayName = 'IOUDetailsModal';
IOUDetailsModal.defaultProps = defaultProps;

export default compose(
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
        iouReport: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${route.params.iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    withOnyx({
        reportActions: {
            key: ({iouReport}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.chatReportID}`,
            canEvict: false,
        },
    }),
)(IOUDetailsModal);
