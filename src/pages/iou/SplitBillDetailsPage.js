import React, {useCallback} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import personalDetailsPropType from '../personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import reportActionPropTypes from '../home/report/reportActionPropTypes';
import reportPropTypes from '../reportPropTypes';
import transactionPropTypes from '../../components/transactionPropTypes';
import withReportAndReportActionOrNotFound from '../home/report/withReportAndReportActionOrNotFound';
import * as TransactionUtils from '../../libs/TransactionUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import * as IOU from '../../libs/actions/IOU';
import ScreenWrapper from '../../components/ScreenWrapper';
import MoneyRequestConfirmationList from '../../components/MoneyRequestConfirmationList';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import MoneyRequestHeaderStatusBar from '../../components/MoneyRequestHeaderStatusBar';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

    /** The active report */
    report: reportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** Used for retrieving the draft transaction of the split bill being edited */
    draftSplitTransactions: PropTypes.shape(transactionPropTypes),

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
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    reportActions: {},
    draftSplitTransactions: {},
};

function SplitBillDetailsPage(props) {
    const reportAction = props.reportActions[`${props.route.params.reportActionID.toString()}`];
    const transactionID = reportAction.originalMessage.IOUTransactionID;
    const transaction = props.allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
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

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    const isEdittingSplitBill =
        props.session.accountID === reportAction.actorAccountID && (isScanning || (TransactionUtils.hasReceipt(transaction) && transaction.receipt.state === CONST.IOU.RECEIPT_STATE.FAILED));

    const draftSplitTransaction = props.draftSplitTransactions && props.draftSplitTransactions[`${ONYXKEYS.COLLECTION.DRAFT_SPLIT_TRANSACTION}${transactionID}`];

    if (isEdittingSplitBill && !draftSplitTransaction) {
        IOU.setDraftSplitTransaction(transaction.transactionID);
    }

    const {
        amount: splitAmount,
        currency: splitCurrency,
        comment: splitComment,
        merchant: splitMerchant,
        created: splitCreated,
        category: splitCategory,
    } = isEdittingSplitBill && draftSplitTransaction ? ReportUtils.getTransactionDetails(draftSplitTransaction) : ReportUtils.getTransactionDetails(transaction);

    const onConfirm = useCallback(() => IOU.completeSplitBill(props.report.reportID, reportAction, draftSplitTransaction), [props.report.reportID, reportAction, draftSplitTransaction]);

    return (
        <ScreenWrapper testID={SplitBillDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={_.isEmpty(props.report) || _.isEmpty(reportAction)}>
                <HeaderWithBackButton title={props.translate('common.details')} />
                <View
                    pointerEvents="box-none"
                    style={[styles.containerWithSpaceBetween]}
                >
                    {isScanning && <MoneyRequestHeaderStatusBar />}
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
                            iouType={CONST.IOU.MONEY_REQUEST_TYPE.SPLIT}
                            isReadOnly={!isEdittingSplitBill}
                            shouldShowSmartScanFields
                            receiptPath={transaction.receipt && transaction.receipt.source}
                            receiptFilename={transaction.filename}
                            shouldShowFooter={false}
                            isScanning={isScanning}
                            isEdittingSplitBill={isEdittingSplitBill}
                            reportActionID={reportAction.reportActionID}
                            reportID={lodashGet(props.report, 'reportID', '')}
                            onConfirm={onConfirm}
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
    withLocalize,
    withReportAndReportActionOrNotFound,
    withOnyx({
        allTransactions: {
            key: ONYXKEYS.COLLECTION.TRANSACTION,
        },
        draftSplitTransactions: {
            key: ONYXKEYS.COLLECTION.DRAFT_SPLIT_TRANSACTION,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(SplitBillDetailsPage);
