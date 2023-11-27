import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import ScreenWrapper from '@components/ScreenWrapper';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize from '@components/withLocalize';
import useInitialValue from '@hooks/useInitialValue';
import useNetwork from '@hooks/useNetwork';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {iouDefaultProps, iouPropTypes} from '@pages/iou/propTypes';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** Personal details of all users */
    personalDetails: personalDetailsPropType,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    report: {},
    personalDetails: {},
    iou: iouDefaultProps,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function MoneyRequestConfirmPage(props) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {windowWidth} = useWindowDimensions();
    const prevMoneyRequestId = useRef(props.iou.id);
    const iouType = useInitialValue(() => lodashGet(props.route, 'params.iouType', ''));
    const reportID = useInitialValue(() => lodashGet(props.route, 'params.reportID', ''));
    const isDistanceRequest = MoneyRequestUtils.isDistanceRequest(iouType, props.selectedTab);
    const isScanRequest = MoneyRequestUtils.isScanRequest(props.selectedTab);
    const [receiptFile, setReceiptFile] = useState();
    const participants = useMemo(
        () =>
            _.chain(props.iou.participants)
                .map((participant) => {
                    const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                    return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, props.personalDetails);
                })
                .filter((participant) => !!participant.login || !!participant.text)
                .value(),
        [props.iou.participants, props.personalDetails],
    );
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(props.report)), [props.report]);
    const isManualRequestDM = props.selectedTab === CONST.TAB.MANUAL && iouType === CONST.IOU.TYPE.REQUEST;

    useEffect(() => {
        const policyExpenseChat = _.find(participants, (participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat) {
            Policy.openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
    }, [isOffline, participants, props.iou.billable, props.policy]);

    const defaultBillable = lodashGet(props.policy, 'defaultBillable', false);
    useEffect(() => {
        IOU.setMoneyRequestBillable(defaultBillable);
    }, [defaultBillable, isOffline]);

    useEffect(() => {
        if (!props.iou.receiptPath || !props.iou.receiptFilename) {
            return;
        }
        const onSuccess = (file) => {
            const receipt = file;
            receipt.state = file && isManualRequestDM ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCANREADY;
            setReceiptFile(receipt);
        };
        const onFailure = () => {
            Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID));
        };
        FileUtils.readFileAsync(props.iou.receiptPath, props.iou.receiptFilename, onSuccess, onFailure);
    }, [props.iou.receiptPath, props.iou.receiptFilename, isManualRequestDM, iouType, reportID]);

    useEffect(() => {
        // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
        if (!isDistanceRequest && prevMoneyRequestId.current !== props.iou.id) {
            // The ID is cleared on completing a request. In that case, we will do nothing.
            if (props.iou.id) {
                Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID), true);
            }
            return;
        }

        // Reset the money request Onyx if the ID in Onyx does not match the ID from params
        const moneyRequestId = `${iouType}${reportID}`;
        const shouldReset = !isDistanceRequest && props.iou.id !== moneyRequestId;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }

        if (_.isEmpty(props.iou.participants) || (props.iou.amount === 0 && !props.iou.receiptPath && !isDistanceRequest) || shouldReset || ReportUtils.isArchivedRoom(props.report)) {
            Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID), true);
        }

        return () => {
            prevMoneyRequestId.current = props.iou.id;
        };
    }, [props.iou.participants, props.iou.amount, props.iou.id, props.iou.receiptPath, isDistanceRequest, props.report, iouType, reportID]);

    const navigateBack = () => {
        let fallback;
        if (reportID) {
            fallback = ROUTES.MONEY_REQUEST.getRoute(iouType, reportID);
        } else {
            fallback = ROUTES.MONEY_REQUEST_PARTICIPANTS.getRoute(iouType);
        }
        Navigation.goBack(fallback);
    };

    /**
     * @param {Array} selectedParticipants
     * @param {String} trimmedComment
     * @param {File} [receipt]
     */
    const requestMoney = useCallback(
        (selectedParticipants, trimmedComment, receipt) => {
            IOU.requestMoney(
                props.report,
                props.iou.amount,
                props.iou.currency,
                props.iou.created,
                props.iou.merchant,
                props.currentUserPersonalDetails.login,
                props.currentUserPersonalDetails.accountID,
                selectedParticipants[0],
                trimmedComment,
                receipt,
                props.iou.category,
                props.iou.tag,
                props.iou.billable,
            );
        },
        [
            props.report,
            props.iou.amount,
            props.iou.currency,
            props.iou.created,
            props.iou.merchant,
            props.currentUserPersonalDetails.login,
            props.currentUserPersonalDetails.accountID,
            props.iou.category,
            props.iou.tag,
            props.iou.billable,
        ],
    );

    /**
     * @param {Array} selectedParticipants
     * @param {String} trimmedComment
     */
    const createDistanceRequest = useCallback(
        (selectedParticipants, trimmedComment) => {
            IOU.createDistanceRequest(
                props.report,
                selectedParticipants[0],
                trimmedComment,
                props.iou.created,
                props.iou.transactionID,
                props.iou.category,
                props.iou.tag,
                props.iou.amount,
                props.iou.currency,
                props.iou.merchant,
                props.iou.billable,
            );
        },
        [props.report, props.iou.created, props.iou.transactionID, props.iou.category, props.iou.tag, props.iou.amount, props.iou.currency, props.iou.merchant, props.iou.billable],
    );

    const createTransaction = useCallback(
        (selectedParticipants) => {
            const trimmedComment = props.iou.comment.trim();

            // If we have a receipt let's start the split bill by creating only the action, the transaction, and the group DM if needed
            if (iouType === CONST.IOU.TYPE.SPLIT && props.iou.receiptPath) {
                const existingSplitChatReportID = CONST.REGEX.NUMBER.test(reportID) ? reportID : '';
                const onSuccess = (receipt) => {
                    IOU.startSplitBill(
                        selectedParticipants,
                        props.currentUserPersonalDetails.login,
                        props.currentUserPersonalDetails.accountID,
                        trimmedComment,
                        receipt,
                        existingSplitChatReportID,
                    );
                };
                FileUtils.readFileAsync(props.iou.receiptPath, props.iou.receiptFilename, onSuccess);
                return;
            }

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.TYPE.SPLIT && CONST.REGEX.NUMBER.test(reportID)) {
                IOU.splitBill(
                    selectedParticipants,
                    props.currentUserPersonalDetails.login,
                    props.currentUserPersonalDetails.accountID,
                    props.iou.amount,
                    trimmedComment,
                    props.iou.currency,
                    props.iou.category,
                    reportID,
                );
                return;
            }

            // If the request is created from the global create menu, we also navigate the user to the group report
            if (iouType === CONST.IOU.TYPE.SPLIT) {
                IOU.splitBillAndOpenReport(
                    selectedParticipants,
                    props.currentUserPersonalDetails.login,
                    props.currentUserPersonalDetails.accountID,
                    props.iou.amount,
                    trimmedComment,
                    props.iou.currency,
                    props.iou.category,
                );
                return;
            }

            if (receiptFile) {
                requestMoney(selectedParticipants, trimmedComment, receiptFile);
                return;
            }

            if (isDistanceRequest) {
                createDistanceRequest(selectedParticipants, trimmedComment);
                return;
            }

            requestMoney(selectedParticipants, trimmedComment);
        },
        [
            props.iou.amount,
            props.iou.comment,
            props.currentUserPersonalDetails.login,
            props.currentUserPersonalDetails.accountID,
            props.iou.currency,
            props.iou.category,
            props.iou.receiptPath,
            props.iou.receiptFilename,
            isDistanceRequest,
            requestMoney,
            createDistanceRequest,
            receiptFile,
            iouType,
            reportID,
        ],
    );

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     *
     * @param {String} paymentMethodType
     */
    const sendMoney = useCallback(
        (paymentMethodType) => {
            const currency = props.iou.currency;
            const trimmedComment = props.iou.comment.trim();
            const participant = participants[0];

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                IOU.sendMoneyElsewhere(props.report, props.iou.amount, currency, trimmedComment, props.currentUserPersonalDetails.accountID, participant);
                return;
            }

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                IOU.sendMoneyWithWallet(props.report, props.iou.amount, currency, trimmedComment, props.currentUserPersonalDetails.accountID, participant);
            }
        },
        [props.iou.amount, props.iou.comment, participants, props.iou.currency, props.currentUserPersonalDetails.accountID, props.report],
    );

    const headerTitle = () => {
        if (isDistanceRequest) {
            return props.translate('common.distance');
        }

        if (iouType === CONST.IOU.TYPE.SPLIT) {
            return props.translate('iou.split');
        }

        if (iouType === CONST.IOU.TYPE.SEND) {
            return props.translate('common.send');
        }

        if (isScanRequest) {
            return props.translate('tabSelector.scan');
        }

        return props.translate('tabSelector.manual');
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={MoneyRequestConfirmPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={headerTitle()}
                        onBackButtonPress={navigateBack}
                        shouldShowThreeDotsButton={isManualRequestDM}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Receipt,
                                text: props.translate('receipt.addReceipt'),
                                onSelected: () => Navigation.navigate(ROUTES.MONEY_REQUEST_RECEIPT.getRoute(iouType, reportID)),
                            },
                        ]}
                    />
                    <MoneyRequestConfirmationList
                        transactionID={props.iou.transactionID}
                        hasMultipleParticipants={iouType === CONST.IOU.TYPE.SPLIT}
                        selectedParticipants={participants}
                        iouAmount={props.iou.amount}
                        iouComment={props.iou.comment}
                        iouCurrencyCode={props.iou.currency}
                        iouIsBillable={props.iou.billable}
                        onToggleBillable={IOU.setMoneyRequestBillable}
                        iouCategory={props.iou.category}
                        iouTag={props.iou.tag}
                        onConfirm={createTransaction}
                        onSendMoney={sendMoney}
                        onSelectParticipant={(option) => {
                            const newParticipants = _.map(props.iou.participants, (participant) => {
                                if (participant.accountID === option.accountID) {
                                    return {...participant, selected: !participant.selected};
                                }
                                return participant;
                            });
                            IOU.setMoneyRequestParticipants(newParticipants);
                        }}
                        receiptPath={props.iou.receiptPath}
                        receiptFilename={props.iou.receiptFilename}
                        iouType={iouType}
                        reportID={reportID}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                        // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                        // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                        // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                        // the floating-action-button (since it is something that exists outside the context of a report).
                        canModifyParticipants={!_.isEmpty(reportID)}
                        policyID={props.report.policyID}
                        bankAccountRoute={ReportUtils.getBankAccountRoute(props.report)}
                        iouMerchant={props.iou.merchant}
                        iouCreated={props.iou.created}
                        isScanRequest={isScanRequest}
                        isDistanceRequest={isDistanceRequest}
                        shouldShowSmartScanFields={_.isEmpty(props.iou.receiptPath)}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

MoneyRequestConfirmPage.displayName = 'MoneyRequestConfirmPage';
MoneyRequestConfirmPage.propTypes = propTypes;
MoneyRequestConfirmPage.defaultProps = defaultProps;

export default compose(
    withCurrentUserPersonalDetails,
    withLocalize,
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        report: {
            key: ({route, iou}) => {
                const reportID = IOU.getIOUReportID(iou, route);

                return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            },
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        selectedTab: {
            key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
    }),
)(MoneyRequestConfirmPage);
