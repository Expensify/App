import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {MouseProvider} from '@hooks/useMouseContext';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {
    adjustRemainingSplitShares,
    computePerDiemExpenseAmount,
    isValidPerDiemExpenseAmount,
    resetSplitShares,
    setCustomUnitRateID,
    setIndividualShare,
    setMoneyRequestAmount,
    setMoneyRequestCategory,
    setMoneyRequestDistance,
    setMoneyRequestMerchant,
    setMoneyRequestPendingFields,
    setMoneyRequestTag,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
    setSplitShares,
} from '@libs/actions/IOU';
import {getIsMissingAttendeesViolation} from '@libs/AttendeeUtils';
import {isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {convertToBackendAmount, convertToDisplayString, convertToDisplayStringWithoutCurrency, getCurrencyDecimals} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateGPSDistance} from '@libs/GPSDraftDetailsUtils';
import {calculateAmount, insertTagIntoTransactionTagsString, isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {validateAmount} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUConfirmationOptionsFromPayeePersonalDetail, hasEnabledOptions} from '@libs/OptionsListUtils';
import {getTagLists, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {isSelectedManagerMcTest} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {hasEnabledTags, hasMatchingTag} from '@libs/TagsOptionsListUtils';
import {isValidTimeExpenseAmount} from '@libs/TimeTrackingUtils';
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
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {SplitShares} from '@src/types/onyx/Transaction';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';
import FormHelpMessage from './FormHelpMessage';
import MoneyRequestAmountInput from './MoneyRequestAmountInput';
import MoneyRequestConfirmationListFooter from './MoneyRequestConfirmationListFooter';
import {PressableWithFeedback} from './Pressable';
import {useProductTrainingContext} from './ProductTrainingContext';
// eslint-disable-next-line no-restricted-imports
import SelectionList from './SelectionListWithSections';
import type {SectionListDataType} from './SelectionListWithSections/types';
import UserListItem from './SelectionListWithSections/UserListItem';
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

    /** Time expense's hour count */
    iouTimeCount?: number;

    /** Time expense's hourly rate */
    iouTimeRate?: number;

    /** Callback to toggle the billable state */
    onToggleBillable?: (isOn: boolean) => void;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Should the list be read only, and not editable? */
    isReadOnly?: boolean;

    /** Number of expenses to be created */
    expensesNumber?: number;

    /** The policyID of the request */
    policyID?: string;

    /** The reportID of the request */
    reportID?: string;

    /** File path of the receipt */
    receiptPath?: string | number;

    /** File name of the receipt */
    receiptFilename?: string;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is a distance expense */
    isDistanceRequest: boolean;

    /** Whether the expense is a manual distance expense */
    isManualDistanceRequest: boolean;

    /** Whether the expense is an odometer distance expense */
    isOdometerDistanceRequest?: boolean;

    /** Whether the expense is a GPS distance expense */
    isGPSDistanceRequest: boolean;

    /** Whether the expense is a per diem expense */
    isPerDiemRequest?: boolean;

    /** Whether the expense is a time expense */
    isTimeRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** Whether we can navigate to receipt page */
    shouldDisplayReceipt?: boolean;

    /** Whether we should show the amount, date, and merchant fields. */
    shouldShowSmartScanFields?: boolean;

    /** A flag for verifying that the current report is a sub-report of a expense chat */
    isPolicyExpenseChat?: boolean;

    /** Whether smart scan failed */
    hasSmartScanFailed?: boolean;

    /** The ID of the report action */
    reportActionID?: string;

    /** The action to take */
    action?: IOUAction;

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

    /** Function to toggle reimbursable */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Flag indicating if the IOU is reimbursable */
    iouIsReimbursable?: boolean;

    /** Show remove expense confirmation modal */
    showRemoveExpenseConfirmModal?: () => void;
};

type MoneyRequestConfirmationListItem = Participant | OptionData;

const mileageRateSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => DistanceRequestUtils.getDefaultMileageRate(policy);

function MoneyRequestConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    iouType = CONST.IOU.TYPE.SUBMIT,
    iouAmount,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest = false,
    isGPSDistanceRequest,
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
    expensesNumber = 0,
    isConfirmed,
    isConfirming,
    onPDFLoadError,
    onPDFPassword,
    iouIsReimbursable = true,
    onToggleReimbursable,
    showRemoveExpenseConfirmModal,
    isTimeRequest = false,
    iouTimeCount,
    iouTimeRate,
}: MoneyRequestConfirmationListProps) {
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {canBeMissing: true});
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {canBeMissing: true});
    const [defaultMileageRateDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {
        selector: mileageRateSelector,
        canBeMissing: true,
    });
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);
    const [defaultMileageRateReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: mileageRateSelector,
        canBeMissing: true,
    });
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`, {canBeMissing: true});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const {getCurrencySymbol} = useCurrencyList();
    const {isBetaEnabled} = usePermissions();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const isTestReceipt = useMemo(() => {
        return transaction?.receipt?.isTestReceipt ?? false;
    }, [transaction?.receipt?.isTestReceipt]);

    const isTestDriveReceipt = useMemo(() => {
        return transaction?.receipt?.isTestDriveReceipt ?? false;
    }, [transaction?.receipt?.isTestDriveReceipt]);

    const isManagerMcTestReceipt = useMemo(() => {
        return isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST) && selectedParticipantsProp.some((participant) => isSelectedManagerMcTest(participant.login));
    }, [isBetaEnabled, selectedParticipantsProp]);

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useProductTrainingContext(
        isTestDriveReceipt ? CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_DRIVE_CONFIRMATION : CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_CONFIRMATION,
        isTestDriveReceipt || isManagerMcTestReceipt,
    );

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID ?? '',
        action,
        iouType,
        isPerDiemRequest,
    });

    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;
    const defaultMileageRate = defaultMileageRateDraft ?? defaultMileageRateReal;

    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    const isTypeRequest = iouType === CONST.IOU.TYPE.SUBMIT;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const isScanRequest = useMemo(() => isScanRequestUtil(transaction), [transaction]);
    const isCreateExpenseFlow = !!transaction?.isFromGlobalCreate && !isPerDiemRequest;

    const transactionID = transaction?.transactionID;
    const customUnitRateID = getRateID(transaction);

    const subRates = transaction?.comment?.customUnit?.subRates ?? [];
    const defaultRate = defaultMileageRate?.customUnitRateID;
    const lastSelectedRate = policy?.id ? (lastSelectedDistanceRates?.[policy.id] ?? defaultRate) : defaultRate;

    useEffect(() => {
        if (
            !['-1', CONST.CUSTOM_UNITS.FAKE_P2P_ID].includes(customUnitRateID) ||
            !isDistanceRequest ||
            !isPolicyExpenseChat ||
            !transactionID ||
            !lastSelectedRate ||
            isMovingTransactionFromTrackExpense
        ) {
            return;
        }

        setCustomUnitRateID(transactionID, lastSelectedRate);
    }, [customUnitRateID, transactionID, lastSelectedRate, isDistanceRequest, isPolicyExpenseChat, isMovingTransactionFromTrackExpense]);

    const mileageRate = DistanceRequestUtils.getRate({transaction, policy, policyDraft});
    const rate = mileageRate.rate;
    const prevRate = usePrevious(rate);
    const unit = mileageRate.unit;
    const prevUnit = usePrevious(unit);
    const currency = mileageRate.currency ?? CONST.CURRENCY.USD;
    const prevCurrency = usePrevious(currency);
    const prevSubRates = usePrevious(subRates);

    const {shouldSelectPolicy} = usePolicyForMovingExpenses();

    // A flag for showing the categories field
    const shouldShowCategories = isTrackExpense
        ? !policy || shouldSelectPolicy || hasEnabledOptions(Object.values(policyCategories ?? {}))
        : (isPolicyExpenseChat || isTypeInvoice) && (!!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowMerchant = (shouldShowSmartScanFields || isTypeSend) && !isDistanceRequest && !isPerDiemRequest && !isTimeRequest;

    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat || isTrackExpense, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest);

    // Update the tax code when the default changes (for example, because the transaction currency changed)
    const defaultTaxCode = getDefaultTaxCode(policy, transaction) ?? (isMovingTransactionFromTrackExpense ? (getDefaultTaxCode(policyForMovingExpenses, transaction) ?? '') : '');

    useEffect(() => {
        if (!transactionID || isReadOnly || !shouldShowTax || isMovingTransactionFromTrackExpense) {
            return;
        }
        setMoneyRequestTaxRate(transactionID, defaultTaxCode);
        // trigger this useEffect also when policyID changes - the defaultTaxCode may stay the same
    }, [defaultTaxCode, isMovingTransactionFromTrackExpense, isReadOnly, transactionID, policyID, shouldShowTax]);

    const distance = getDistanceInMeters(transaction, unit);
    const prevDistance = usePrevious(distance);

    const shouldCalculateDistanceAmount = isDistanceRequest && (iouAmount === 0 || prevRate !== rate || prevDistance !== distance || prevCurrency !== currency || prevUnit !== unit);

    const shouldCalculatePerDiemAmount = isPerDiemRequest && (iouAmount === 0 || JSON.stringify(prevSubRates) !== JSON.stringify(subRates) || prevCurrency !== currency);

    const hasRoute = hasRouteUtil(transaction, isDistanceRequest);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate) && !isMovingTransactionFromTrackExpense;

    const distanceRequestAmount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);

    // Update GPS distance whenever the current distance unit differs from the one that was used
    // to calculate the distance stored in transaction.comment.customUnit.quantity
    const gpsDistance = transaction?.comment?.customUnit?.quantity;
    const gpsDistanceWithCurrentDistanceUnit = calculateGPSDistance(distance, unit);
    const shouldUpdateGpsDistance = gpsDistance !== gpsDistanceWithCurrentDistanceUnit;
    useEffect(() => {
        if (!shouldUpdateGpsDistance || !transactionID || isReadOnly) {
            return;
        }

        setMoneyRequestDistance(transactionID, gpsDistanceWithCurrentDistanceUnit, true);
    }, [shouldUpdateGpsDistance, transactionID, isReadOnly, gpsDistanceWithCurrentDistanceUnit]);

    let amountToBeUsed = iouAmount;

    if (shouldCalculateDistanceAmount) {
        amountToBeUsed = distanceRequestAmount;
    } else if (shouldCalculatePerDiemAmount) {
        const perDiemRequestAmount = computePerDiemExpenseAmount({subRates});
        amountToBeUsed = perDiemRequestAmount;
    }

    const formattedAmount = isDistanceRequestWithPendingRoute ? '' : convertToDisplayString(amountToBeUsed, isDistanceRequest ? currency : iouCurrencyCode);
    const formattedAmountPerAttendee =
        isDistanceRequestWithPendingRoute || isScanRequest
            ? ''
            : convertToDisplayString(amountToBeUsed / (iouAttendees?.length && iouAttendees.length > 0 ? iouAttendees.length : 1), isDistanceRequest ? currency : iouCurrencyCode);
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

        return (!!hasSmartScanFailed && hasMissingSmartscanFields(transaction, transactionReport)) || (didConfirmSplit && areRequiredFieldsEmpty(transaction, transactionReport));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit, transactionReport]);

    const isMerchantEmpty = useMemo(() => !iouMerchant || isMerchantMissing(transaction), [transaction, iouMerchant]);
    const isMerchantRequired = isPolicyExpenseChat && (!isScanRequest || isEditingSplitBill) && shouldShowMerchant;

    const isCategoryRequired = !!policy?.requiresCategory && !isTypeInvoice;

    const isDescriptionRequired = useMemo(
        () => isCategoryDescriptionRequired(policyCategories, iouCategory, policy?.areRulesEnabled),
        [iouCategory, policyCategories, policy?.areRulesEnabled],
    );

    useEffect(() => {
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        // Reset the form error whenever the screen gains or loses focus
        // but preserve violation-related errors since those represent real validation issues
        // that can only be fixed by changing the underlying data
        if (!formError.startsWith(CONST.VIOLATIONS_PREFIX)) {
            setFormError('');
            return;
        }
        // Clear missingAttendees violation if user fixed it by changing category or attendees
        const isMissingAttendeesViolation = getIsMissingAttendeesViolation(policyCategories, iouCategory, iouAttendees, currentUserPersonalDetails, policy?.isAttendeeTrackingEnabled);
        if (formError === 'violations.missingAttendees' && !isMissingAttendeesViolation) {
            setFormError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run if it's just setFormError that changes
    }, [isFocused, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit, iouCategory, iouAttendees, policyCategories, currentUserPersonalDetails, policy?.isAttendeeTrackingEnabled]);

    useEffect(() => {
        // We want this effect to run only when the transaction is moving from Self DM to a expense chat
        if (!transactionID || !isDistanceRequest || !isMovingTransactionFromTrackExpense || !isPolicyExpenseChat) {
            return;
        }

        const errorKey = 'iou.error.invalidRate';
        const policyRates = DistanceRequestUtils.getMileageRates(policy);

        // If the selected rate belongs to the policy, clear the error
        if (customUnitRateID && customUnitRateID in policyRates) {
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
    }, [
        isDistanceRequest,
        isPolicyExpenseChat,
        transactionID,
        mileageRate.rate,
        mileageRate.unit,
        customUnitRateID,
        policy,
        isMovingTransactionFromTrackExpense,
        setFormError,
        clearFormErrors,
    ]);

    const routeError = Object.values(transaction?.errorFields?.route ?? {}).at(0);
    const isFirstUpdatedDistanceAmount = useRef(false);

    useEffect(() => {
        if (isFirstUpdatedDistanceAmount.current) {
            return;
        }
        if (!isDistanceRequest || !transactionID) {
            return;
        }
        if (isReadOnly) {
            return;
        }
        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
        setMoneyRequestAmount(transactionID, amount, currency ?? '');
        isFirstUpdatedDistanceAmount.current = true;
    }, [distance, rate, isReadOnly, unit, transactionID, currency, isDistanceRequest]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount || !transactionID || isReadOnly) {
            return;
        }

        const amount = distanceRequestAmount;
        setMoneyRequestAmount(transactionID, amount, currency ?? '');

        // If it's a split request among individuals, set the split shares
        const participantAccountIDs: number[] = selectedParticipantsProp.map((participant) => participant.accountID ?? CONST.DEFAULT_NUMBER_ID);
        if (isTypeSplit && !isPolicyExpenseChat && amount && transaction?.currency) {
            setSplitShares(transaction, amount, currency, participantAccountIDs);
        }
    }, [shouldCalculateDistanceAmount, isReadOnly, distanceRequestAmount, transactionID, currency, isTypeSplit, isPolicyExpenseChat, selectedParticipantsProp, transaction]);

    // Calculate and set tax amount in transaction draft
    const taxableAmount = isDistanceRequest ? DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, distance) : (transaction?.amount ?? 0);
    // First we'll try to get the tax value from the chosen policy and if not found, we'll try to get it from the policy for moving expenses (only if the transaction is moving from track expense)
    const taxPercentage =
        getTaxValue(policy, transaction, transaction?.taxCode ?? defaultTaxCode) ??
        (isMovingTransactionFromTrackExpense ? getTaxValue(policyForMovingExpenses, transaction, transaction?.taxCode ?? defaultTaxCode) : '');
    const taxAmount =
        isMovingTransactionFromTrackExpense && transaction?.taxAmount
            ? Math.abs(transaction?.taxAmount ?? 0)
            : calculateTaxAmount(taxPercentage, taxableAmount, transaction?.currency ?? CONST.CURRENCY.USD);

    const taxAmountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(taxAmount.toString()));
    useEffect(() => {
        if (!transactionID || isReadOnly || !shouldShowTax || isMovingTransactionFromTrackExpense) {
            return;
        }
        setMoneyRequestTaxAmount(transactionID, taxAmountInSmallestCurrencyUnits);
    }, [transactionID, taxAmountInSmallestCurrencyUnits, isReadOnly, shouldShowTax, isMovingTransactionFromTrackExpense]);

    // If completing a split expense fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    useEffect(() => {
        setDidConfirm(isConfirmed);
    }, [isConfirmed]);

    const splitOrRequestOptions: Array<DropdownOption<string>> = useMemo(() => {
        let text;
        if (expensesNumber > 1) {
            text = translate('iou.createExpenses', expensesNumber);
        } else if (isTypeInvoice) {
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
        } else if (isTypeSplit) {
            text = translate('iou.splitAmount', {amount: formattedAmount});
        } else if (iouAmount === 0) {
            text = translate('iou.createExpense');
        } else {
            text = translate('iou.createExpenseWithAmount', {amount: formattedAmount});
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
        expensesNumber,
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
        [transaction?.transactionID],
    );

    useEffect(() => {
        if (!isTypeSplit || !transaction?.splitShares || !isFocused) {
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

        const currencySymbol = getCurrencySymbol(iouCurrencyCode ?? '') ?? iouCurrencyCode;
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
                    prefixContainerStyle={[styles.pv0, styles.h100]}
                    prefixStyle={styles.lineHeightUndefined}
                    inputStyle={[styles.optionRowAmountInput, styles.lineHeightUndefined]}
                    containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}
                    touchableInputWrapperStyle={[styles.ml3]}
                    onFormatAmount={convertToDisplayStringWithoutCurrency}
                    onAmountChange={(value: string) => onSplitShareChange(participantOption.accountID ?? CONST.DEFAULT_NUMBER_ID, Number(value))}
                    maxLength={formattedTotalAmount.length + 1}
                    contentWidth={(formattedTotalAmount.length + 1) * CONST.CHARACTER_WIDTH}
                    shouldApplyPaddingToContainer
                    shouldUseDefaultLineHeightForPrefix={false}
                    shouldWrapInputInContainer={false}
                />
            ),
        }));
    }, [
        isTypeSplit,
        payeePersonalDetails,
        shouldShowReadOnlySplits,
        iouCurrencyCode,
        iouAmount,
        selectedParticipants,
        styles.flexWrap,
        styles.pl2,
        styles.pr1,
        styles.h100,
        styles.textLabel,
        styles.pv0,
        styles.lineHeightUndefined,
        styles.optionRowAmountInput,
        styles.textInputContainer,
        styles.ml3,
        transaction?.comment?.splits,
        transaction?.splitShares,
        onSplitShareChange,
        getCurrencySymbol,
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
                isInteractive: isCreateExpenseFlow && !isTestReceipt && (!isRestrictedToPreferredPolicy || isTypeInvoice),
                shouldShowRightIcon: isCreateExpenseFlow && !isTestReceipt && (!isRestrictedToPreferredPolicy || isTypeInvoice),
            }));
            options.push({
                title: translate('common.to'),
                data: formattedSelectedParticipants,
                shouldShow: true,
            });
        }

        return options;
    }, [
        isTypeSplit,
        translate,
        payeePersonalDetails,
        getSplitSectionHeader,
        splitParticipants,
        selectedParticipants,
        isCreateExpenseFlow,
        isTestReceipt,
        isRestrictedToPreferredPolicy,
        isTypeInvoice,
    ]);

    useEffect(() => {
        if (!isDistanceRequest || (isMovingTransactionFromTrackExpense && !isPolicyExpenseChat) || !transactionID || isReadOnly) {
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

        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate ?? 0, currency ?? CONST.CURRENCY.USD, translate, toLocaleDigit, getCurrencySymbol);
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
        isReadOnly,
        isMovingTransactionFromTrackExpense,
        getCurrencySymbol,
    ]);

    // Auto select the category if there is only one enabled category and it is required
    useEffect(() => {
        const enabledCategories = Object.values(policyCategories ?? {}).filter((category) => category.enabled);
        if (!transactionID || iouCategory || !shouldShowCategories || enabledCategories.length !== 1 || !isCategoryRequired) {
            return;
        }
        setMoneyRequestCategory(transactionID, enabledCategories.at(0)?.name ?? '', policy, isMovingTransactionFromTrackExpense);
        // Keep 'transaction' out to ensure that we auto select the option only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowCategories, policyCategories, isCategoryRequired, policy?.id]);

    // Auto select the tag if there is only one enabled tag and it is required
    useEffect(() => {
        if (!transactionID) {
            return;
        }

        let updatedTagsString = getTag(transaction);
        for (const [index, tagList] of policyTagLists.entries()) {
            const isTagListRequired = tagList.required ?? false;
            if (!isTagListRequired) {
                continue;
            }
            const enabledTags = Object.values(tagList.tags).filter((tag) => tag.enabled);
            if (enabledTags.length !== 1 || getTag(transaction, index)) {
                continue;
            }
            updatedTagsString = insertTagIntoTransactionTagsString(updatedTagsString, enabledTags.at(0)?.name ?? '', index, policy?.hasMultipleTagLists ?? false);
        }
        if (updatedTagsString !== getTag(transaction) && updatedTagsString) {
            setMoneyRequestTag(transactionID, updatedTagsString);
        }
        // Keep 'transaction' out to ensure that we auto select the option only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            if (iouCategory && policyCategories && (!policyCategories[iouCategory] || !policyCategories[iouCategory]?.enabled)) {
                setFormError('violations.categoryOutOfPolicy');
                return;
            }

            const transactionTag = getTag(transaction);
            if (transactionTag.length > CONST.API_TRANSACTION_TAG_MAX_LENGTH) {
                setFormError('iou.error.invalidTagLength');
                return;
            }

            if (transactionTag && hasEnabledTags(policyTagLists) && !hasMatchingTag(policyTags, transactionTag)) {
                setFormError('violations.tagOutOfPolicy');
                return;
            }

            // Since invoices are not expense reports that need attendee tracking, this validation should not apply to invoices
            const isMissingAttendeesViolation =
                iouType !== CONST.IOU.TYPE.INVOICE &&
                getIsMissingAttendeesViolation(policyCategories, iouCategory, iouAttendees, currentUserPersonalDetails, policy?.isAttendeeTrackingEnabled);
            if (isMissingAttendeesViolation) {
                setFormError('violations.missingAttendees');
                return;
            }

            if (shouldShowTax && !!transaction.taxCode && !Object.keys(policy?.taxRates?.taxes ?? {}).some((key) => key === transaction.taxCode)) {
                setFormError('violations.taxOutOfPolicy');
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

                if (isTimeRequest && !isValidTimeExpenseAmount(iouAmount, iouCurrencyCode)) {
                    setFormError('iou.timeTracking.amountTooLargeError');
                    return;
                }

                if (isPerDiemRequest) {
                    if (!isValidPerDiemExpenseAmount(transaction.comment?.customUnit ?? {}, iouCurrencyCode)) {
                        setFormError('iou.error.invalidQuantity');
                        return;
                    }
                }

                if (isEditingSplitBill && areRequiredFieldsEmpty(transaction, transactionReport)) {
                    setDidConfirmSplit(true);
                    setFormError('iou.error.genericSmartscanFailureMessage');
                    return;
                }

                if (isEditingSplitBill && iouAmount === 0) {
                    setFormError('iou.error.invalidAmount');
                    return;
                }

                if (formError) {
                    return;
                }

                onConfirm?.(selectedParticipants);
            } else {
                if (!paymentMethod) {
                    return;
                }
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }
                if (formError) {
                    return;
                }
                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney?.(paymentMethod);
            }
        },
        [
            routeError,
            transactionID,
            iouType,
            policy,
            policyTagLists,
            selectedParticipants,
            isEditingSplitBill,
            isMerchantRequired,
            isMerchantEmpty,
            shouldDisplayFieldError,
            shouldShowTax,
            transaction,
            policyTags,
            isPerDiemRequest,
            reportID,
            setFormError,
            iouCurrencyCode,
            isDistanceRequest,
            isDistanceRequestWithPendingRoute,
            iouAmount,
            formError,
            onConfirm,
            isDelegateAccessRestricted,
            onSendMoney,
            showDelegateNoAccessModal,
            iouCategory,
            policyCategories,
            transactionReport,
            iouAttendees,
            currentUserPersonalDetails,
            isTimeRequest,
        ],
    );

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        // Don't show error at the bottom of the form for missing attendees
        if (formError === 'violations.missingAttendees') {
            return;
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
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                chatReportID={reportID}
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
            <>
                {expensesNumber > 1 && (
                    <Button
                        large
                        text={translate('iou.removeThisExpense')}
                        onPress={showRemoveExpenseConfirmModal}
                        style={styles.mb3}
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
                    <View>
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
                    </View>
                </EducationalTooltip>
            </>
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
                <View>{button}</View>
            </>
        );
    }, [
        isReadOnly,
        iouType,
        confirm,
        iouCurrencyCode,
        policyID,
        isConfirmed,
        splitOrRequestOptions,
        errorMessage,
        expensesNumber,
        translate,
        showRemoveExpenseConfirmModal,
        styles.mb3,
        styles.ph1,
        styles.mb2,
        styles.productTrainingTooltipWrapper,
        shouldShowProductTrainingTooltip,
        renderProductTrainingTooltip,
        isConfirming,
        reportID,
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
            iouTimeCount={iouTimeCount}
            iouTimeRate={iouTimeRate}
            isCategoryRequired={isCategoryRequired}
            isDistanceRequest={isDistanceRequest}
            isManualDistanceRequest={isManualDistanceRequest}
            isOdometerDistanceRequest={isOdometerDistanceRequest}
            isGPSDistanceRequest={isGPSDistanceRequest}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
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
            iouIsReimbursable={iouIsReimbursable}
            onToggleReimbursable={onToggleReimbursable}
            isReceiptEditable={isReceiptEditable}
            isDescriptionRequired={isDescriptionRequired}
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

export default memo(
    MoneyRequestConfirmationList,
    (prevProps, nextProps) =>
        prevProps.transaction === nextProps.transaction &&
        prevProps.onSendMoney === nextProps.onSendMoney &&
        prevProps.onConfirm === nextProps.onConfirm &&
        prevProps.iouType === nextProps.iouType &&
        prevProps.iouAmount === nextProps.iouAmount &&
        prevProps.isDistanceRequest === nextProps.isDistanceRequest &&
        prevProps.isPolicyExpenseChat === nextProps.isPolicyExpenseChat &&
        prevProps.expensesNumber === nextProps.expensesNumber &&
        prevProps.iouCategory === nextProps.iouCategory &&
        prevProps.shouldShowSmartScanFields === nextProps.shouldShowSmartScanFields &&
        prevProps.isEditingSplitBill === nextProps.isEditingSplitBill &&
        prevProps.iouCurrencyCode === nextProps.iouCurrencyCode &&
        prevProps.iouMerchant === nextProps.iouMerchant &&
        // eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- selectedParticipants is derived with .map() which creates new array references
        deepEqual(prevProps.selectedParticipants, nextProps.selectedParticipants) &&
        prevProps.payeePersonalDetails === nextProps.payeePersonalDetails &&
        prevProps.isReadOnly === nextProps.isReadOnly &&
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
        prevProps.action === nextProps.action &&
        prevProps.shouldDisplayReceipt === nextProps.shouldDisplayReceipt &&
        prevProps.isTimeRequest === nextProps.isTimeRequest &&
        prevProps.iouTimeCount === nextProps.iouTimeCount &&
        prevProps.iouTimeRate === nextProps.iouTimeRate,
);
