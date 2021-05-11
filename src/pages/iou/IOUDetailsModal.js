import React, {Component} from 'react';
import {View, ActivityIndicator, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import themeColors from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ButtonWithLoader from '../../components/ButtonWithLoader';
import ScreenWrapper from '../../components/ScreenWrapper';
import {settleIOUReport} from '../../libs/actions/IOU';
import {fetchIOUReportByID} from '../../libs/actions/Report';
import ReportActionItemIOUPreview from '../../components/ReportActionItemIOUPreview';
import IOUTansactionPropTypes from './IOUTansactionPropTypes';
import IOUTransactions from './IOUTransactions';

const defaultProps = {
    iou: {},
    iouReport: null,
};

const propTypes = {
    // URL Route params
    route: PropTypes.shape({
        // Params from the URL path
        params: PropTypes.shape({
            // chatReportID passed via route /iou/:chatReportID
            chatReportID: PropTypes.string,

            // iouReportID passed via route /iou/:iouReportID
            iouReportID: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx Props */
    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({
        // Is the IOU Report currently being settled
        loading: PropTypes.bool,

        // Error message, empty represents no error
        error: PropTypes.string,
    }),

    // IOU Report data object
    iouReport: PropTypes.shape({
        // ID for the chatReport that this IOU is linked to
        chatReportID: PropTypes.number,

        // Manager is the person who currently owes money
        managerEmail: PropTypes.string,

        // Owner is the person who is owed money
        ownerEmail: PropTypes.string,

        // The IOU transactions
        transactions: PropTypes.arrayOf(PropTypes.shape(IOUTansactionPropTypes)),

        // Is the IOU report settled?
        hasOutstandingIOU: PropTypes.bool,
    }),

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

    componentDidMount() {
        // We should not update the chatReport data here, as there is no guarantte this is the active IOU
        fetchIOUReportByID(this.props.route.params.iouReportID, this.props.route.params.chatReportID, false);
    }

    performIOUSettlement() {
        settleIOUReport({
            chatReportID: this.props.route.params.chatReportID,
            reportID: this.props.route.params.iouReportID,
            paymentMethodType: this.state.settlementType,
        });
    }

    render() {
        const sessionEmail = lodashGet(this.props.session, 'email', null);
        const reportIsLoading = this.props.iouReport === null;
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title="Details"
                    onCloseButtonPress={Navigation.dismissModal}
                />
                {reportIsLoading ? <ActivityIndicator color={themeColors.text} /> : (
                    <View style={[styles.flex1, styles.justifyContentBetween]}>
                        <ScrollView contentContainerStyle={{flexGrow: 1, paddingStart: 20, paddingEnd: 20}}>
                            <ReportActionItemIOUPreview
                                iou={this.props.iouReport}
                                session={this.props.session}
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
                                <ButtonWithLoader
                                    text="I'll settle up elsewhere"
                                    isLoading={this.props.iou.loading}
                                    onClick={this.performIOUSettlement}
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
IOUDetailsModal.displayName = 'IOUDetailsModal';
IOUDetailsModal.defaultProps = defaultProps;

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    iouReport: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${route.params.iouReportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(IOUDetailsModal);
