import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import MoneyRequestConfirmationList from '../../../components/MoneyRequestConfirmationList';
import CONST from '../../../CONST';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as IOU from '../../../libs/actions/IOU';
import compose from '../../../libs/compose';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as OptionsListUtils from '../../../libs/OptionsListUtils';
import * as MoneyRequestUtils from '../../../libs/MoneyRequestUtils';
import withLocalize from '../../../components/withLocalize';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ONYXKEYS from '../../../ONYXKEYS';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import reportPropTypes from '../../reportPropTypes';
import personalDetailsPropType from '../../personalDetailsPropType';
import * as FileUtils from '../../../libs/fileDownload/FileUtils';
import * as Policy from '../../../libs/actions/Policy';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import * as StyleUtils from '../../../styles/StyleUtils';
import {iouPropTypes, iouDefaultProps} from '../propTypes';

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
    const {windowHeight} = useWindowDimensions();
    const prevMoneyRequestId = useRef(props.iou.id);
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const isDistanceRequest = MoneyRequestUtils.isDistanceRequest(iouType.current, props.selectedTab);
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));
    const participants = useMemo(
        () =>
            lodashGet(props.iou.participants, [0, 'isPolicyExpenseChat'], false)
                ? OptionsListUtils.getPolicyExpenseReportOptions(props.iou.participants[0])
                : OptionsListUtils.getParticipantsOptions(props.iou.participants, props.personalDetails),
        [props.iou.participants, props.personalDetails],
    );

    useEffect(() => {
        const policyExpenseChat = _.find(participants, (participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat) {
            Policy.openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
        if (!isDistanceRequest && prevMoneyRequestId.current !== props.iou.id) {
            // The ID is cleared on completing a request. In that case, we will do nothing.
            if (props.iou.id) {
                Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), true);
            }
            return;
        }

        // Reset the money request Onyx if the ID in Onyx does not match the ID from params
        const moneyRequestId = `${iouType.current}${reportID.current}`;
        const shouldReset = !isDistanceRequest && props.iou.id !== moneyRequestId;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }

        if (_.isEmpty(props.iou.participants) || (props.iou.amount === 0 && !props.iou.receiptPath && !isDistanceRequest) || shouldReset) {
            Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), true);
        }

        return () => {
            prevMoneyRequestId.current = props.iou.id;
        };
    }, [props.iou.participants, props.iou.amount, props.iou.id, props.iou.receiptPath, isDistanceRequest]);

    const navigateBack = () => {
        let fallback;
        if (reportID.current) {
            fallback = ROUTES.getMoneyRequestRoute(iouType.current, reportID.current);
        } else {
            fallback = ROUTES.getMoneyRequestParticipantsRoute(iouType.current);
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
                props.iou.amount,
                props.iou.currency,
                props.iou.merchant,
            );
        },
        [props.report, props.iou.created, props.iou.transactionID, props.iou.category, props.iou.amount, props.iou.currency, props.iou.merchant],
    );

    const createTransaction = useCallback(
        (selectedParticipants) => {
            const trimmedComment = props.iou.comment.trim();

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT && CONST.REGEX.NUMBER.test(reportID.current)) {
                IOU.splitBill(
                    selectedParticipants,
                    props.currentUserPersonalDetails.login,
                    props.currentUserPersonalDetails.accountID,
                    props.iou.amount,
                    trimmedComment,
                    props.iou.currency,
                    reportID.current,
                );
                return;
            }

            // If the request is created from the global create menu, we also navigate the user to the group report
            if (iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT) {
                IOU.splitBillAndOpenReport(
                    selectedParticipants,
                    props.currentUserPersonalDetails.login,
                    props.currentUserPersonalDetails.accountID,
                    props.iou.amount,
                    trimmedComment,
                    props.iou.currency,
                );
                return;
            }

            if (props.iou.receiptPath && props.iou.receiptSource) {
                FileUtils.readFileAsync(props.iou.receiptPath, props.iou.receiptSource).then((receipt) => {
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
            props.iou.amount,
            props.iou.comment,
            props.currentUserPersonalDetails.login,
            props.currentUserPersonalDetails.accountID,
            props.iou.currency,
            props.iou.receiptPath,
            props.iou.receiptSource,
            isDistanceRequest,
            requestMoney,
            createDistanceRequest,
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

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
                IOU.sendMoneyViaPaypal(props.report, props.iou.amount, currency, trimmedComment, props.currentUserPersonalDetails.accountID, participant);
                return;
            }

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                IOU.sendMoneyWithWallet(props.report, props.iou.amount, currency, trimmedComment, props.currentUserPersonalDetails.accountID, participant);
            }
        },
        [props.iou.amount, props.iou.comment, participants, props.iou.currency, props.currentUserPersonalDetails.accountID, props.report],
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={isDistanceRequest ? props.translate('common.distance') : props.translate('iou.cash')}
                        onBackButtonPress={navigateBack}
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
                                transactionID={props.iou.transactionID}
                                hasMultipleParticipants={iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT}
                                selectedParticipants={participants}
                                iouAmount={props.iou.amount}
                                iouComment={props.iou.comment}
                                iouCurrencyCode={props.iou.currency}
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
                                receiptSource={props.iou.receiptSource}
                                iouType={iouType.current}
                                reportID={reportID.current}
                                // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                                // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                                // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                                // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                                // the floating-action-button (since it is something that exists outside the context of a report).
                                canModifyParticipants={!_.isEmpty(reportID.current)}
                                policyID={props.report.policyID}
                                bankAccountRoute={ReportUtils.getBankAccountRoute(props.report)}
                                iouMerchant={props.iou.merchant}
                                iouCreated={props.iou.created}
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
    withOnyx({
        report: {
            key: ({route, iou}) => {
                let reportID = lodashGet(route, 'params.reportID', '');
                if (!reportID) {
                    // When the money request creation flow is initialized on Global Create, the reportID is not passed as a navigation parameter.
                    // Get the report id from the participants list on the IOU object stored in Onyx.
                    reportID = lodashGet(iou, 'participants.0.reportID', '');
                }
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
)(MoneyRequestConfirmPage);
