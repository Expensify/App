import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import * as TransactionEdit from '@libs/actions/TransactionEdit';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import {getRequestType} from '@libs/TransactionUtils';
import MoneyRequestAmountForm from '@pages/iou/steps/MoneyRequestAmountForm';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type AmountParams = {
    amount: string;
    paymentMethod?: PaymentMethodType;
};

type IOURequestStepAmountOnyxProps = {
    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the confirmation step should be skipped */
    skipConfirmation: OnyxEntry<boolean>;

    /** The backup transaction object being modified in Onyx */
    draftTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Personal details of all users */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;

    /** The policy which the user has access to and which the report is tied to */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type IOURequestStepAmountProps = IOURequestStepAmountOnyxProps &
    WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_AMOUNT | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<OnyxTypes.Transaction>;
    };

function IOURequestStepAmount({
    report,
    route: {
        params: {iouType, reportID, transactionID, backTo, action, currency: selectedCurrency = ''},
    },
    transaction,
    policy,
    personalDetails,
    currentUserPersonalDetails,
    splitDraftTransaction,
    draftTransaction,
    skipConfirmation,
}: IOURequestStepAmountProps) {
    const {translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSaveButtonPressed = useRef(false);
    const iouRequestType = getRequestType(transaction);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isEditingSplitBill = isEditing && isSplitBill;
    const {amount: transactionAmount} = ReportUtils.getTransactionDetails(isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction) ?? {amount: 0};
    const {currency: originalCurrency} = ReportUtils.getTransactionDetails(isEditing ? draftTransaction : transaction) ?? {currency: CONST.CURRENCY.USD};
    const currency = CurrencyUtils.isValidCurrencyCode(selectedCurrency) ? selectedCurrency : originalCurrency;

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace request, as
    // the user will have to add a merchant.
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID || iouType === CONST.IOU.TYPE.TRACK_EXPENSE) {
            return false;
        }

        return !(ReportUtils.isArchivedRoom(report) || ReportUtils.isPolicyExpenseChat(report));
    }, [report, skipConfirmation, iouType]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    useEffect(() => {
        if (!isEditing) {
            return;
        }
        // A temporary solution to not prevent users from editing the currency
        // We create a backup transaction and use it to save the currency and remove this transaction backup if we don't save the amount
        // It should be removed after this issue https://github.com/Expensify/App/issues/34607 is fixed
        TransactionEdit.createBackupTransaction(isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction);

        return () => {
            if (isSaveButtonPressed.current) {
                return;
            }
            TransactionEdit.removeBackupTransaction(transaction?.transactionID ?? '');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const navigateToCurrencySelectionPage = () => {
        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(action, iouType, transactionID, reportID, backTo ? 'confirm' : '', currency, Navigation.getActiveRouteWithoutParams()),
        );
    };

    const navigateToNextPage = ({amount, paymentMethod}: AmountParams) => {
        isSaveButtonPressed.current = true;
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        IOU.setMoneyRequestAmount(transactionID, amountInSmallestCurrencyUnits, currency || CONST.CURRENCY.USD);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report?.reportID && !ReportUtils.isArchivedRoom(report)) {
            const selectedParticipants = IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? 0;
                return participantAccountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
            });
            const backendAmount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

            if (shouldSkipConfirmation) {
                if (iouType === CONST.IOU.TYPE.SPLIT) {
                    IOU.splitBillAndOpenReport({
                        participants,
                        currentUserLogin: currentUserPersonalDetails.login ?? '',
                        currentUserAccountID: currentUserPersonalDetails.accountID ?? 0,
                        amount: backendAmount,
                        comment: '',
                        currency,
                        merchant: '',
                        tag: '',
                        category: '',
                        created: transaction?.created ?? '',
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
                        transaction?.created ?? '',
                        '',
                        currentUserPersonalDetails.login ?? '',
                        currentUserPersonalDetails.accountID ?? 0,
                        participants[0],
                        '',
                        {},
                    );
                    return;
                }
            }
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };

    const saveAmountAndCurrency = ({amount, paymentMethod}: AmountParams) => {
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

        IOU.updateMoneyRequestAmountAndCurrency({transactionID, transactionThreadReportID: reportID, currency, amount: newAmount});
        Navigation.dismissModal();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.amount')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepAmount.displayName}
            shouldShowWrapper={!!backTo || isEditing}
            includeSafeAreaPaddingBottom
        >
            <MoneyRequestAmountForm
                isEditing={!!backTo || isEditing}
                currency={currency}
                amount={Math.abs(transactionAmount)}
                skipConfirmation={shouldSkipConfirmation ?? false}
                iouType={iouType}
                policyID={policy?.id ?? ''}
                bankAccountRoute={ReportUtils.getBankAccountRoute(report)}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={saveAmountAndCurrency}
                selectedTab={iouRequestType}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAmount.displayName = 'IOURequestStepAmount';

const IOURequestStepAmountWithOnyx = withOnyx<IOURequestStepAmountProps, IOURequestStepAmountOnyxProps>({
    splitDraftTransaction: {
        key: ({route}) => {
            const transactionID = route.params.transactionID ?? 0;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
        },
    },
    draftTransaction: {
        key: ({route}) => {
            const transactionID = route.params.transactionID ?? 0;
            return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`;
        },
    },
    skipConfirmation: {
        key: ({route}) => {
            const transactionID = route.params.transactionID ?? 0;
            return `${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`;
        },
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
})(IOURequestStepAmount);

const IOURequestStepAmountWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepAmountWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepAmountWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepAmountWithCurrentUserPersonalDetails);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepAmountWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepAmountWithWritableReportOrNotFound);

export default IOURequestStepAmountWithFullTransactionOrNotFound;
