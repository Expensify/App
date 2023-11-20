import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import MoneyRequestHeaderStatusBar from '@components/MoneyRequestHeaderStatusBar';
import ScreenWrapper from '@components/ScreenWrapper';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import withReportAndReportActionOrNotFound from '@pages/home/report/withReportAndReportActionOrNotFound';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

    /** The active report */
    report: reportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** The current transaction */
    transaction: transactionPropTypes.isRequired,

    /** The draft transaction that holds data to be persisited on the current transaction */
    draftTransaction: transactionPropTypes,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/split/details */
            reportID: PropTypes.string,

            /** ReportActionID passed via route r/split/:reportActionID */
            reportActionID: PropTypes.string,
        }),
    }).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,

        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    personalDetails: {},
    reportActions: {},
    draftTransaction: undefined,
};

function SplitBillDetailsPage(props) {
    const styles = useThemeStyles();
    const {reportID} = props.report;
    const {translate} = useLocalize();
    const reportAction = props.reportActions[`${props.route.params.reportActionID.toString()}`];
    const participantAccountIDs = reportAction.originalMessage.participantAccountIDs;

    // In case this is workspace split bill, we manually add the workspace as the second participant of the split bill
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    let participants;
    if (ReportUtils.isPolicyExpenseChat(props.report)) {
        participants = [
            OptionsListUtils.getParticipantsOption({accountID: participantAccountIDs[0], selected: true}, props.personalDetails),
            OptionsListUtils.getPolicyExpenseReportOption({...props.report, selected: true}),
        ];
    } else {
        participants = _.map(participantAccountIDs, (accountID) => OptionsListUtils.getParticipantsOption({accountID, selected: true}, props.personalDetails));
    }
    const payeePersonalDetails = props.personalDetails[reportAction.actorAccountID];
    const participantsExcludingPayee = _.filter(participants, (participant) => participant.accountID !== reportAction.actorAccountID);

    const isScanning = TransactionUtils.hasReceipt(props.transaction) && TransactionUtils.isReceiptBeingScanned(props.transaction);
    const hasSmartScanFailed = TransactionUtils.hasReceipt(props.transaction) && props.transaction.receipt.state === CONST.IOU.RECEIPT_STATE.SCANFAILED;
    const isEditingSplitBill = props.session.accountID === reportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(props.transaction);

    const {
        amount: splitAmount,
        currency: splitCurrency,
        comment: splitComment,
        merchant: splitMerchant,
        created: splitCreated,
        category: splitCategory,
    } = isEditingSplitBill && props.draftTransaction ? ReportUtils.getTransactionDetails(props.draftTransaction) : ReportUtils.getTransactionDetails(props.transaction);

    const onConfirm = useCallback(
        () => IOU.completeSplitBill(reportID, reportAction, props.draftTransaction, props.session.accountID, props.session.email),
        [reportID, reportAction, props.draftTransaction, props.session.accountID, props.session.email],
    );

    return (
        <ScreenWrapper testID={SplitBillDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={_.isEmpty(reportID) || _.isEmpty(reportAction) || _.isEmpty(props.transaction)}>
                <HeaderWithBackButton title={translate('common.details')} />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {isScanning && (
                        <MoneyRequestHeaderStatusBar
                            title={translate('iou.receiptStatusTitle')}
                            description={translate('iou.receiptStatusText')}
                            shouldShowBorderBottom
                        />
                    )}
                    {Boolean(participants.length) && (
                        <MoneyRequestConfirmationList
                            hasMultipleParticipants
                            payeePersonalDetails={payeePersonalDetails}
                            selectedParticipants={participantsExcludingPayee}
                            iouAmount={splitAmount}
                            iouCurrencyCode={splitCurrency}
                            iouComment={splitComment}
                            iouCreated={splitCreated}
                            iouMerchant={splitMerchant}
                            iouCategory={splitCategory}
                            iouType={CONST.IOU.TYPE.SPLIT}
                            isReadOnly={!isEditingSplitBill}
                            shouldShowSmartScanFields
                            receiptPath={props.transaction.receipt && props.transaction.receipt.source}
                            receiptFilename={props.transaction.filename}
                            shouldShowFooter={false}
                            isEditingSplitBill={isEditingSplitBill}
                            hasSmartScanFailed={hasSmartScanFailed}
                            reportID={reportID}
                            reportActionID={reportAction.reportActionID}
                            transactionID={props.transaction.transactionID}
                            onConfirm={onConfirm}
                            isPolicyExpenseChat={ReportUtils.isPolicyExpenseChat(props.report)}
                        />
                    )}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SplitBillDetailsPage.propTypes = propTypes;
SplitBillDetailsPage.defaultProps = defaultProps;
SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';

export default compose(
    withReportAndReportActionOrNotFound,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
        reportActions: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${route.params.reportID}`,
            canEvict: false,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        transaction: {
            key: ({route, reportActions}) => {
                const reportAction = reportActions[`${route.params.reportActionID.toString()}`];
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(reportAction, 'originalMessage.IOUTransactionID', 0)}`;
            },
        },
        draftTransaction: {
            key: ({route, reportActions}) => {
                const reportAction = reportActions[`${route.params.reportActionID.toString()}`];
                return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${lodashGet(reportAction, 'originalMessage.IOUTransactionID', 0)}`;
            },
        },
    }),
)(SplitBillDetailsPage);
