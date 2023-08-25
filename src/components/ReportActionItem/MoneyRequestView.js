import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import compose from '../../libs/compose';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import EmptyStateBackgroundImage from '../../../assets/images/empty-state_background-fade.png';
import useLocalize from '../../hooks/useLocalize';
import * as ReceiptUtils from '../../libs/ReceiptUtils';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import transactionPropTypes from '../transactionPropTypes';
import Image from '../Image';
import ReportActionItemImage from './ReportActionItemImage';
import * as TransactionUtils from '../../libs/TransactionUtils';
import OfflineWithFeedback from '../OfflineWithFeedback';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The transaction associated with the transactionThread */
    transaction: transactionPropTypes,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    parentReport: {},
    transaction: {
        amount: 0,
        currency: CONST.CURRENCY.USD,
        comment: {comment: ''},
    },
};

function MoneyRequestView({report, parentReport, shouldShowHorizontalRule, transaction}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    const moneyRequestReport = parentReport;
    const {
        created: transactionDate,
        amount: transactionAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
    } = ReportUtils.getTransactionDetails(transaction);
    const formattedTransactionAmount = transactionAmount && transactionCurrency && CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);

    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const canEdit = ReportUtils.canEditMoneyRequest(parentReportAction);

    let description = `${translate('iou.amount')} • ${translate('iou.cash')}`;
    if (isSettled) {
        description += ` • ${translate('iou.settledExpensify')}`;
    } else if (report.isWaitingOnBankAccount) {
        description += ` • ${translate('iou.pending')}`;
    }

    // A temporary solution to hide the transaction detail
    // This will be removed after we properly add the transaction as a prop
    if (ReportActionsUtils.isDeletedAction(parentReportAction)) {
        return null;
    }

    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    let receiptURIs;
    if (hasReceipt) {
        receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction.receipt.source, transaction.filename);
    }

    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);

    return (
        <View>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth), StyleUtils.getMinimumHeight(CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT.MIN_HEIGHT)]}>
                <Image
                    pointerEvents="none"
                    source={EmptyStateBackgroundImage}
                    style={[StyleUtils.getReportWelcomeBackgroundImageStyle(true)]}
                />
            </View>
            {hasReceipt && (
                <View style={styles.moneyRequestViewImage}>
                    <ReportActionItemImage
                        thumbnail={receiptURIs.thumbnail}
                        image={receiptURIs.image}
                        enablePreviewModal
                    />
                </View>
            )}
            <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.amount') || lodashGet(transaction, 'pendingAction')}>
                <MenuItemWithTopDescription
                    title={formattedTransactionAmount ? formattedTransactionAmount.toString() : ''}
                    shouldShowTitleIcon={isSettled}
                    titleIcon={Expensicons.Checkmark}
                    description={description}
                    titleStyle={styles.newKansasLarge}
                    disabled={isSettled || !canEdit}
                    shouldShowRightIcon={canEdit}
                    onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.comment') || lodashGet(transaction, 'pendingAction')}>
                <MenuItemWithTopDescription
                    description={translate('common.description')}
                    title={transactionDescription}
                    disabled={isSettled || !canEdit}
                    shouldShowRightIcon={canEdit}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.created') || lodashGet(transaction, 'pendingAction')}>
                <MenuItemWithTopDescription
                    description={translate('common.date')}
                    title={transactionDate}
                    disabled={isSettled || !canEdit}
                    shouldShowRightIcon={canEdit}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.merchant') || lodashGet(transaction, 'pendingAction')}>
                <MenuItemWithTopDescription
                    description={isDistanceRequest ? translate('tabSelector.distance') : translate('common.merchant')}
                    title={transactionMerchant}
                    disabled={isSettled || !canEdit}
                    shouldShowRightIcon={canEdit}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.getEditRequestRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.MERCHANT))}
                />
            </OfflineWithFeedback>
            {shouldShowHorizontalRule && <View style={styles.reportHorizontalRule} />}
        </View>
    );
}

MoneyRequestView.propTypes = propTypes;
MoneyRequestView.defaultProps = defaultProps;
MoneyRequestView.displayName = 'MoneyRequestView';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        transaction: {
            key: ({report}) => {
                const parentReportAction = ReportActionsUtils.getParentReportAction(report);
                const transactionID = lodashGet(parentReportAction, ['originalMessage', 'IOUTransactionID'], 0);
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            },
        },
    }),
)(MoneyRequestView);
