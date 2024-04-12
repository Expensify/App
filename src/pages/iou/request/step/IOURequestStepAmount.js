import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import lodashIsEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import transactionPropTypes from '@components/transactionPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import * as TransactionEdit from '@libs/actions/TransactionEdit';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import {getRequestType} from '@libs/TransactionUtils';
import MoneyRequestAmountForm from '@pages/iou/steps/MoneyRequestAmountForm';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The report that the transaction belongs to */
    report: reportPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,

    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: transactionPropTypes,

    /** Whether the confirmation step should be skipped */
    skipConfirmation: PropTypes.bool,

    /** The draft transaction object being modified in Onyx */
    draftTransaction: transactionPropTypes,

    /** Personal details of all users */
    personalDetails: personalDetailsPropType,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
    policy: {},
    personalDetails: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
    splitDraftTransaction: {},
    draftTransaction: {},
    skipConfirmation: false,
};

function IOURequestStepAmount({
    report,
    route: {
        params: {iouType, reportID, transactionID, backTo, action},
    },
    transaction,
    policy,
    personalDetails,
    currentUserPersonalDetails,
    splitDraftTransaction,
    draftTransaction,
    skipConfirmation,
}) {
    const {translate} = useLocalize();
    const textInput = useRef(null);
    const focusTimeoutRef = useRef(null);
    const isSaveButtonPressed = useRef(false);
    const originalCurrency = useRef(null);
    const iouRequestType = getRequestType(transaction);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isEditingSplitBill = isEditing && isSplitBill;
    const {amount: transactionAmount} = ReportUtils.getTransactionDetails(isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction);
    const {currency} = ReportUtils.getTransactionDetails(isEditing ? draftTransaction : transaction);

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace request, as
    // the user will have to add a merchant.
    const shouldSkipConfirmation = skipConfirmation && report.reportID && !ReportUtils.isArchivedRoom(report) && !ReportUtils.isPolicyExpenseChat(report);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current && textInput.current.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    useEffect(() => {
        if (isEditing) {
            // A temporary solution to not prevent users from editing the currency
            // We create a backup transaction and use it to save the currency and remove this transaction backup if we don't save the amount
            // It should be removed after this issue https://github.com/Expensify/App/issues/34607 is fixed
            TransactionEdit.createBackupTransaction(isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction);

            return () => {
                if (isSaveButtonPressed.current) {
                    return;
                }
                TransactionEdit.removeBackupTransaction(transaction.transactionID || '');
            };
        }
        if (transaction.originalCurrency) {
            originalCurrency.current = transaction.originalCurrency;
        } else {
            originalCurrency.current = currency;
            IOU.setMoneyRequestOriginalCurrency_temporaryForRefactor(transactionID, currency);
        }
        return () => {
            if (isSaveButtonPressed.current) {
                return;
            }
            IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, originalCurrency.current, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const navigateToCurrencySelectionPage = () => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(action, iouType, transactionID, reportID, backTo ? 'confirm' : '', Navigation.getActiveRouteWithoutParams()));
    };

    /**
     * @param {Number} amount
     */
    const navigateToNextPage = ({amount, paymentMethod}) => {
        isSaveButtonPressed.current = true;
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

        IOU.setMoneyRequestAmount_temporaryForRefactor(transactionID, amountInSmallestCurrencyUnits, currency || CONST.CURRENCY.USD, true);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID && !ReportUtils.isArchivedRoom(report)) {
            const selectedParticipants = IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            const participants = _.map(selectedParticipants, (participant) => {
                const participantAccountID = lodashGet(participant, 'accountID', 0);
                return participantAccountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
            });
            const backendAmount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

            if (shouldSkipConfirmation) {
                if (iouType === CONST.IOU.TYPE.SPLIT) {
                    IOU.splitBillAndOpenReport({
                        participants,
                        currentUserLogin: currentUserPersonalDetails.login || '',
                        currentUserAccountID: currentUserPersonalDetails.accountID || 0,
                        amount: backendAmount,
                        comment: '',
                        currency: currency,
                        tag: '',
                        category: '',
                        created: transaction.created,
                        billable: false,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                    });
                    return;
                }
                if (iouType === CONST.IOU.TYPE.SEND) {
                    if (paymentMethod && paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                        IOU.sendMoneyWithWallet(report, backendAmount, currency, '', currentUserPersonalDetails.accountID, participants[0]);
                        return;
                    }

                    IOU.sendMoneyElsewhere(report, backendAmount, currency, '', currentUserPersonalDetails.accountID, participants[0]);
                    return;
                }
                if (iouType === CONST.IOU.TYPE.REQUEST) {
                    IOU.requestMoney(
                        report,
                        backendAmount,
                        currency,
                        transaction.created,
                        '',
                        currentUserPersonalDetails.login,
                        currentUserPersonalDetails.accountID,
                        participants[0],
                        '',
                        null,
                    );
                    return;
                }
            }
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };

    const saveAmountAndCurrency = ({amount, paymentMethod}) => {
        if (!isEditing) {
            navigateToNextPage({amount, paymentMethod});
            return;
        }

        const newAmount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

        // If the value hasn't changed, don't request to save changes on the server and just close the modal
        if (newAmount === TransactionUtils.getAmount(transaction) && currency === TransactionUtils.getCurrency(transaction)) {
            Navigation.dismissModal();
            return;
        }

        if (isSplitBill) {
            IOU.setDraftSplitTransaction(transactionID, {amount: newAmount, currency});
            Navigation.goBack(backTo);
            return;
        }

        IOU.updateMoneyRequestAmountAndCurrency(transactionID, reportID, currency, newAmount);
        Navigation.dismissModal();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.amount')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepAmount.displayName}
            shouldShowWrapper={Boolean(backTo || isEditing)}
            includeSafeAreaPaddingBottom
        >
            <MoneyRequestAmountForm
                isEditing={Boolean(backTo || isEditing)}
                currency={currency}
                amount={Math.abs(transactionAmount)}
                skipConfirmation={shouldSkipConfirmation}
                iouType={iouType}
                policyID={policy.policyID}
                bankAccountRoute={ReportUtils.getBankAccountRoute(report)}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={saveAmountAndCurrency}
                selectedTab={iouRequestType}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAmount.propTypes = propTypes;
IOURequestStepAmount.defaultProps = defaultProps;
IOURequestStepAmount.displayName = 'IOURequestStepAmount';

export default compose(
    withCurrentUserPersonalDetails,
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        splitDraftTransaction: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
            },
        },
        draftTransaction: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`;
            },
        },
        skipConfirmation: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`;
            },
        },
    }),
)(IOURequestStepAmount);
