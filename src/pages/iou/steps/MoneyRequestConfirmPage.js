import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import MoneyRequestConfirmationList from '../../../components/MoneyRequestConfirmationList';
import CONST from '../../../CONST';
import optionPropTypes from '../../../components/optionPropTypes';
import withMoneyRequest from '../withMoneyRequest';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import * as IOU from '../../../libs/actions/IOU';
import compose from '../../../libs/compose';
import withLocalize from '../../../components/withLocalize';
import ModalHeader from '../ModalHeader';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import reportPropTypes from '../../reportPropTypes';

const propTypes = {
    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes).isRequired,

    // Holds data related to request view state, rather than the underlying request data.
    iou: PropTypes.shape({
        /** Whether or not transaction creation has started */
        creatingIOUTransaction: PropTypes.bool,

        /** Whether or not transaction creation has resulted to error */
        error: PropTypes.bool,
    }),

    report: reportPropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    iou: {
        creatingIOUTransaction: false,
        error: false,
    },
    report: {},
    canModifyParticipants: false,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const MoneyRequestConfirmPage = (props) => {
    const prevCreatingIOUTransactionStatusRef = useRef(lodashGet(props.iou, 'creatingIOUTransaction'));
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    useEffect(() => {
        props.redirectIfEmpty([props.participants, props.amount], iouType.current, reportID.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // We only want to check if we just finished creating an IOU transaction
        // We check it within this effect because we're sending the request optimistically but if an error occurs from the API, we will update the iou state with the error later
        if (!prevCreatingIOUTransactionStatusRef.current || lodashGet(props.iou, 'creatingIOUTransaction')) {
            return;
        }

        if (lodashGet(props.iou, 'error') === true) {
            Navigation.navigate(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current));
        } else {
            Navigation.dismissModal();
        }
    }, [props.iou]);

    useEffect(() => {
        // Used to store previous prop values to compare on next render
        prevCreatingIOUTransactionStatusRef.current = lodashGet(props.iou, 'creatingIOUTransaction');
    });

    const createTransaction = useCallback((selectedParticipants) => {
        const trimmedComment = props.comment.trim();

        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT && CONST.REGEX.NUMBER.test(reportID.current)) {
            IOU.splitBill(
                selectedParticipants,
                props.currentUserPersonalDetails.login,
                props.amount,
                trimmedComment,
                props.currency,
                props.preferredLocale,
                reportID.current,
            );
            return;
        }

        // If the request is created from the global create menu, we also navigate the user to the group report
        if (iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT) {
            IOU.splitBillAndOpenReport(
                selectedParticipants,
                props.currentUserPersonalDetails.login,
                props.amount,
                trimmedComment,
                props.currency,
                props.preferredLocale,
            );
            return;
        }
        if (!selectedParticipants[0].login) {
            // TODO - request to the policy expense chat. Not implemented yet!
            // Will be implemented here: https://github.com/Expensify/Expensify/issues/270581
            return;
        }
        IOU.requestMoney(
            props.report,
            Math.round(props.amount * 100),
            props.currency,
            props.currentUserPersonalDetails.login,
            selectedParticipants[0],
            trimmedComment,
        );
    }, [props.amount, props.comment, props.currentUserPersonalDetails.login, props.currency, props.preferredLocale, props.report]);

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     *
     * @param {String} paymentMethodType
     */
    const sendMoney = useCallback((paymentMethodType) => {
        const amountInDollars = Math.round(props.amount * 100);
        const currency = props.currency;
        const trimmedComment = props.comment.trim();
        const participant = props.participants[0];

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            IOU.sendMoneyElsewhere(
                props.report,
                amountInDollars,
                currency,
                trimmedComment,
                props.currentUserPersonalDetails.login,
                participant,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
            IOU.sendMoneyViaPaypal(
                props.report,
                amountInDollars,
                currency,
                trimmedComment,
                props.currentUserPersonalDetails.login,
                participant,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            IOU.sendMoneyWithWallet(
                props.report,
                amountInDollars,
                currency,
                trimmedComment,
                props.currentUserPersonalDetails.login,
                participant,
            );
        }
    }, [props.amount, props.comment, props.participants, props.currentUserPersonalDetails.login, props.currency, props.report]);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <ModalHeader
                        title={props.translate('iou.cash')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <MoneyRequestConfirmationList
                        hasMultipleParticipants={iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT}
                        onConfirm={(selectedParticipants) => {
                            // TODO: ADD HANDLING TO DISABLE BUTTON FUNCTIONALITY WHILE REQUEST IS IN FLIGHT
                            createTransaction(selectedParticipants);
                            ReportScrollManager.scrollToBottom();
                        }}
                        onSendMoney={(paymentMethodType) => {
                            // TODO: ADD HANDLING TO DISABLE BUTTON FUNCTIONALITY WHILE REQUEST IS IN FLIGHT
                            sendMoney(paymentMethodType);
                            ReportScrollManager.scrollToBottom();
                        }}
                        iouType={iouType.current}
                        reportID={reportID.current}

                        // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                        // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                        // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                        // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                        // the floating-action-button (since it is something that exists outside the context of a report).
                        canModifyParticipants={!_.isEmpty(reportID.current)}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
};

MoneyRequestConfirmPage.displayName = 'IOUConfirmPage';
MoneyRequestConfirmPage.propTypes = propTypes;
MoneyRequestConfirmPage.defaultProps = defaultProps;

export default compose(
    withMoneyRequest,
    withCurrentUserPersonalDetails,
    withLocalize,
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
    }),
)(MoneyRequestConfirmPage);
