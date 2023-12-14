import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestConfirmationList from '@components/MoneyTemporaryForRefactorRequestConfirmationList';
import ScreenWrapper from '@components/ScreenWrapper';
import transactionPropTypes from '@components/transactionPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import {policyPropTypes} from '@pages/workspace/withPolicy';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The personal details of the current user */
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Personal details of all users */
    personalDetails: personalDetailsPropType,

    /** The policy of the report */
    ...policyPropTypes,

    /** The full IOU report */
    report: reportPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};
const defaultProps = {
    personalDetails: {},
    policy: {},
    report: {},
    transaction: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};
function IOURequestStepConfirmation({
    currentUserPersonalDetails,
    personalDetails,
    policy,
    report,
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const [receiptFile, setReceiptFile] = useState();
    const receiptFilename = lodashGet(transaction, 'filename');
    const receiptPath = lodashGet(transaction, 'receipt.source');
    const requestType = TransactionUtils.getRequestType(transaction);
    const headerTitle = iouType === CONST.IOU.TYPE.SPLIT ? translate('iou.split') : translate(TransactionUtils.getHeaderTitleTranslationKey(transaction));
    const participants = useMemo(
        () =>
            _.chain(transaction.participants)
                .map((participant) => {
                    const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                    return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
                })
                .filter((participant) => !!participant.login || !!participant.text)
                .value(),
        [transaction.participants, personalDetails],
    );
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report)), [report]);

    useEffect(() => {
        const policyExpenseChat = _.find(participants, (participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat) {
            Policy.openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
    }, [participants, transaction.billable, policy, transactionID]);

    const defaultBillable = lodashGet(policy, 'defaultBillable', false);
    useEffect(() => {
        IOU.setMoneyRequestBillable_temporaryForRefactor(transactionID, defaultBillable);
    }, [transactionID, defaultBillable]);

    const navigateBack = useCallback(() => {
        // If there is not a report attached to the IOU with a reportID, then the participants were manually selected and the user needs taken
        // back to the participants step
        if (!transaction.participantsAutoAssigned) {
            // When going back to the participants step, if the iou is a "request" (not a split), then the participants need to be cleared from the
            // transaction so that the participant can be selected again.
            if (iouType === CONST.IOU.TYPE.REQUEST) {
                IOU.setMoneyRequestParticipants_temporaryForRefactor(transactionID, []);
            }
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
            return;
        }
        IOUUtils.navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID);
    }, [transaction, iouType, requestType, transactionID, reportID]);

    const navigateToAddReceipt = useCallback(() => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
    }, [iouType, transactionID, reportID]);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    useEffect(() => {
        const onSuccess = (file) => {
            const receipt = file;
            receipt.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCANREADY;
            setReceiptFile(receipt);
        };

        IOUUtils.navigateToStartStepIfScanFileCannotBeRead(receiptFilename, receiptPath, onSuccess, requestType, iouType, transactionID, reportID);
    }, [receiptPath, receiptFilename, requestType, iouType, transactionID, reportID]);

    useEffect(() => {
        const policyExpenseChat = _.find(participants, (participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat) {
            Policy.openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
    }, [isOffline, participants, transaction.billable, policy]);

    /**
     * @param {Array} selectedParticipants
     * @param {String} trimmedComment
     * @param {File} [receiptObj]
     */
    const requestMoney = useCallback(
        (selectedParticipants, trimmedComment, receiptObj) => {
            IOU.requestMoney(
                report,
                transaction.amount,
                transaction.currency,
                transaction.created,
                transaction.merchant,
                currentUserPersonalDetails.login,
                currentUserPersonalDetails.accountID,
                selectedParticipants[0],
                trimmedComment,
                receiptObj,
                transaction.category,
                transaction.tag,
                transaction.billable,
            );
        },
        [report, transaction, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID],
    );

    /**
     * @param {Array} selectedParticipants
     * @param {String} trimmedComment
     */
    const createDistanceRequest = useCallback(
        (selectedParticipants, trimmedComment) => {
            IOU.createDistanceRequest(
                report,
                selectedParticipants[0],
                trimmedComment,
                transaction.created,
                transaction.category,
                transaction.tag,
                transaction.amount,
                transaction.currency,
                transaction.merchant,
                transaction.billable,
                TransactionUtils.getValidWaypoints(transaction.comment.waypoints, true),
            );
        },
        [report, transaction],
    );

    const createTransaction = useCallback(
        (selectedParticipants) => {
            const trimmedComment = lodashGet(transaction, 'comment.comment', '').trim();

            // If we have a receipt let's start the split bill by creating only the action, the transaction, and the group DM if needed
            if (iouType === CONST.IOU.TYPE.SPLIT && receiptFile) {
                const existingSplitChatReportID = CONST.REGEX.NUMBER.test(report.reportID) ? reportID : '';
                IOU.startSplitBill(selectedParticipants, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, trimmedComment, receiptFile, existingSplitChatReportID);
                return;
            }

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.TYPE.SPLIT && !transaction.isFromGlobalCreate) {
                IOU.splitBill(
                    selectedParticipants,
                    currentUserPersonalDetails.login,
                    currentUserPersonalDetails.accountID,
                    transaction.amount,
                    trimmedComment,
                    transaction.currency,
                    transaction.category,
                    transaction.tag,
                    report.reportID,
                    transaction.merchant,
                );
                return;
            }

            // If the request is created from the global create menu, we also navigate the user to the group report
            if (iouType === CONST.IOU.TYPE.SPLIT) {
                IOU.splitBillAndOpenReport(
                    selectedParticipants,
                    currentUserPersonalDetails.login,
                    currentUserPersonalDetails.accountID,
                    transaction.amount,
                    trimmedComment,
                    transaction.currency,
                    transaction.category,
                    transaction.tag,
                    transaction.merchant,
                );
                return;
            }

            if (receiptFile) {
                requestMoney(selectedParticipants, trimmedComment, receiptFile);
                return;
            }

            if (requestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
                createDistanceRequest(selectedParticipants, trimmedComment);
                return;
            }

            requestMoney(selectedParticipants, trimmedComment);
        },
        [iouType, transaction, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, report, reportID, requestType, createDistanceRequest, requestMoney, receiptFile],
    );

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     *
     * @param {String} paymentMethodType
     */
    const sendMoney = useCallback(
        (paymentMethodType) => {
            const currency = transaction.currency;
            const trimmedComment = transaction.comment.trim();
            const participant = participants[0];

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                IOU.sendMoneyElsewhere(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
                return;
            }

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                IOU.sendMoneyWithWallet(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
            }
        },
        [transaction.amount, transaction.comment, participants, transaction.currency, currentUserPersonalDetails.accountID, report],
    );
    const addNewParticipant = (option) => {
        const newParticipants = _.map(transaction.participants, (participant) => {
            if (participant.accountID === option.accountID) {
                return {...participant, selected: !participant.selected};
            }
            return participant;
        });
        IOU.setMoneyRequestParticipants_temporaryForRefactor(transactionID, newParticipants);
    };

    /**
     * @param {Boolean} billable
     */
    const setBillable = (billable) => {
        IOU.setMoneyRequestBillable_temporaryForRefactor(transactionID, billable);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={IOURequestStepConfirmation.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                        shouldShowThreeDotsButton={requestType === CONST.IOU.REQUEST_TYPE.MANUAL && iouType === CONST.IOU.TYPE.REQUEST}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Receipt,
                                text: translate('receipt.addReceipt'),
                                onSelected: navigateToAddReceipt,
                            },
                        ]}
                    />
                    <MoneyRequestConfirmationList
                        transaction={transaction}
                        hasMultipleParticipants={iouType === CONST.IOU.TYPE.SPLIT}
                        selectedParticipants={participants}
                        iouAmount={transaction.amount}
                        iouComment={lodashGet(transaction, 'comment.comment', '')}
                        iouCurrencyCode={transaction.currency}
                        iouIsBillable={transaction.billable}
                        onToggleBillable={setBillable}
                        iouCategory={transaction.category}
                        iouTag={transaction.tag}
                        onConfirm={createTransaction}
                        onSendMoney={sendMoney}
                        onSelectParticipant={addNewParticipant}
                        receiptPath={receiptPath}
                        receiptFilename={receiptFilename}
                        iouType={iouType}
                        reportID={reportID}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                        // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                        // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                        // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                        // the floating-action-button (since it is something that exists outside the context of a report).
                        canModifyParticipants={!transaction.isFromGlobalCreate}
                        policyID={report.policyID}
                        bankAccountRoute={ReportUtils.getBankAccountRoute(report)}
                        iouMerchant={transaction.merchant}
                        iouCreated={transaction.created}
                        isScanRequest={requestType === CONST.IOU.REQUEST_TYPE.SCAN}
                        isDistanceRequest={requestType === CONST.IOU.REQUEST_TYPE.DISTANCE}
                        shouldShowSmartScanFields={_.isEmpty(lodashGet(transaction, 'receipt.source', ''))}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepConfirmation.propTypes = propTypes;
IOURequestStepConfirmation.defaultProps = defaultProps;
IOURequestStepConfirmation.displayName = 'IOURequestStepConfirmation';

export default compose(
    withCurrentUserPersonalDetails,
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${lodashGet(report, 'policyID', '0')}`,
        },
    }),
)(IOURequestStepConfirmation);
