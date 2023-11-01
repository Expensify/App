import React, {useCallback, useEffect, useMemo} from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import useWindowDimensions from '@hooks/useWindowDimensions';
import MoneyRequestConfirmationList from '@components/MoneeRequestConfirmationList';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import * as IOU from '@userActions/IOU';
import * as ReportUtils from '@libs/ReportUtils';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import compose from '@libs/compose';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '@components/withCurrentUserPersonalDetails';
import {policyPropTypes} from '@pages/workspace/withPolicy';
import useNetwork from '@hooks/useNetwork';
import * as Policy from '@userActions/Policy';
import useLocalize from '@hooks/useLocalize';
import CONST from '../../../../CONST';
import ROUTES from '@src/ROUTES';
import ONYXKEYS from '@src/ONYXKEYS';
import reportPropTypes from '@pages/reportPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import ScreenWrapper from '@components/ScreenWrapper';

const propTypes = {
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
    transaction: {receipt = {}},
}) {
    const {translate} = useLocalize();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();

    const requestType = TransactionUtils.getRequestType(transaction);
    const headerTitle = iouType === CONST.IOU.TYPE.SPLIT ? translate('iou.split') : translate(TransactionUtils.getHeaderTitle(transaction));
    const participants = useMemo(
        () =>
            _.map(transaction.participants, (participant) => {
                const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
            }),
        [transaction.participants, personalDetails],
    );
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report)), [report]);

    const navigateBack = () => {
        // If there is not a report attached to the IOU with a reportID, then the participants were manually selected and the user needs taken
        // back to the participants step
        if (!transaction.participantsAutoAssigned) {
            Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.PARTICIPANTS, transactionID, reportID), true);
            return;
        }

        // If the participants were automatically added to the transaction, then the user needs taken back to the starting step
        switch (requestType) {
            case CONST.IOU.REQUEST_TYPE.DISTANCE:
                Navigation.goBack(ROUTES.MONEE_REQUEST_CREATE_TAB_DISTANCE.getRoute(iouType, transactionID, reportID), true);
                break;
            case CONST.IOU.REQUEST_TYPE.SCAN:
                Navigation.goBack(ROUTES.MONEE_REQUEST_CREATE_TAB_SCAN.getRoute(iouType, transactionID, reportID), true);
                break;
            default:
                Navigation.goBack(ROUTES.MONEE_REQUEST_CREATE_TAB_MANUAL.getRoute(iouType, transactionID, reportID), true);
                break;
        }
    };

    const navigateToAddReceipt = () => {
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.SCAN, transactionID, reportID));
    };

    useEffect(() => {
        const policyExpenseChat = _.find(participants, (participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat) {
            Policy.openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
    }, [isOffline, participants, transaction.billable, policy]);

    const createTransaction = useCallback(
        (selectedParticipants) => {
            const trimmedComment = lodashGet(transaction, 'comment.comment', '').trim();

            // If we have a receipt let's start the split bill by creating only the action, the transaction, and the group DM if needed
            if (iouType === CONST.IOU.TYPE.SPLIT && receipt.path) {
                const existingSplitChatReportID = CONST.REGEX.NUMBER.test(reportID) ? reportID : '';
                FileUtils.readFileAsync(receipt.path, receipt.source).then((receiptFile) => {
                    IOU.startSplitBill(selectedParticipants, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, trimmedComment, receiptFile, existingSplitChatReportID);
                });
                return;
            }

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.TYPE.SPLIT && !_.isEmpty(report.reportID)) {
                IOU.splitBill(
                    selectedParticipants,
                    currentUserPersonalDetails.login,
                    currentUserPersonalDetails.accountID,
                    transaction.amount,
                    trimmedComment,
                    transaction.currency,
                    transaction.category,
                    report.reportID,
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
                );
                return;
            }

            // Distance request
            if (requestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
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
                return;
            }

            // SmartScan request
            if (requestType === CONST.IOU.REQUEST_TYPE.SCAN) {
                FileUtils.readFileAsync(receipt.path, receipt.source).then((file) => {
                    const receiptFile = file;
                    receiptFile.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCANREADY;
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
                        receiptFile,
                        transaction.category,
                        transaction.tag,
                        transaction.billable,
                    );
                });
                return;
            }

            // Manual requests (set the receipt param to )
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
                receipt,
                transaction.category,
                transaction.tag,
                transaction.billable,
            );
        },
        [iouType, transaction, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, receipt, report, reportID, requestType],
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
        IOU.setMoneeRequestParticipants_temporaryForRefactor(transactionID, newParticipants);
    };

    /**
     * @param {Boolean} billable
     */
    const setBillable = (billable) => {
        IOU.setMoneeRequestBillable_temporaryForRefactor(transactionID, billable);
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
                        shouldShowThreeDotsButton={requestType === CONST.IOU.REQUEST_TYPE.MANUAL}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Receipt,
                                text: translate('receipt.addReceipt'),
                                onSelected: navigateToAddReceipt,
                            },
                        ]}
                    />
                    {/*
                     * The MoneyRequestConfirmationList component uses a SectionList which uses a VirtualizedList internally.
                     * VirtualizedList cannot be directly nested within ScrollViews of the same orientation.
                     * To work around this, we wrap the MoneyRequestConfirmationList component with a horizontal ScrollView.
                     */}
                    <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                        <ScrollView
                            horizontal
                            contentContainerStyle={[styles.flex1, styles.flexColumn]}
                        >
                            <MoneyRequestConfirmationList
                                transactionID={transactionID}
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
                                receiptPath={lodashGet(transaction, 'receipt.path')}
                                receiptSource={lodashGet(transaction, 'receipt.source')}
                                iouType={iouType}
                                reportID={reportID}
                                isPolicyExpenseChat={isPolicyExpenseChat}
                                // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                                // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                                // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                                // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                                // the floating-action-button (since it is something that exists outside the context of a report).
                                canModifyParticipants={!_.isEmpty(report.reportID)}
                                policyID={report.policyID}
                                bankAccountRoute={ReportUtils.getBankAccountRoute(report)}
                                iouMerchant={transaction.merchant}
                                iouCreated={transaction.created}
                                isDistanceRequest={requestType === CONST.IOU.REQUEST_TYPE.DISTANCE}
                                listStyles={[StyleUtils.getMaximumHeight(windowHeight / 3)]}
                                shouldShowSmartScanFields={_.isEmpty(transaction.receiptPath)}
                            />
                        </ScrollView>
                    </ScrollView>
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
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        report: {
            key: ({route, iou}) => `${ONYXKEYS.COLLECTION.REPORT}${IOU.getIOUReportID(iou, route)}`,
        },
        transaction: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID', '0')}`,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${lodashGet(report, 'policyID', '0')}`,
        },
    }),
)(IOURequestStepConfirmation);
