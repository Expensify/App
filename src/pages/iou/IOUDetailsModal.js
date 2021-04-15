import React, {Component} from 'react';
import _ from 'underscore';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import TransactionItem from '../../components/TransactionItem';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ButtonWithLoader from '../../components/ButtonWithLoader';
import ScreenWrapper from '../../components/ScreenWrapper';
import compose from '../../libs/compose';
import {settleIOUReport} from '../../libs/actions/IOU';
import ReportActionPropTypes from '../../pages/home/report/ReportActionPropTypes';

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
    reportActions: {},
};

const propTypes = {
    /* Onyx Props */
    // Route params
    route: matchType.isRequired,

    // IOU Report data object
    iouReport: PropTypes.shape({
        // TODODODODODODODOODODODODODODODODOOD
        chatReportID: PropTypes.number,
    }),

    reportActions: PropTypes.objectOf(PropTypes.shape(ReportActionPropTypes)),

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
            loading: false,
            settlementType: 'Elsewhere'
        }

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
        this.setState({
            loading: true,
        });
    }

    render() {
        const sessionEmail = lodashGet(this.props.session, 'email', null);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title="Details"
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View
                    pointerEvents="box-none"
                    style={[
                        styles.detailsPageContainer, styles.p5
                    ]}
                >
                    {_.map(this.props.iouReport.transactions, (transaction) => (
                        <TransactionItem transaction={transaction} />
                    ))}

                    {/* Reuse Preview Component here? */}

                    {(this.props.iouReport.managerEmail === sessionEmail &&
                    <ButtonWithLoader
                        text="I'll settle up elsewhere"
                        isLoading={this.state.loading}
                        onClick={this.performIOUSettlement}
                    />)}
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
        iouReport: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${route.params.iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    // withOnyx({
    //     reportActions: {
    //         key: ({iouReport}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.chatReportID}`,
    //     },
    // }),
)(IOUDetailsModal);
