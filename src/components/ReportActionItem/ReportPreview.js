import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ControlSelection from '../../libs/ControlSelection';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {showContextMenuForReport} from '../ShowContextMenuContext';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import SettlementButton from '../SettlementButton';
import * as IOU from '../../libs/actions/IOU';
import refPropTypes from '../refPropTypes';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import themeColors from '../../styles/themes/default';
import reportPropTypes from '../../pages/reportPropTypes';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** The active IOUReport, used for Onyx subscription */
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.string.isRequired,

    /* Onyx Props */
    /** chatReport associated with iouReport */
    chatReport: reportPropTypes,

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Active IOU Report for current report */
    iouReport: PropTypes.shape({
        /** AccountID of the manager in this iou report */
        managerID: PropTypes.number,

        /** AccountID of the creator of this iou report */
        ownerAccountID: PropTypes.number,

        /** Outstanding amount in cents of this transaction */
        total: PropTypes.number,

        /** Currency of outstanding amount of this transaction */
        currency: PropTypes.string,

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,

        /** Is the iouReport waiting for the submitter to add a credit bank account? */
        isWaitingOnBankAccount: PropTypes.bool,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: refPropTypes,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    contextMenuAnchor: null,
    chatReport: {},
    containerStyles: [],
    iouReport: {},
    checkIfContextMenuActive: () => {},
    session: {
        accountID: null,
    },
};

function ReportPreview(props) {
    const managerID = props.iouReport.managerID || props.action.actorAccountID || 0;
    const isCurrentUserManager = managerID === lodashGet(props.session, 'accountID');
    const moneyRequestCount = lodashGet(props.action, 'childMoneyRequestCount', 0);
    const moneyRequestComment = lodashGet(props.action, 'childLastMoneyRequestComment', '');
    const showComment = moneyRequestComment || moneyRequestCount > 1;
    const reportTotal = ReportUtils.getMoneyRequestTotal(props.iouReport);
    let displayAmount;
    if (reportTotal) {
        displayAmount = CurrencyUtils.convertToDisplayString(reportTotal, props.iouReport.currency);
    } else {
        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        displayAmount = '';
        const actionMessage = lodashGet(props.action, ['message', 0, 'text'], '');
        const splits = actionMessage.split(' ');
        for (let i = 0; i < splits.length; i++) {
            if (/\d/.test(splits[i])) {
                displayAmount = splits[i];
            }
        }
    }

    const managerName = ReportUtils.isPolicyExpenseChat(props.chatReport) ? ReportUtils.getPolicyName(props.chatReport) : ReportUtils.getDisplayNameForParticipant(managerID, true);
    const bankAccountRoute = ReportUtils.getBankAccountRoute(props.chatReport);
    const previewMessage = props.translate(ReportUtils.isSettled(props.iouReportID) || props.iouReport.isWaitingOnBankAccount ? 'iou.payerPaid' : 'iou.payerOwes', {payer: managerName});
    const shouldShowSettlementButton =
        !_.isEmpty(props.iouReport) && isCurrentUserManager && !ReportUtils.isSettled(props.iouReportID) && !props.iouReport.isWaitingOnBankAccount && reportTotal !== 0;
    return (
        <View style={[styles.chatItemMessage, ...props.containerStyles]}>
            <PressableWithoutFeedback
                onPress={() => {
                    Navigation.navigate(ROUTES.getReportRoute(props.iouReportID));
                }}
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={(event) => showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive)}
                style={[styles.flexRow, styles.justifyContentBetween]}
                accessibilityRole="button"
                accessibilityLabel={props.translate('iou.viewDetails')}
            >
                <View style={[styles.iouPreviewBox, props.isHovered ? styles.iouPreviewBoxHover : undefined]}>
                    <View style={styles.flexRow}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text style={[styles.textLabelSupporting, styles.mb1, styles.lh16]}>{previewMessage}</Text>
                        </View>
                    </View>
                    <View style={styles.flexRow}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text style={styles.textHeadline}>{displayAmount}</Text>
                            {ReportUtils.isSettled(props.iouReportID) && (
                                <View style={styles.defaultCheckmarkWrapper}>
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={themeColors.iconSuccessFill}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                    {showComment && (
                        <View style={[styles.flexRow]}>
                            <View style={[styles.flex1]}>
                                <Text style={[styles.mt1, styles.colorMuted]}>
                                    {moneyRequestCount > 1 ? props.translate('iou.requestCount', {count: moneyRequestCount}) : moneyRequestComment}
                                </Text>
                            </View>
                        </View>
                    )}
                    {shouldShowSettlementButton && (
                        <SettlementButton
                            currency={props.iouReport.currency}
                            policyID={props.iouReport.policyID}
                            chatReportID={props.chatReportID}
                            iouReport={props.iouReport}
                            onPress={(paymentType) => IOU.payMoneyRequest(paymentType, props.chatReport, props.iouReport)}
                            enablePaymentsRoute={ROUTES.BANK_ACCOUNT_NEW}
                            addBankAccountRoute={bankAccountRoute}
                            style={[styles.requestPreviewBox]}
                        />
                    )}
                </View>
            </PressableWithoutFeedback>
        </View>
    );
}

ReportPreview.propTypes = propTypes;
ReportPreview.defaultProps = defaultProps;
ReportPreview.displayName = 'ReportPreview';

export default compose(
    withLocalize,
    withOnyx({
        chatReport: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
        },
        iouReport: {
            key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportPreview);
