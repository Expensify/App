import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {MouseProvider} from '@hooks/useMouseContext';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {
    adjustRemainingSplitShares,
    computePerDiemExpenseAmount,
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
import {getDistanceRateCustomUnitRate, getTagLists, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {isSelectedManagerMcTest} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
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
    receiptPath?: string;

    /** File name of the receipt */
    receiptFilename?: string;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is a distance expense */
    isDistanceRequest: boolean;

    /** Whether the expense is a manual distance expense */
    isManualDistanceRequest: boolean;

    /** Whether the expense is a per diem expense */
    isPerDiemRequest?: boolean;

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
}: MoneyRequestConfirmationListProps) {
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {canBeMissing: true});
    const [defaultMileageRateDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {
        selector: mileageRateSelector,
        canBeMissing: true,
    });
    const [defaultMileageRateReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: mileageRateSelector,
        canBeMissing: true,
    });
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`, {canBeMissing: true});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: false});
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

    const policy = policyReal ?? policyDraft;
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
    const prevSubRates = usePrevious(subRates);

    // A flag for showing the categories field
    const shouldShowCategories = (isPolicyExpenseChat || isTypeInvoice) && (!!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowMerchant = (shouldShowSmartScanFields || isTypeSend) && !isDistanceRequest && !isPerDiemRequest;

    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest, isPerDiemRequest);

    useEffect(() => {
        // Set the default tax code when conditions change
        if (!shouldShowTax || !transaction || !transactionID) {
            return;
        }
        const defaultTaxCode = getDefaultTaxCode(policy, transaction);
        const currentTaxCode = transaction.taxCode ?? '';

        // Update tax code if it's different from what should be the default
        if (defaultTaxCode !== currentTaxCode) {
            setMoneyRequestTaxRate(transactionID, defaultTaxCode ?? '');
        }
    }, [customUnitRateID, policy, shouldShowTax, transaction, transactionID]);

    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);

    const distance = getDistanceInMeters(transaction, unit);
    const prevDistance = usePrevious(distance);

    const shouldCalculateDistanceAmount = isDistanceRequest && (iouAmount === 0 || prevRate !== rate || prevDistance !== distance || prevCurrency !== currency || prevUnit !== unit);

    const shouldCalculatePerDiemAmount = isPerDiemRequest && (iouAmount === 0 || JSON.stringify(prevSubRates) !== JSON.stringify(subRates) || prevCurrency !== currency);

    const hasRoute = hasRouteUtil(transaction, isDistanceRequest);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate) && !isMovingTransactionFromTrackExpense;

    const distanceRequestAmount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);

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

        return (!!hasSmartScanFailed && hasMissingSmartscanFields(transaction)) || (didConfirmSplit && areRequiredFieldsEmpty(transaction));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = useMemo(() => !iouMerchant || isMerchantMissing(transaction), [transaction, iouMerchant]);
    const isMerchantRequired = isPolicyExpenseChat && (!isScanRequest || isEditingSplitBill) && shouldShowMerchant;

    const isCategoryRequired = !!policy?.requiresCategory && !isTypeInvoice;

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
    useEffect(() => {
        if (!shouldShowTax || !transaction) {
            return;
        }

        let taxableAmount: number | undefined;
        let taxCode: string | undefined;
        if (isDistanceRequest) {
            if (customUnitRateID) {
                const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
                taxCode = customUnitRate?.attributes?.taxRateExternalID

MoneyRequestConfirmationList.displayName = 'MoneyRequestConfirmationList';

export default memo(
    MoneyRequestConfirmationList,
    (prevProps, nextProps) =>
        deepEqual(prevProps.transaction, nextProps.transaction) &&
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
        deepEqual(prevProps.selectedParticipants, nextProps.selectedParticipants) &&
        deepEqual(prevProps.payeePersonalDetails, nextProps.payeePersonalDetails) &&
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
        deepEqual(prevProps.action, nextProps.action) &&
        prevProps.shouldDisplayReceipt === nextProps.shouldDisplayReceipt,
);
