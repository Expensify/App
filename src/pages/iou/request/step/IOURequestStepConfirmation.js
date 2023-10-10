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

    const requestType = TransactionUtils.getRequestType(transaction);
    const headerTitle = translate(TransactionUtils.getHeaderTitle(transaction));
    const participants = _.map(transaction.participants, (participant) => {
        const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
        return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
    });

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

    /**
     * @param {Array} selectedParticipants
     * @param {String} trimmedComment
     * @param {File} [receipt]
     */
    const requestMoney = useCallback(
        (selectedParticipants, trimmedComment, receipt) => {
            IOU.requestMoney(
                report,
                undefined,
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

    const createTransaction = useCallback(
        (selectedParticipants) => {
            const trimmedComment = lodashGet(transaction, 'comment.comment', '').trim();

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT && CONST.REGEX.NUMBER.test(reportID)) {
                // TODO:
                // IOU.splitBill(
                //     selectedParticipants,
                //     currentUserPersonalDetails.login,
                //     currentUserPersonalDetails.accountID,
                //     transaction.amount,
                //     trimmedComment,
                //     transaction.currency,
                //     reportID,
                // );
                return;
            }

            // If the request is created from the global create menu, we also navigate the user to the group report
            if (iouType === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT) {
                // TODO:
                // IOU.splitBillAndOpenReport(
                //     selectedParticipants,
                //     currentUserPersonalDetails.login,
                //     currentUserPersonalDetails.accountID,
                //     transaction.amount,
                //     trimmedComment,
                //     transaction.currency,
                // );
                return;
            }

            if (transaction.receipt.path && transaction.receipt.source) {
                FileUtils.readFileAsync(transaction.receipt.path, transaction.receipt.source).then((file) => {
                    const receipt = file;
                    receipt.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCANREADY;
                    requestMoney(selectedParticipants, trimmedComment, receipt);
                });
                return;
            }

            if (requestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
                IOU.createDistanceRequest(
                    report,
                    selectedParticipants[0],
                    trimmedComment,
                    transaction.created,
                    undefined,
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
            transaction.receipt.path,
            transaction.receipt.source,
            requestType,
            requestMoney,
            IOU.createDistanceRequest,
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
                                isDistanceRequest={requestType === CONST.IOU.REQUEST_TYPE.DISTANCE}
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
