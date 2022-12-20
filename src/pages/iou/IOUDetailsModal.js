import React, {Component} from 'react';
import {View, ActivityIndicator, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import {withNetwork} from '../../components/OnyxProvider';
import themeColors from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as IOU from '../../libs/actions/IOU';
import * as Report from '../../libs/actions/Report';
import IOUPreview from '../../components/ReportActionItem/IOUPreview';
import IOUTransactions from './IOUTransactions';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import SettlementButton from '../../components/SettlementButton';
import ROUTES from '../../ROUTES';
import FixedFooter from '../../components/FixedFooter';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** chatReportID passed via route: /iou/details/:chatReportID/:iouReportID */
            chatReportID: PropTypes.string,

            /** iouReportID passed via route: /iou/details/:chatReportID/:iouReportID */
            iouReportID: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx Props */
    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({
        /** Is the IOU Report currently being paid? */
        loading: PropTypes.bool,

        /** Error message, empty represents no error */
        error: PropTypes.bool,
    }),

    /** IOU Report data object */
    iouReport: PropTypes.shape({
        /** ID for the chatReport that this IOU is linked to */
        chatReportID: PropTypes.string,

        /** Manager is the person who currently owes money */
        managerEmail: PropTypes.string,

        /** Owner is the person who is owed money */
        ownerEmail: PropTypes.string,

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {},
    iouReport: undefined,
};

class IOUDetailsModal extends Component {
    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        this.fetchData();
    }

    fetchData() {
        Report.openPaymentDetailsPage(this.props.route.params.chatReportID, this.props.route.params.iouReportID);
    }

    /**
     * @param {String} paymentMethodType
     */
    payMoneyRequest(paymentMethodType) {
        const recipient = {
            login: this.props.iouReport.ownerEmail,
            payPalMeAddress: this.props.iouReport.submitterPayPalMeAddress,
        };

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            IOU.payMoneyRequestElsewhere(
                this.props.chatReport,
                this.props.iouReport,
                recipient,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
            IOU.payMoneyRequestViaPaypal(
                this.props.chatReport,
                this.props.iouReport,
                recipient,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            IOU.payMoneyRequestWithWallet(
                this.props.chatReport,
                this.props.iouReport,
                recipient,
            );
            Navigation.navigate(ROUTES.getReportRoute(this.props.route.params.chatReportID));
        }
    }

    render() {
        const sessionEmail = lodashGet(this.props.session, 'email', null);
        const reportIsLoading = _.isUndefined(this.props.iouReport);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.details')}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {reportIsLoading ? <ActivityIndicator color={themeColors.text} /> : (
                    <View style={[styles.flex1, styles.justifyContentBetween]}>
                        <ScrollView contentContainerStyle={styles.iouDetailsContainer}>
                            <IOUPreview
                                iou={this.props.iouReport}
                                chatReportID={this.props.route.params.chatReportID}
                                iouReportID={this.props.route.params.iouReportID}
                                shouldHidePayButton
                            />
                            <IOUTransactions
                                chatReportID={this.props.route.params.chatReportID}
                                iouReportID={this.props.route.params.iouReportID}
                                isIOUSettled={this.props.iouReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED}
                                userEmail={sessionEmail}
                            />
                        </ScrollView>
                        {(this.props.iouReport.hasOutstandingIOU
                            && this.props.iouReport.managerEmail === sessionEmail && (
                            <FixedFooter>
                                <SettlementButton
                                    isLoading={this.props.iou.loading}
                                    onPress={paymentMethodType => this.payMoneyRequest(paymentMethodType)}
                                    shouldShowPaypal={Boolean(lodashGet(this.props, 'iouReport.submitterPayPalMeAddress'))}
                                    currency={lodashGet(this.props, 'iouReport.currency')}
                                    enablePaymentsRoute={ROUTES.IOU_DETAILS_ENABLE_PAYMENTS}
                                    addBankAccountRoute={ROUTES.IOU_DETAILS_ADD_BANK_ACCOUNT}
                                    addDebitCardRoute={ROUTES.IOU_DETAILS_ADD_DEBIT_CARD}
                                    chatReportID={Number(this.props.route.params.chatReportID)}
                                />
                            </FixedFooter>
                        ))}
                    </View>
                )}
            </ScreenWrapper>
        );
    }
}

IOUDetailsModal.propTypes = propTypes;
IOUDetailsModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
        chatReport: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.chatReportID}`,
        },
        iouReport: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(IOUDetailsModal);
