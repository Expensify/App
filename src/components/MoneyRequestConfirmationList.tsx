import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {MouseProvider} from '@hooks/useMouseContext';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {
    adjustRemainingSplitShares,
    resetSplitShares,
    setCustomUnitRateID,
    setIndividualShare,
    setMoneyRequestAmount,
    setMoneyRequestCategory,
    setMoneyRequestMerchant,
    setMoneyRequestPendingFields,
    setMoneyRequestTag,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
    setSplitShares,
} from '@libs/actions/IOU';
import {convertToBackendAmount, convertToDisplayString, convertToDisplayStringWithoutCurrency, getCurrencyDecimals} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateAmount, insertTagIntoTransactionTagsString, isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {validateAmount} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUConfirmationOptionsFromPayeePersonalDetail, hasEnabledOptions} from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import {getDistanceRateCustomUnitRate, getTagLists, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {isSelectedManagerMcTest} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {
    areRequiredFieldsEmpty,
    calculateTaxAmount,
    getDefaultTaxCode,
    getDistanceInMeters,
    getRateID,
    getTag,
    getTaxValue,
    hasMissingSmartscanFields,
    hasRoute as hasRouteUtil,
    isMerchantMissing,
    isScanRequest as isScanRequestUtil,
} from '@libs/TransactionUtils';
import {hasInvoicingDetails} from '@userActions/Policy/Policy';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {SplitShares} from '@src/types/onyx/Transaction';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import FormHelpMessage from './FormHelpMessage';
import MoneyRequestAmountInput from './MoneyRequestAmountInput';
import MoneyRequestConfirmationListFooter from './MoneyRequestConfirmationListFooter';
import {PressableWithFeedback} from './Pressable';
import {useProductTrainingContext} from './ProductTrainingContext';
import SelectionList from './SelectionList';
import type {SectionListDataType} from './SelectionList/types';
import UserListItem from './SelectionList/UserListItem';
import SettlementButton from './SettlementButton';
import Text from './Text';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type MoneyRequestConfirmationListProps = {
    /** Callback to inform parent modal of success */
    onConfirm?: (selectedParticipants: Participant[]) => void;

    /** Callback to parent modal to pay someone */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    /** IOU amount */
    iouAmount: number;

    /** IOU attendees list */
    iouAttendees?: Attendee[];

    /** IOU comment */
    iouComment?: string;

    /** IOU currency */
    iouCurrencyCode?: string;

    /** IOU type */
    iouType?: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** IOU date */
    iouCreated?: string;

    /** IOU merchant */
    iouMerchant?: string;

    /** IOU Category */
    iouCategory?: string;

    /** IOU isBillable */
    iouIsBillable?: boolean;

    /** Callback to toggle the billable state */
    onToggleBillable?: (isOn: boolean) => void;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Should the list be read only, and not editable? */
    isReadOnly?: boolean;

    /** Depending on expense report or personal IOU report, respective bank account route */
    bankAccountRoute?: Route;

    /** The policyID of the request */
    policyID?: string;

    /** The reportID of the request */
    reportID?: string;

    /** File path of the receipt */
    receiptPath?: string;

    /** File name of the receipt */
    receiptFilename?: string;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is a distance expense */
    isDistanceRequest: boolean;

    /** Whether the expense is a per diem expense */
    isPerDiemRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** Whether we can navigate to receipt page */
    shouldDisplayReceipt?: boolean;

    /** Whether we should show the amount, date, and merchant fields. */
    shouldShowSmartScanFields?: boolean;

    /** A flag for verifying that the current report is a sub-report of a workspace chat */
    isPolicyExpenseChat?: boolean;

    /** Whether smart scan failed */
    hasSmartScanFailed?: boolean;

    /** The ID of the report action */
    reportActionID?: string;

    /** The action to take */
    action?: IOUAction;

    /** Should play sound on confirmation */
    shouldPlaySound?: boolean;

    /** Whether the expense is confirmed or not */
    isConfirmed?: boolean;

    /** Whether the expense is in the process of being confirmed */
    isConfirming?: boolean;

    /** Whether the receipt can be replaced */
    isReceiptEditable?: boolean;

    /** The PDF load error callback */
    onPDFLoadError?: () => void;

    /** The PDF password callback */
    onPDFPassword?: () => void;
};

type MoneyRequestConfirmationListItem = Participant | OptionData;

function MoneyRequestConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    iouType = CONST.IOU.TYPE.SUBMIT,
    iouAmount,
    isDistanceRequest,
    isPerDiemRequest = false,
    isPolicyExpenseChat = false,
    iouCategory = '',
    shouldShowSmartScanFields = true,
    isEditingSplitBill,
    iouCurrencyCode,
    isReceiptEditable,
    iouMerchant,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    bankAccountRoute = '',
    policyID,
    reportID = '',
    receiptPath = '',
    iouAttendees,
    iouComment,
    receiptFilename = '',
    iouCreated,
    iouIsBillable = false,
    onToggleBillable,
    hasSmartScanFailed,
    reportActionID,
    action = CONST.IOU.ACTION.CREATE,
    shouldDisplayReceipt = false,
    shouldPlaySound = true,
    isConfirmed,
    isConfirming,
    onPDFLoadError,
    onPDFPassword,
}: MoneyRequestConfirmationListProps) {
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);
    const [defaultMileageRate] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {
        selector: (selectedPolicy) => DistanceRequestUtils.getDefaultMileageRate(selectedPolicy),
    });
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_CONFIRMATION,
        Permissions.canUseManagerMcTest(betas) && selectedParticipantsProp.some((participant) => isSelectedManagerMcTest(participant.login)),
    );

    const policy = policyReal ?? policyDraft;
    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;

    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isTypeRequest = iouType === CONST.IOU.TYPE.SUBMIT;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const isScanRequest = useMemo(() => isScanRequestUtil(transaction), [transaction]);
    const isCreateExpenseFlow = transaction?.isFromGlobalCreate && !isPerDiemRequest;

    const transactionID = transaction?.transactionID;
    const customUnitRateID = getRateID(transaction);

    useEffect(() => {
        if (customUnitRateID !== '-1' || !isDistanceRequest || !transactionID || !policy?.id) {
            return;
        }

        const defaultRate = defaultMileageRate?.customUnitRateID;
        const lastSelectedRate = lastSelectedDistanceRates?.[policy.id] ?? defaultRate;
        const rateID = lastSelectedRate;

        if (!rateID) {
            return;
        }

        setCustomUnitRateID(transactionID, rateID);
    }, [defaultMileageRate, customUnitRateID, lastSelectedDistanceRates, policy?.id, transactionID, isDistanceRequest]);

    const mileageRate = DistanceRequestUtils.getRate({transaction, policy, policyDraft});
    const rate = mileageRate.rate;
    const prevRate = usePrevious(rate);
    const unit = mileageRate.unit;
    const prevUnit = usePrevious(unit);
    const currency = mileageRate.currency ?? CONST.CURRENCY.USD;
    const prevCurrency = usePrevious(currency);

    // A flag for showing the categories field
    const shouldShowCategories = (isPolicyExpenseChat || isTypeInvoice) && (!!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowMerchant = shouldShowSmartScanFields && !isDistanceRequest && !isTypeSend && !isPerDiemRequest;

    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest, isPerDiemRequest);

    const previousTransactionAmount = usePrevious(transaction?.amount);
    const previousTransactionCurrency = usePrevious(transaction?.currency);
    const previousTransactionModifiedCurrency = usePrevious(transaction?.modifiedCurrency);
    const previousCustomUnitRateID = usePrevious(customUnitRateID);
    useEffect(() => {
        // previousTransaction is in the condition because if it is falsey, it means this is the first time the useEffect is triggered after we load it, so we should calculate the default
        // tax even if the other parameters are the same against their previous values.
        if (
            !shouldShowTax ||
            !transaction ||
            !transactionID ||
            (transaction.taxCode &&
                previousTransactionModifiedCurrency === transaction.modifiedCurrency &&
                previousTransactionCurrency === transaction.currency &&
                previousCustomUnitRateID === customUnitRateID)
        ) {
            return;
        }
        const defaultTaxCode = getDefaultTaxCode(policy, transaction);
        setMoneyRequestTaxRate(transactionID, defaultTaxCode ?? '');
    }, [customUnitRateID, policy, previousCustomUnitRateID, previousTransactionCurrency, previousTransactionModifiedCurrency, shouldShowTax, transaction, transactionID]);

    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);

    const distance = getDistanceInMeters(transaction, unit);
    const prevDistance = usePrevious(distance);

    const shouldCalculateDistanceAmount = isDistanceRequest && (iouAmount === 0 || prevRate !== rate || prevDistance !== distance || prevCurrency !== currency || prevUnit !== unit);

    const hasRoute = hasRouteUtil(transaction, isDistanceRequest);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate) && !isMovingTransactionFromTrackExpense;
    const distanceRequestAmount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
    const formattedAmount = isDistanceRequestWithPendingRoute
        ? ''
        : convertToDisplayString(shouldCalculateDistanceAmount ? distanceRequestAmount : iouAmount, isDistanceRequest ? currency : iouCurrencyCode);
    const formattedAmountPerAttendee = isDistanceRequestWithPendingRoute
        ? ''
        : convertToDisplayString(
              (shouldCalculateDistanceAmount ? distanceRequestAmount : iouAmount) / (iouAttendees?.length && iouAttendees.length > 0 ? iouAttendees.length : 1),
              isDistanceRequest ? currency : iouCurrencyCode,
          );
    const isFocused = useIsFocused();
    const [formError, debouncedFormError, setFormError] = useDebouncedState<TranslationPaths | ''>('');

    const [didConfirm, setDidConfirm] = useState(isConfirmed);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    // Clear the form error if it's set to one among the list passed as an argument
    const clearFormErrors = useCallback(
        (errors: string[]) => {
            if (!errors.includes(formError)) {
                return;
            }

            setFormError('');
        },
        [formError, setFormError],
    );

    const shouldDisplayFieldError: boolean = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (!!hasSmartScanFailed && hasMissingSmartscanFields(transaction)) || (didConfirmSplit && areRequiredFieldsEmpty(transaction));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = useMemo(() => !iouMerchant || isMerchantMissing(transaction), [transaction, iouMerchant]);
    const isMerchantRequired = isPolicyExpenseChat && (!isScanRequest || isEditingSplitBill) && shouldShowMerchant;

    const isCategoryRequired = !!policy?.requiresCategory;

    useEffect(() => {
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        // reset the form error whenever the screen gains or loses focus
        setFormError('');

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want this effect to run if it's just setFormError that changes
    }, [isFocused, transaction, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit]);

    useEffect(() => {
        // We want this effect to run only when the transaction is moving from Self DM to a workspace chat
        if (!transactionID || !isDistanceRequest || !isMovingTransactionFromTrackExpense || !isPolicyExpenseChat) {
            return;
        }

        const errorKey = 'iou.error.invalidRate';
        const policyRates = DistanceRequestUtils.getMileageRates(policy);

        // If the selected rate belongs to the policy, clear the error
        if (customUnitRateID && Object.keys(policyRates).includes(customUnitRateID)) {
            clearFormErrors([errorKey]);
            return;
        }

        // If there is a distance rate in the policy that matches the rate and unit of the currently selected mileage rate, select it automatically
        const matchingRate = Object.values(policyRates).find((policyRate) => policyRate.rate === mileageRate.rate && policyRate.unit === mileageRate.unit);
        if (matchingRate?.customUnitRateID) {
            setCustomUnitRateID(transactionID, matchingRate.customUnitRateID);
            return;
        }

        // If none of the above conditions are met, display the rate error
        setFormError(errorKey);
    }, [isDistanceRequest, isPolicyExpenseChat, transactionID, mileageRate, customUnitRateID, policy, isMovingTransactionFromTrackExpense, setFormError, clearFormErrors]);

    const routeError = Object.values(transaction?.errorFields?.route ?? {}).at(0);
    const isFirstUpdatedDistanceAmount = useRef(false);

    useEffect(() => {
        if (isFirstUpdatedDistanceAmount.current) {
            return;
        }
        if (!isDistanceRequest || !transactionID) {
            return;
        }
        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
        setMoneyRequestAmount(transactionID, amount, currency ?? '');
        isFirstUpdatedDistanceAmount.current = true;
    }, [distance, rate, unit, transactionID, currency, isDistanceRequest]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount || !transactionID) {
            return;
        }

        const amount = distanceRequestAmount;
        setMoneyRequestAmount(transactionID, amount, currency ?? '');

        // If it's a split request among individuals, set the split shares
        const participantAccountIDs: number[] = selectedParticipantsProp.map((participant) => participant.accountID ?? CONST.DEFAULT_NUMBER_ID);
        if (isTypeSplit && !isPolicyExpenseChat && amount && transaction?.currency) {
            setSplitShares(transaction, amount, currency, participantAccountIDs);
        }
    }, [shouldCalculateDistanceAmount, distanceRequestAmount, transactionID, currency, isTypeSplit, isPolicyExpenseChat, selectedParticipantsProp, transaction]);

    const previousTaxCode = usePrevious(transaction?.taxCode);

    // Calculate and set tax amount in transaction draft
    useEffect(() => {
        if (
            !shouldShowTax ||
            !transaction ||
            (transaction.taxAmount !== undefined &&
                previousTransactionAmount === transaction.amount &&
                previousTransactionCurrency === transaction.currency &&
                previousCustomUnitRateID === customUnitRateID &&
                previousTaxCode === transaction.taxCode)
        ) {
            return;
        }

        let taxableAmount: number | undefined;
        let taxCode: string | undefined;
        if (isDistanceRequest) {
            if (customUnitRateID) {
                const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
                taxCode = customUnitRate?.attributes?.taxRateExternalID;
                taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, distance);
            }
        } else {
            taxableAmount = transaction.amount ?? 0;
            taxCode = transaction.taxCode ?? getDefaultTaxCode(policy, transaction) ?? '';
        }

        if (taxCode && taxableAmount) {
            const taxPercentage = getTaxValue(policy, transaction, taxCode) ?? '';
            const taxAmount = calculateTaxAmount(taxPercentage, taxableAmount, transaction.currency);
            const taxAmountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(taxAmount.toString()));
            setMoneyRequestTaxAmount(transaction.transactionID, taxAmountInSmallestCurrencyUnits);
        }
    }, [
        policy,
        shouldShowTax,
        previousTransactionAmount,
        previousTransactionCurrency,
        transaction,
        isDistanceRequest,
        customUnitRateID,
        previousCustomUnitRateID,
        previousTaxCode,
        distance,
    ]);

    // If completing a split expense fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    useEffect(() => {
        setDidConfirm(isConfirmed);
    }, [isConfirmed]);

    const splitOrRequestOptions: Array<DropdownOption<string>> = useMemo(() => {
        let text;
        if (isTypeInvoice) {
            if (hasInvoicingDetails(policy)) {
                text = translate('iou.sendInvoice', {amount: formattedAmount});
            } else {
                text = translate('common.next');
            }
        } else if (isTypeTrackExpense) {
            text = translate('iou.createExpense');
            if (iouAmount !== 0) {
                text = translate('iou.createExpenseWithAmount', {amount: formattedAmount});
            }
        } else if (isTypeSplit && iouAmount === 0) {
            text = translate('iou.splitExpense');
        } else if ((receiptPath && isTypeRequest) || isDistanceRequestWithPendingRoute || isPerDiemRequest) {
            text = translate('iou.createExpense');
            if (iouAmount !== 0) {
                text = translate('iou.createExpenseWithAmount', {amount: formattedAmount});
            }
        } else {
            const translationKey = isTypeSplit ? 'iou.splitAmount' : 'iou.createExpenseWithAmount';
            text = translate(translationKey, {amount: formattedAmount});
        }
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: iouType,
            },
        ];
    }, [
        isTypeInvoice,
        isTypeTrackExpense,
        isTypeSplit,
        iouAmount,
        receiptPath,
        isTypeRequest,
        isDistanceRequestWithPendingRoute,
        isPerDiemRequest,
        iouType,
        policy,
        translate,
        formattedAmount,
    ]);

    const onSplitShareChange = useCallback(
        (accountID: number, value: number) => {
            if (!transaction?.transactionID) {
                return;
            }
            const amountInCents = convertToBackendAmount(value);
            setIndividualShare(transaction?.transactionID, accountID, amountInCents);
        },
        [transaction],
    );

    useEffect(() => {
        if (!isTypeSplit || !transaction?.splitShares) {
            return;
        }

        const splitSharesMap: SplitShares = transaction.splitShares;
        const shares: number[] = Object.values(splitSharesMap).map((splitShare) => splitShare?.amount ?? 0);
        const sumOfShares = shares?.reduce((prev, current): number => prev + current, 0);
        if (sumOfShares !== iouAmount) {
            setFormError('iou.error.invalidSplit');
            return;
        }

        const participantsWithAmount = Object.keys(transaction?.splitShares ?? {})
            .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
            .map((accountID) => Number(accountID));

        // A split must have at least two participants with amounts bigger than 0
        if (participantsWithAmount.length === 1) {
            setFormError('iou.error.invalidSplitParticipants');
            return;
        }

        // Amounts should be bigger than 0 for the split bill creator (yourself)
        if (transaction?.splitShares[currentUserPersonalDetails.accountID] && (transaction.splitShares[currentUserPersonalDetails.accountID]?.amount ?? 0) === 0) {
            setFormError('iou.error.invalidSplitYourself');
            return;
        }

        setFormError('');
    }, [isFocused, transaction, isTypeSplit, transaction?.splitShares, currentUserPersonalDetails.accountID, iouAmount, iouCurrencyCode, setFormError, translate]);

    useEffect(() => {
        if (!isTypeSplit || !transaction?.splitShares) {
            return;
        }
        adjustRemainingSplitShares(transaction);
    }, [isTypeSplit, transaction]);

    const selectedParticipants = useMemo(() => selectedParticipantsProp.filter((participant) => participant.selected), [selectedParticipantsProp]);
    const payeePersonalDetails = useMemo(() => payeePersonalDetailsProp ?? currentUserPersonalDetails, [payeePersonalDetailsProp, currentUserPersonalDetails]);
    const shouldShowReadOnlySplits = useMemo(() => isPolicyExpenseChat || isReadOnly || isScanRequest, [isPolicyExpenseChat, isReadOnly, isScanRequest]);

    const splitParticipants = useMemo(() => {
        if (!isTypeSplit) {
            return [];
        }

        const payeeOption = getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails);
        if (shouldShowReadOnlySplits) {
            return [payeeOption, ...selectedParticipants].map((participantOption: Participant) => {
                const isPayer = participantOption.accountID === payeeOption.accountID;
                let amount: number | undefined = 0;
                if (iouAmount > 0) {
                    amount =
                        transaction?.comment?.splits?.find((split) => split.accountID === participantOption.accountID)?.amount ??
                        calculateAmount(selectedParticipants.length, iouAmount, iouCurrencyCode ?? '', isPayer);
                }
                return {
                    ...participantOption,
                    isSelected: false,
                    isInteractive: false,
                    rightElement: (
                        <View style={[styles.flexWrap, styles.pl2]}>
                            <Text style={[styles.textLabel]}>{amount ? convertToDisplayString(amount, iouCurrencyCode) : ''}</Text>
                        </View>
                    ),
                };
            });
        }

        const currencySymbol = currencyList?.[iouCurrencyCode ?? '']?.symbol ?? iouCurrencyCode;
        const formattedTotalAmount = convertToDisplayStringWithoutCurrency(iouAmount, iouCurrencyCode);

        return [payeeOption, ...selectedParticipants].map((participantOption: Participant) => ({
            ...participantOption,
            tabIndex: -1,
            isSelected: false,
            isInteractive: false,
            rightElement: (
                <MoneyRequestAmountInput
                    autoGrow={false}
                    amount={transaction?.splitShares?.[participantOption.accountID ?? CONST.DEFAULT_NUMBER_ID]?.amount}
                    currency={iouCurrencyCode}
                    prefixCharacter={currencySymbol}
                    disableKeyboard={false}
                    isCurrencyPressable={false}
                    hideFocusedState={false}
                    hideCurrencySymbol
                    formatAmountOnBlur
                    prefixContainerStyle={[styles.pv0]}
                    inputStyle={[styles.optionRowAmountInput]}
                    containerStyle={[styles.textInputContainer]}
                    touchableInputWrapperStyle={[styles.ml3]}
                    onFormatAmount={convertToDisplayStringWithoutCurrency}
                    onAmountChange={(value: string) => onSplitShareChange(participantOption.accountID ?? CONST.DEFAULT_NUMBER_ID, Number(value))}
                    maxLength={formattedTotalAmount.length}
                    contentWidth={formattedTotalAmount.length * 8}
                />
            ),
        }));
    }, [
        isTypeSplit,
        payeePersonalDetails,
        shouldShowReadOnlySplits,
        currencyList,
        iouCurrencyCode,
        iouAmount,
        selectedParticipants,
        styles.flexWrap,
        styles.pl2,
        styles.textLabel,
        styles.pv0,
        styles.optionRowAmountInput,
        styles.textInputContainer,
        styles.ml3,
        transaction?.comment?.splits,
        transaction?.splitShares,
        onSplitShareChange,
    ]);

    const isSplitModified = useMemo(() => {
        if (!transaction?.splitShares) {
            return;
        }
        return Object.keys(transaction.splitShares).some((key) => transaction.splitShares?.[Number(key) ?? -1]?.isModified);
    }, [transaction?.splitShares]);

    const getSplitSectionHeader = useCallback(
        () => (
            <View style={[styles.mt2, styles.mb1, styles.flexRow, styles.justifyContentBetween]}>
                <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('iou.participants')}</Text>
                {!shouldShowReadOnlySplits && !!isSplitModified && (
                    <PressableWithFeedback
                        onPress={() => {
                            resetSplitShares(transaction);
                        }}
                        accessibilityLabel={CONST.ROLE.BUTTON}
                        role={CONST.ROLE.BUTTON}
                        shouldUseAutoHitSlop
                    >
                        <Text style={[styles.pr5, styles.textLabelSupporting, styles.link]}>{translate('common.reset')}</Text>
                    </PressableWithFeedback>
                )}
            </View>
        ),
        [
            isSplitModified,
            shouldShowReadOnlySplits,
            styles.flexRow,
            styles.justifyContentBetween,
            styles.link,
            styles.mb1,
            styles.mt2,
            styles.ph5,
            styles.pr5,
            styles.textLabelSupporting,
            transaction,
            translate,
        ],
    );

    const sections = useMemo(() => {
        const options: Array<SectionListDataType<MoneyRequestConfirmationListItem>> = [];
        if (isTypeSplit) {
            options.push(
                ...[
                    {
                        title: translate('moneyRequestConfirmationList.paidBy'),
                        data: [getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)],
                        shouldShow: true,
                    },
                    {
                        CustomSectionHeader: getSplitSectionHeader,
                        data: splitParticipants,
                        shouldShow: true,
                    },
                ],
            );
            options.push();
        } else {
            const formattedSelectedParticipants = selectedParticipants.map((participant) => ({
                ...participant,
                isSelected: false,
                isInteractive: !!isCreateExpenseFlow,
                shouldShowRightIcon: isCreateExpenseFlow,
            }));
            options.push({
                title: translate('common.to'),
                data: formattedSelectedParticipants,
                shouldShow: true,
            });
        }

        return options;
    }, [isTypeSplit, translate, payeePersonalDetails, getSplitSectionHeader, splitParticipants, selectedParticipants, isCreateExpenseFlow]);

    useEffect(() => {
        if (!isDistanceRequest || (isMovingTransactionFromTrackExpense && !isPolicyExpenseChat) || !transactionID) {
            // We don't want to recalculate the distance merchant when moving a transaction from Track Expense to a 1:1 chat, because the distance rate will be the same default P2P rate.
            // When moving to a policy chat (e.g. sharing with an accountant), we should recalculate the distance merchant with the policy's rate.
            return;
        }

        /*
         Set pending waypoints based on the route status. We should handle this dynamically to cover cases such as:
         When the user completes the initial steps of the IOU flow offline and then goes online on the confirmation page.
         In this scenario, the route will be fetched from the server, and the waypoints will no longer be pending.
        */
        setMoneyRequestPendingFields(transactionID, {waypoints: isDistanceRequestWithPendingRoute ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null});

        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate ?? 0, currency ?? CONST.CURRENCY.USD, translate, toLocaleDigit);
        setMoneyRequestMerchant(transactionID, distanceMerchant, true);
    }, [
        isDistanceRequestWithPendingRoute,
        hasRoute,
        distance,
        unit,
        rate,
        currency,
        translate,
        toLocaleDigit,
        isDistanceRequest,
        isPolicyExpenseChat,
        transaction,
        transactionID,
        action,
        isMovingTransactionFromTrackExpense,
    ]);

    // Auto select the category if there is only one enabled category and it is required
    useEffect(() => {
        const enabledCategories = Object.values(policyCategories ?? {}).filter((category) => category.enabled);
        if (!transactionID || iouCategory || !shouldShowCategories || enabledCategories.length !== 1 || !isCategoryRequired) {
            return;
        }
        setMoneyRequestCategory(transactionID, enabledCategories.at(0)?.name ?? '', policy?.id);
        // Keep 'transaction' out to ensure that we autoselect the option only once
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldShowCategories, policyCategories, isCategoryRequired, policy?.id]);

    // Auto select the tag if there is only one enabled tag and it is required
    useEffect(() => {
        if (!transactionID) {
            return;
        }

        let updatedTagsString = getTag(transaction);
        policyTagLists.forEach((tagList, index) => {
            const isTagListRequired = tagList.required ?? false;
            if (!isTagListRequired) {
                return;
            }
            const enabledTags = Object.values(tagList.tags).filter((tag) => tag.enabled);
            if (enabledTags.length !== 1 || getTag(transaction, index)) {
                return;
            }
            updatedTagsString = insertTagIntoTransactionTagsString(updatedTagsString, enabledTags.at(0)?.name ?? '', index);
        });
        if (updatedTagsString !== getTag(transaction) && updatedTagsString) {
            setMoneyRequestTag(transactionID, updatedTagsString);
        }
        // Keep 'transaction' out to ensure that we autoselect the option only once
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [transactionID, policyTagLists, policyTags]);

    /**
     * Navigate to the participant step
     */
    const navigateToParticipantPage = () => {
        if (!isCreateExpenseFlow) {
            return;
        }

        const newIOUType = iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.CREATE : iouType;
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(newIOUType, transactionID, transaction.reportID, Navigation.getActiveRoute()));
    };

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            if (!!routeError || !transactionID) {
                return;
            }
            if (iouType === CONST.IOU.TYPE.INVOICE && !hasInvoicingDetails(policy)) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_COMPANY_INFO.getRoute(iouType, transactionID, reportID, Navigation.getActiveRoute()));
                return;
            }

            if (selectedParticipants.length === 0) {
                setFormError('iou.error.noParticipantSelected');
                return;
            }
            if (!isEditingSplitBill && isMerchantRequired && (isMerchantEmpty || (shouldDisplayFieldError && isMerchantMissing(transaction)))) {
                setFormError('iou.error.invalidMerchant');
                return;
            }
            if (iouCategory.length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
                setFormError('iou.error.invalidCategoryLength');
                return;
            }

            if (getTag(transaction).length > CONST.API_TRANSACTION_TAG_MAX_LENGTH) {
                setFormError('iou.error.invalidTagLength');
                return;
            }

            if (isPerDiemRequest && (transaction.comment?.customUnit?.subRates ?? []).length === 0) {
                setFormError('iou.error.invalidSubrateLength');
                return;
            }

            if (iouType !== CONST.IOU.TYPE.PAY) {
                // validate the amount for distance expenses
                const decimals = getCurrencyDecimals(iouCurrencyCode);
                if (isDistanceRequest && !isDistanceRequestWithPendingRoute && !validateAmount(String(iouAmount), decimals, CONST.IOU.DISTANCE_REQUEST_AMOUNT_MAX_LENGTH)) {
                    setFormError('common.error.invalidAmount');
                    return;
                }

                if (isEditingSplitBill && areRequiredFieldsEmpty(transaction)) {
                    setDidConfirmSplit(true);
                    setFormError('iou.error.genericSmartscanFailureMessage');
                    return;
                }

                if (formError) {
                    return;
                }

                if (shouldPlaySound) {
                    playSound(SOUNDS.DONE);
                }
                onConfirm?.(selectedParticipants);
            } else {
                if (!paymentMethod) {
                    return;
                }
                if (formError) {
                    return;
                }
                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                if (shouldPlaySound) {
                    playSound(SOUNDS.DONE);
                }
                onSendMoney?.(paymentMethod);
            }
        },
        [
            selectedParticipants,
            isEditingSplitBill,
            isMerchantRequired,
            isMerchantEmpty,
            shouldDisplayFieldError,
            transaction,
            iouCategory.length,
            formError,
            iouType,
            setFormError,
            onSendMoney,
            iouCurrencyCode,
            isDistanceRequest,
            isPerDiemRequest,
            isDistanceRequestWithPendingRoute,
            iouAmount,
            onConfirm,
            shouldPlaySound,
            transactionID,
            reportID,
            policy,
            routeError,
        ],
    );

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                InteractionManager.runAfterInteractions(() => {
                    blurActiveElement();
                });
            }, CONST.ANIMATED_TRANSITION);
            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

    const errorMessage = useMemo(() => {
        if (routeError) {
            return routeError;
        }
        if (isTypeSplit && !shouldShowReadOnlySplits) {
            return debouncedFormError && translate(debouncedFormError);
        }
        return formError && translate(formError);
    }, [routeError, isTypeSplit, shouldShowReadOnlySplits, debouncedFormError, formError, translate]);

    const footerContent = useMemo(() => {
        if (isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = iouType === CONST.IOU.TYPE.PAY;

        const button = shouldShowSettlementButton ? (
            <SettlementButton
                pressOnEnter
                onPress={confirm}
                enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                addBankAccountRoute={bankAccountRoute}
                shouldShowPersonalBankAccountOption
                currency={iouCurrencyCode}
                policyID={policyID}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                kycWallAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                paymentMethodDropdownAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                enterKeyEventListenerPriority={1}
                useKeyboardShortcuts
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isLoading={isConfirmed || isConfirming}
            />
        ) : (
            <ButtonWithDropdownMenu
                pressOnEnter
                onPress={(event, value) => confirm(value as PaymentMethodType)}
                options={splitOrRequestOptions}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                enterKeyEventListenerPriority={1}
                useKeyboardShortcuts
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isLoading={isConfirmed || isConfirming}
            />
        );

        return (
            <>
                {!!errorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={errorMessage}
                    />
                )}

                <EducationalTooltip
                    shouldRender={shouldShowProductTrainingTooltip}
                    renderTooltipContent={renderProductTrainingTooltip}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    }}
                    wrapperStyle={styles.productTrainingTooltipWrapper}
                    shouldHideOnNavigate
                    shiftVertical={-10}
                >
                    <View>{button}</View>
                </EducationalTooltip>
            </>
        );
    }, [
        isReadOnly,
        iouType,
        confirm,
        bankAccountRoute,
        iouCurrencyCode,
        policyID,
        isConfirmed,
        splitOrRequestOptions,
        errorMessage,
        styles.ph1,
        styles.mb2,
        styles.productTrainingTooltipWrapper,
        shouldShowProductTrainingTooltip,
        renderProductTrainingTooltip,
        isConfirming,
    ]);

    const listFooterContent = (
        <MoneyRequestConfirmationListFooter
            action={action}
            currency={currency}
            didConfirm={!!didConfirm}
            distance={distance}
            formattedAmount={formattedAmount}
            formattedAmountPerAttendee={formattedAmountPerAttendee}
            formError={formError}
            hasRoute={hasRoute}
            iouAttendees={iouAttendees}
            iouCategory={iouCategory}
            iouComment={iouComment}
            iouCreated={iouCreated}
            iouCurrencyCode={iouCurrencyCode}
            iouIsBillable={iouIsBillable}
            iouMerchant={iouMerchant}
            iouType={iouType}
            isCategoryRequired={isCategoryRequired}
            isDistanceRequest={isDistanceRequest}
            isPerDiemRequest={isPerDiemRequest}
            isEditingSplitBill={isEditingSplitBill}
            isMerchantEmpty={isMerchantEmpty}
            isMerchantRequired={isMerchantRequired}
            isPolicyExpenseChat={isPolicyExpenseChat}
            isReadOnly={isReadOnly}
            isTypeInvoice={isTypeInvoice}
            onToggleBillable={onToggleBillable}
            policy={policy}
            policyTags={policyTags}
            policyTagLists={policyTagLists}
            rate={rate}
            receiptFilename={receiptFilename}
            receiptPath={receiptPath}
            reportActionID={reportActionID}
            reportID={reportID}
            selectedParticipants={selectedParticipantsProp}
            shouldDisplayFieldError={shouldDisplayFieldError}
            shouldDisplayReceipt={shouldDisplayReceipt}
            shouldShowCategories={shouldShowCategories}
            shouldShowMerchant={shouldShowMerchant}
            shouldShowSmartScanFields={shouldShowSmartScanFields}
            shouldShowAmountField={!isPerDiemRequest}
            shouldShowTax={shouldShowTax}
            transaction={transaction}
            transactionID={transactionID}
            unit={unit}
            onPDFLoadError={onPDFLoadError}
            onPDFPassword={onPDFPassword}
            isReceiptEditable={isReceiptEditable}
        />
    );

    return (
        <MouseProvider>
            <SelectionList<MoneyRequestConfirmationListItem>
                sections={sections}
                ListItem={UserListItem}
                onSelectRow={navigateToParticipantPage}
                shouldSingleExecuteRowSelect
                canSelectMultiple={false}
                shouldPreventDefaultFocusOnSelectRow
                shouldShowListEmptyContent={false}
                footerContent={footerContent}
                listFooterContent={listFooterContent}
                containerStyle={[styles.flexBasisAuto]}
                removeClippedSubviews={false}
                disableKeyboardShortcuts
            />
        </MouseProvider>
    );
}

MoneyRequestConfirmationList.displayName = 'MoneyRequestConfirmationList';

export default memo(
    MoneyRequestConfirmationList,
    (prevProps, nextProps) =>
        lodashIsEqual(prevProps.transaction, nextProps.transaction) &&
        prevProps.onSendMoney === nextProps.onSendMoney &&
        prevProps.onConfirm === nextProps.onConfirm &&
        prevProps.iouType === nextProps.iouType &&
        prevProps.iouAmount === nextProps.iouAmount &&
        prevProps.isDistanceRequest === nextProps.isDistanceRequest &&
        prevProps.isPolicyExpenseChat === nextProps.isPolicyExpenseChat &&
        prevProps.iouCategory === nextProps.iouCategory &&
        prevProps.shouldShowSmartScanFields === nextProps.shouldShowSmartScanFields &&
        prevProps.isEditingSplitBill === nextProps.isEditingSplitBill &&
        prevProps.iouCurrencyCode === nextProps.iouCurrencyCode &&
        prevProps.iouMerchant === nextProps.iouMerchant &&
        lodashIsEqual(prevProps.selectedParticipants, nextProps.selectedParticipants) &&
        lodashIsEqual(prevProps.payeePersonalDetails, nextProps.payeePersonalDetails) &&
        prevProps.isReadOnly === nextProps.isReadOnly &&
        prevProps.bankAccountRoute === nextProps.bankAccountRoute &&
        prevProps.policyID === nextProps.policyID &&
        prevProps.reportID === nextProps.reportID &&
        prevProps.receiptPath === nextProps.receiptPath &&
        prevProps.iouAttendees === nextProps.iouAttendees &&
        prevProps.iouComment === nextProps.iouComment &&
        prevProps.receiptFilename === nextProps.receiptFilename &&
        prevProps.iouCreated === nextProps.iouCreated &&
        prevProps.iouIsBillable === nextProps.iouIsBillable &&
        prevProps.onToggleBillable === nextProps.onToggleBillable &&
        prevProps.hasSmartScanFailed === nextProps.hasSmartScanFailed &&
        prevProps.reportActionID === nextProps.reportActionID &&
        lodashIsEqual(prevProps.action, nextProps.action) &&
        prevProps.shouldDisplayReceipt === nextProps.shouldDisplayReceipt,
);
