import React, {Component} from 'react';
import {View, ActivityIndicator, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import themeColors from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import Button from '../../components/Button';
import ScreenWrapper from '../../components/ScreenWrapper';
import {payIOUReport} from '../../libs/actions/IOU';
import {fetchIOUReportByID} from '../../libs/actions/Report';
import ReportActionItemIOUPreview from '../../components/ReportActionItemIOUPreview';
import iouTransactionPropTypes from './iouTransactionPropTypes';
import IOUTransactions from './IOUTransactions';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import CONST from '../../CONST';
import CreateMenu from '../../components/CreateMenu';

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
        chatReportID: PropTypes.number,

        /** Manager is the person who currently owes money */
        managerEmail: PropTypes.string,

        /** Owner is the person who is owed money */
        ownerEmail: PropTypes.string,

        /** The IOU transactions */
        transactions: PropTypes.arrayOf(PropTypes.shape(iouTransactionPropTypes)),

        /** Does the report have an outstanding IOU that needs to be paid? */
        hasOutstandingIOU: PropTypes.bool,
    }).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {},
};

class IOUDetailsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settlementType: CONST.IOU.SETTLEMENT_TYPE.ELSEWHERE,
            isSettlementMenuVisible: false,
        };

        this.performIOUPayment = this.performIOUPayment.bind(this);
    }

    componentDidMount() {
        fetchIOUReportByID(this.props.route.params.iouReportID, this.props.route.params.chatReportID);
    }

    setMenuVisibility(isSettlementMenuVisible) {
        this.setState({isSettlementMenuVisible});
    }

    performIOUPayment() {
        payIOUReport({
            chatReportID: this.props.route.params.chatReportID,
            reportID: this.props.route.params.iouReportID,
            paymentMethodType: this.state.settlementType,
        });
    }

    render() {
        const sessionEmail = lodashGet(this.props.session, 'email', null);
        const reportIsLoading = _.isUndefined(this.props.iouReport);
        const settlementTypeText = {
            [CONST.IOU.SETTLEMENT_TYPE.VENMO]: this.props.translate('iou.settleVenmo'),
            [CONST.IOU.SETTLEMENT_TYPE.PAYPAL_ME]: this.props.translate('iou.settlePaypalMe'),
            [CONST.IOU.SETTLEMENT_TYPE.ELSEWHERE]: this.props.translate('iou.settleElsewhere'),
        };
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.details')}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {reportIsLoading ? <ActivityIndicator color={themeColors.text} /> : (
                    <View style={[styles.flex1, styles.justifyContentBetween]}>
                        <ScrollView contentContainerStyle={styles.iouDetailsContainer}>
                            <ReportActionItemIOUPreview
                                iou={this.props.iouReport}
                                shouldHidePayButton
                            />
                            <IOUTransactions
                                chatReportID={Number(this.props.route.params.chatReportID)}
                                iouReportID={Number(this.props.route.params.iouReportID)}
                                transactions={this.props.iouReport.transactions}
                                hasOutstandingIOU={this.props.iouReport.hasOutstandingIOU}
                            />
                        </ScrollView>
                        {(this.props.iouReport.hasOutstandingIOU
                            && this.props.iouReport.managerEmail === sessionEmail && (
                            <View style={styles.p5}>
                                <Button
                                    shouldShowDropDownArrow
                                    text={settlementTypeText[this.state.settlementType]}
                                    isLoading={this.props.iou.loading}
                                    onPress={this.performIOUPayment}
                                    onDropdownPress={() => {
                                        this.setMenuVisibility(true);
                                    }}
                                />
                                <CreateMenu
                                    isVisible={this.state.isSettlementMenuVisible}
                                    onClose={() => this.setMenuVisibility(false)}
                                    onItemSelected={() => this.setMenuVisibility(false)}
                                    anchorPosition={styles.createMenuPositionRightSidepane}
                                    animationIn="fadeInUp"
                                    animationOut="fadeOutDown"
                                    headerText="Choose payment method:"
                                    menuItems={_.map(CONST.IOU.SETTLEMENT_TYPE, settlementType => ({
                                        text: settlementTypeText[settlementType],
                                        onSelected: () => {
                                            this.setState({settlementType});
                                        },
                                    }))}
                                />
                            </View>
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
)(IOUDetailsModal);
