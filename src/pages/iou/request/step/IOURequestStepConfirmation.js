import React, {useCallback, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import useLocalize from '../../../../hooks/useLocalize';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import transactionPropTypes from '../../../../components/transactionPropTypes';
import reportPropTypes from '../../../reportPropTypes';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import styles from '../../../../styles/styles';
import * as StyleUtils from '../../../../styles/StyleUtils';
import * as TransactionUtils from '../../../../libs/TransactionUtils';
import Navigation from '../../../../libs/Navigation/Navigation';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import MoneyRequestConfirmationList from '../../../../components/MoneeRequestConfirmationList';
import * as OptionsListUtils from '../../../../libs/OptionsListUtils';
import personalDetailsPropType from '../../../personalDetailsPropType';
import * as IOU from '../../../../libs/actions/IOU';
import * as ReportUtils from '../../../../libs/ReportUtils';
import * as FileUtils from '../../../../libs/fileDownload/FileUtils';
import compose from '../../../../libs/compose';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../../components/withCurrentUserPersonalDetails';
import {policyPropTypes} from '../../../workspace/withPolicy';
import useNetwork from '../../../../hooks/useNetwork';
import * as Policy from '../../../../libs/actions/Policy';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

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
    route,
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction,
}) {
    const {translate} = useLocalize();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();

    const isManualRequestDM = TransactionUtils.isManualRequest(transaction);
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const headerTitle = translate(TransactionUtils.getHeaderTitle(transaction));
    const participants = _.map(transaction.participants, (participant) => {
        const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
        return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
    });

    const navigateBack = () => {
        // The previous step for distance requests was the participants page
        if (isDistanceRequest) {
            // If there is a report attached to the IOU with a reportID, then the participants have been automatically assigned
            // so the previous step was actually the distance tab.
            if (report.reportID) {
                Navigation.goBack(ROUTES.MONEE_REQUEST_CREATE_TAB_DISTANCE.getRoute(iouType, transactionID, reportID), true);
                return;
            }

            Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.PARTICIPANTS, transactionID, reportID), true);
            return;
        }
        Navigation.goBack();
    };

    const navigateToAddReceipt = () => {
        // TODO: Get this route working
        // Navigation.navigate(ROUTES.MONEY_REQUEST_RECEIPT.getRoute(iouType, reportID);
    };

    useEffect(() => {
        const policyExpenseChat = _.find(participants, (participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat) {
            Policy.openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
        // TODO: make sure this can be removed
        // // Verification to reset billable with a default value, when value in IOU was changed
        // if (typeof transaction.billable !== 'boolean') {
        //     IOU.setMoneyRequestBillable(lodashGet(policy, 'defaultBillable', false));
        // }
    }, [isOffline, participants, transaction.billable, policy]);

    /**
     * @param {Array} selectedParticipants
     * @param {String} trimmedComment
     * @param {File} [receipt]
     */
    const requestMoney = useCallback(
        (selectedParticipants, trimmedComment, receipt) => {
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
        [
            report,
            transaction.amount,
            transaction.currency,
            transaction.created,
            transaction.merchant,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            transaction.category,
            transaction.tag,
            transaction.billable,
        ],
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
                transaction.transactionID,
                transaction.category,
                transaction.tag,
                transaction.amount,
                transaction.currency,
                transaction.merchant,
                transaction.billable,
            );
        },
        [report, transaction.created, transaction.transactionID, transaction.category, transaction.tag, transaction.amount, transaction.currency, transaction.merchant, transaction.billable],
    );

    const createTransaction = useCallback(
        (selectedParticipants) => {
            const trimmedComment = transaction.comment.trim();

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT && CONST.REGEX.NUMBER.test(reportID)) {
                IOU.splitBill(
                    selectedParticipants,
                    currentUserPersonalDetails.login,
                    currentUserPersonalDetails.accountID,
                    transaction.amount,
                    trimmedComment,
                    transaction.currency,
                    reportID,
                );
                return;
            }

            // If the request is created from the global create menu, we also navigate the user to the group report
            if (iouType === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT) {
                IOU.splitBillAndOpenReport(
                    selectedParticipants,
                    currentUserPersonalDetails.login,
                    currentUserPersonalDetails.accountID,
                    transaction.amount,
                    trimmedComment,
                    transaction.currency,
                );
                return;
            }

            if (transaction.receiptPath && transaction.receiptSource) {
                FileUtils.readFileAsync(transaction.receiptPath, transaction.receiptSource).then((file) => {
                    const receipt = file;
                    receipt.state = file && isManualRequestDM ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCANREADY;
                    requestMoney(selectedParticipants, trimmedComment, receipt);
                });
                return;
            }

            if (isDistanceRequest) {
                createDistanceRequest(selectedParticipants, trimmedComment);
                return;
            }

            requestMoney(selectedParticipants, trimmedComment);
        },
        [
            iouType,
            reportID,
            transaction.amount,
            transaction.comment,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            transaction.currency,
            transaction.receiptPath,
            transaction.receiptSource,
            isDistanceRequest,
            requestMoney,
            createDistanceRequest,
            isManualRequestDM,
        ],
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
        IOU.setMoneeRequestParticipants(transactionID, newParticipants);
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
                        shouldShowThreeDotsButton={isManualRequestDM}
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
                                route={route}
                                transactionID={transactionID}
                                hasMultipleParticipants={iouType === CONST.IOU.TYPE.SPLIT}
                                selectedParticipants={participants}
                                iouAmount={transaction.amount}
                                iouComment={lodashGet(transaction, 'comment.comment', '')}
                                iouCurrencyCode={transaction.currency}
                                iouIsBillable={transaction.billable}
                                onToggleBillable={IOU.setMoneyRequestBillable}
                                iouCategory={transaction.category}
                                iouTag={transaction.tag}
                                onConfirm={createTransaction}
                                onSendMoney={sendMoney}
                                onSelectParticipant={addNewParticipant}
                                receiptPath={lodashGet(transaction, 'receipt.path')}
                                receiptSource={lodashGet(transaction, 'receipt.source')}
                                iouType={iouType}
                                reportID={reportID}
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
                                isDistanceRequest={isDistanceRequest}
                                listStyles={[StyleUtils.getMaximumHeight(windowHeight / 3)]}
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
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
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
