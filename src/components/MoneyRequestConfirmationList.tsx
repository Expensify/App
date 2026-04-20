import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
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
import {computePerDiemExpenseAmount, isValidPerDiemExpenseAmount} from '@libs/actions/IOU/PerDiem';
import {resetSplitShares, setIndividualShare} from '@libs/actions/IOU/Split';
import {getIsMissingAttendeesViolation} from '@libs/AttendeeUtils';
import {isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {convertToBackendAmount, convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateAmount, isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {validateAmount} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUConfirmationOptionsFromPayeePersonalDetail, hasEnabledOptions} from '@libs/OptionsListUtils';
import {getTagLists, isAttendeeTrackingEnabled, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {isSelectedManagerMcTest} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {hasEnabledTags, hasMatchingTag} from '@libs/TagsOptionsListUtils';
import {isValidTimeExpenseAmount} from '@libs/TimeTrackingUtils';
import {
    areRequiredFieldsEmpty,
    calculateTaxAmount,
    getAttendees,
    getCategory,
    getCurrency,
    getDefaultTaxCode,
    getDistanceInMeters,
    getMerchant,
    getRateID,
    getTag,
    getTaxValue,
    hasMissingSmartscanFields,
    hasRoute as hasRouteUtil,
    hasTaxRateWithMatchingValue,
    hasValidModifiedAmount,
    isDistanceRequest as isDistanceRequestUtil,
    isGPSDistanceRequest as isGPSDistanceRequestUtil,
    isManualDistanceRequest as isManualDistanceRequestUtil,
    isMerchantMissing,
    isScanning,
    isScanRequest as isScanRequestUtil,
} from '@libs/TransactionUtils';
import {isInvalidMerchantValue, isValidInputLength} from '@libs/ValidationUtils';
import {getIsViolationFixed} from '@libs/Violations/ViolationsUtils';
import {hasInvoicingDetails} from '@userActions/Policy/Policy';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import FormHelpMessage from './FormHelpMessage';
import MoneyRequestAmountInput from './MoneyRequestAmountInput';
import ConfirmationTelemetry from './MoneyRequestConfirmationList/ConfirmationTelemetry';
import DistanceRequestController from './MoneyRequestConfirmationList/DistanceRequestController';
import FieldAutoSelector from './MoneyRequestConfirmationList/FieldAutoSelector';
import SplitBillController from './MoneyRequestConfirmationList/SplitBillController';
import TaxController from './MoneyRequestConfirmationList/TaxController';
import MoneyRequestConfirmationListFooter from './MoneyRequestConfirmationListFooter';
import {PressableWithFeedback} from './Pressable';
import {useProductTrainingContext} from './ProductTrainingContext';
import UserListItem from './SelectionList/ListItem/UserListItem';
import SelectionListWithSections from './SelectionList/SelectionListWithSections';
import type {Section} from './SelectionList/SelectionListWithSections/types';
import SettlementButton from './SettlementButton';
import type {PaymentActionParams} from './SettlementButton/types';
import Text from './Text';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type MoneyRequestConfirmationListProps = {
    /** Callback to inform parent modal of success */
    onConfirm?: (selectedParticipants: Participant[]) => void;

    /** Callback to parent modal to pay someone */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    /** IOU type */
    iouType?: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

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

    /** Whether the expense is an odometer distance expense */
    isOdometerDistanceRequest?: boolean;

    /** Whether the odometer receipt is currently being stitched */
    isLoadingReceipt?: boolean;

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

    /** Show remove expense confirmation modal */
    showRemoveExpenseConfirmModal?: () => void;

    /** When true, hide the "To:" section (e.g. when adding an expense directly to the current report) */
    shouldHideToSection?: boolean;
};

type MoneyRequestConfirmationListItem = (Participant & {keyForList: string}) | OptionData;

const mileageRateSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => DistanceRequestUtils.getDefaultMileageRate(policy);
const transactionReportSelector = (report: OnyxEntry<OnyxTypes.Report>) => report && ({type: report.type} as OnyxEntry<OnyxTypes.Report>);
const policyDraftSelector = (draft: OnyxEntry<OnyxTypes.Policy>) => draft && ({customUnits: draft.customUnits} as OnyxEntry<OnyxTypes.Policy>);

function MoneyRequestConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isOdometerDistanceRequest = false,
    isLoadingReceipt = false,
    isPerDiemRequest = false,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
    isEditingSplitBill,
    isReceiptEditable,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    policyID,
    reportID = '',
    receiptPath = '',
    receiptFilename = '',
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
    onToggleReimbursable,
    showRemoveExpenseConfirmModal,
    isTimeRequest = false,
    shouldHideToSection = false,
}: MoneyRequestConfirmationListProps) {
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {
        selector: transactionReportSelector,
    });
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {
        selector: policyDraftSelector,
    });
    const [defaultMileageRateDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, {
        selector: mileageRateSelector,
    });
    const {policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);
    const [defaultMileageRateReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: mileageRateSelector,
    });
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`);
    const {convertToDisplayString, getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const isInLandscapeMode = useIsInLandscapeMode();

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
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest,
    });

    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;
    const defaultMileageRate = defaultMileageRateDraft ?? defaultMileageRateReal;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    const isDistanceRequest = isDistanceRequestUtil(transaction);
    const isManualDistanceRequest = isManualDistanceRequestUtil(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestUtil(transaction);

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);
    const iouMerchant = getMerchant(transaction);
    const iouCategory = getCategory(transaction);
    const iouAttendees = useMemo(() => getAttendees(transaction, currentUserPersonalDetails), [transaction, currentUserPersonalDetails]);

    const isTypeRequest = iouType === CONST.IOU.TYPE.SUBMIT;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const isScanRequest = useMemo(() => isScanRequestUtil(transaction), [transaction]);
    const isFromGlobalCreateAndCanEditParticipant = !!transaction?.isFromGlobalCreate && !isPerDiemRequest && !isTimeRequest;

    const transactionID = transaction?.transactionID;
    const previousTransactionCurrency = usePrevious(transaction?.currency);
    const customUnitRateID = getRateID(transaction);

    const subRates = transaction?.comment?.customUnit?.subRates ?? [];
    const defaultRate = defaultMileageRate?.customUnitRateID;

    const mileageRate = DistanceRequestUtils.getRate({
        transaction,
        policy,
        ...(isMovingTransactionFromTrackExpense && {policyForMovingExpenses}),
        policyDraft,
    });
    const rate = mileageRate.rate;
    const prevRate = usePrevious(rate);
    const unit = mileageRate.unit;
    const prevUnit = usePrevious(unit);
    const currency = mileageRate.currency ?? CONST.CURRENCY.USD;
    const prevCurrency = usePrevious(currency);
    const prevSubRates = usePrevious(subRates);

    // A flag for showing the categories field
    const shouldShowCategories = isTrackExpense
        ? !policy || shouldSelectPolicy || !!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {}))
        : (isPolicyExpenseChat || isTypeInvoice) && (!!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowMerchant = (shouldShowSmartScanFields || isTypeSend) && !isDistanceRequest && !isPerDiemRequest && (!isTimeRequest || action !== CONST.IOU.ACTION.CREATE);

    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat || isTrackExpense, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest);

    // Update the tax code when the default changes (for example, because the transaction currency changed)
    const defaultTaxCode = getDefaultTaxCode(policy, transaction) ?? (isMovingTransactionFromTrackExpense ? (getDefaultTaxCode(policyForMovingExpenses, transaction) ?? '') : '');
    const defaultTaxValue = getTaxValue(policy, transaction, defaultTaxCode) ?? null;
    const previousDefaultTaxCode = getDefaultTaxCode(policy, transaction, previousTransactionCurrency);
    const shouldKeepCurrentTaxSelection = hasTaxRateWithMatchingValue(policy, transaction) && transaction?.taxCode !== previousDefaultTaxCode;

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

    let formattedAmount = convertToDisplayString(amountToBeUsed, isDistanceRequest ? currency : iouCurrencyCode);
    if (isDistanceRequestWithPendingRoute) {
        formattedAmount = '';
    } else if (isScanning(transaction)) {
        formattedAmount = translate('iou.receiptStatusTitle');
    }
    const formattedAmountPerAttendee =
        isDistanceRequestWithPendingRoute || isScanRequest
            ? ''
            : convertToDisplayString(amountToBeUsed / (iouAttendees?.length && iouAttendees.length > 0 ? iouAttendees.length : 1), isDistanceRequest ? currency : iouCurrencyCode);
    const isFocused = useIsFocused();
    const [formError, debouncedFormError, setFormError] = useDebouncedState<TranslationPaths | ''>('');

    const [didConfirm, setDidConfirm] = useState(isConfirmed);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);

    useEffect(() => {
        setShowMoreFields(false);
    }, [transactionID]);

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
    const isMerchantFieldValid = useMemo(() => {
        const merchantValue = iouMerchant ?? '';
        const trimmedMerchant = merchantValue.trim();
        const {isValid} = isValidInputLength(merchantValue, CONST.MERCHANT_NAME_MAX_BYTES);

        if (!isValid) {
            return false;
        }

        if (!trimmedMerchant) {
            return !isMerchantRequired;
        }

        return !isInvalidMerchantValue(trimmedMerchant);
    }, [iouMerchant, isMerchantRequired]);

    const isCategoryRequired = !!policy?.requiresCategory && !isTypeInvoice;

    const isDescriptionRequired = useMemo(
        () => isCategoryDescriptionRequired(policyCategories, iouCategory, policy?.areRulesEnabled),
        [iouCategory, policyCategories, policy?.areRulesEnabled],
    );

    const isViolationFixed = getIsViolationFixed(formError, {
        category: iouCategory,
        tag: getTag(transaction),
        taxCode: transaction?.taxCode,
        taxValue: transaction?.taxValue,
        policyCategories,
        policyTagLists: policyTags,
        policyTaxRates: policy?.taxRates?.taxes,
        iouAttendees,
        currentUserPersonalDetails,
        isAttendeeTrackingEnabled: isAttendeeTrackingEnabled(policy),
        isControlPolicy: policy?.type === CONST.POLICY.TYPE.CORPORATE,
    });

    useEffect(() => {
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        if (formError === 'iou.error.invalidMerchant' && isMerchantFieldValid) {
            setFormError('');
            return;
        }
        // Check 1: If formError does NOT start with "violations.", clear it and return
        // Reset the form error whenever the screen gains or loses focus
        // but preserve violation-related errors since those represent real validation issues
        // that can only be resolved by fixing the underlying issue
        if (!formError.startsWith(CONST.VIOLATIONS_PREFIX)) {
            setFormError('');
            return;
        }
        // Check 2: Only reached if formError STARTS with "violations."
        // Clear any violation error if the user has fixed the underlying issue
        if (isViolationFixed) {
            setFormError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run if it's just setFormError that changes
    }, [isFocused, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit, isViolationFixed, isMerchantFieldValid]);

    const routeError = Object.values(transaction?.errorFields?.route ?? {}).at(0);

    // Calculate and set tax amount in transaction draft
    const taxableAmount = isDistanceRequest ? DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, distance) : Math.abs(transaction?.amount ?? 0);
    // First we'll try to get the tax value from the chosen policy and if not found, we'll try to get it from the policy for moving expenses (only if the transaction is moving from track expense)
    const taxPercentage =
        getTaxValue(policy, transaction, transaction?.taxCode ?? defaultTaxCode) ??
        (isMovingTransactionFromTrackExpense ? getTaxValue(policyForMovingExpenses, transaction, transaction?.taxCode ?? defaultTaxCode) : '');
    const taxDecimals = getCurrencyDecimals(transaction?.currency ?? CONST.CURRENCY.USD);
    const taxAmount = isMovingTransactionFromTrackExpense && transaction?.taxAmount ? Math.abs(transaction?.taxAmount ?? 0) : calculateTaxAmount(taxPercentage, taxableAmount, taxDecimals);

    const taxAmountInSmallestCurrencyUnits = convertToBackendAmount(Number.parseFloat(taxAmount.toString()));
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
                text = translate('iou.sendInvoice', formattedAmount);
            } else {
                text = translate('common.next');
            }
        } else if (isTypeTrackExpense) {
            text = translate('iou.createExpense');
            if (iouAmount !== 0 && !isNewManualExpenseFlowEnabled) {
                text = translate('iou.createExpenseWithAmount', {amount: formattedAmount});
            }
        } else if (isTypeSplit && iouAmount === 0) {
            text = translate('iou.splitExpense');
        } else if ((receiptPath && isTypeRequest) || isDistanceRequestWithPendingRoute || isPerDiemRequest) {
            text = translate('iou.createExpense');
            if (iouAmount !== 0 && !isNewManualExpenseFlowEnabled) {
                text = translate('iou.createExpenseWithAmount', {amount: formattedAmount});
            }
        } else if (isTypeSplit) {
            text = translate('iou.splitAmount', formattedAmount);
            if (isNewManualExpenseFlowEnabled) {
                text = translate('iou.splitExpense');
            }
        } else if (iouAmount === 0) {
            text = translate('iou.createExpense');
        } else if (isNewManualExpenseFlowEnabled) {
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
        isNewManualExpenseFlowEnabled,
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
                    keyForList: `${participantOption.keyForList ?? participantOption.accountID ?? participantOption.reportID}`,
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
            keyForList: `${participantOption.keyForList ?? participantOption.accountID ?? participantOption.reportID}`,
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
        convertToDisplayString,
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
                            // Dismiss the keyboard so that MoneyRequestAmountInput's useEffect syncs the new amount.
                            // Without this, the effect skips the update while the input is focused (see formatAmountOnBlur guard).
                            Keyboard.dismiss();
                            resetSplitShares(transaction);
                        }}
                        accessibilityLabel={CONST.ROLE.BUTTON}
                        role={CONST.ROLE.BUTTON}
                        shouldUseAutoHitSlop
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.RESET_SPLIT_SHARES}
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

    const canEditParticipant = isFromGlobalCreateAndCanEditParticipant && !isTestReceipt && (!isRestrictedToPreferredPolicy || isTypeInvoice);

    const sections = useMemo(() => {
        const options: Array<Section<MoneyRequestConfirmationListItem>> = [];
        if (isTypeSplit) {
            options.push(
                {
                    title: translate('moneyRequestConfirmationList.paidBy'),
                    data: [getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)],
                    sectionIndex: 0,
                },
                {
                    customHeader: getSplitSectionHeader(),
                    data: splitParticipants,
                    sectionIndex: 1,
                },
            );
            // When adding an expense from within a report, hide the "To:" section since the destination is already the current report
        } else if (!shouldHideToSection) {
            const formattedSelectedParticipants = selectedParticipants.map((participant) => ({
                ...participant,
                isSelected: false,
                keyForList: `${participant.keyForList ?? participant.accountID ?? participant.reportID}`,
                isInteractive: canEditParticipant,
                shouldShowRightCaret: canEditParticipant,
            }));

            options.push({
                title: translate('common.to'),
                data: formattedSelectedParticipants,
                sectionIndex: 0,
            });
        }

        return options;
    }, [isTypeSplit, translate, payeePersonalDetails, getSplitSectionHeader, splitParticipants, selectedParticipants, canEditParticipant, shouldHideToSection]);

    /**
     * Navigate to the participant step
     */
    const navigateToParticipantPage = () => {
        if (!canEditParticipant) {
            return;
        }

        const newIOUType = iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.CREATE : iouType;
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(newIOUType, transactionID, transaction.reportID, Navigation.getActiveRoute(), action));
    };

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        ({paymentType: paymentMethod}: PaymentActionParams) => {
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

            const amountForValidation = iouAmount;
            const isAmountMissingForManualFlow = amountForValidation === null || amountForValidation === undefined;

            if (iouType !== CONST.IOU.TYPE.PAY && isNewManualExpenseFlowEnabled && isAmountMissingForManualFlow) {
                setFormError('common.error.invalidAmount');
                return;
            }

            const merchantValue = iouMerchant ?? '';
            const {isValid: isMerchantLengthValid} = isValidInputLength(merchantValue, CONST.MERCHANT_NAME_MAX_BYTES);

            if (!isMerchantLengthValid) {
                setFormError('iou.error.invalidMerchant');
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
                getIsMissingAttendeesViolation(
                    policyCategories,
                    iouCategory,
                    iouAttendees,
                    currentUserPersonalDetails,
                    isAttendeeTrackingEnabled(policy),
                    policy?.type === CONST.POLICY.TYPE.CORPORATE,
                );
            if (isMissingAttendeesViolation) {
                setFormError('violations.missingAttendees');
                return;
            }

            if (shouldShowTax && !!transaction.taxCode && !hasTaxRateWithMatchingValue(policy, transaction)) {
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

                if (isDistanceRequest && Math.abs(iouAmount) > CONST.IOU.MAX_SAFE_AMOUNT) {
                    setFormError('iou.error.distanceAmountTooLarge');
                    return;
                }

                if (isTimeRequest && !isValidTimeExpenseAmount(iouAmount, decimals)) {
                    setFormError('iou.timeTracking.amountTooLargeError');
                    return;
                }

                if (isPerDiemRequest) {
                    if (!isValidPerDiemExpenseAmount(transaction.comment?.customUnit ?? {}, decimals)) {
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
            iouMerchant,
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
            getCurrencyDecimals,
            isNewManualExpenseFlowEnabled,
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
                sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_PAY_BUTTON}
            />
        ) : (
            <>
                {expensesNumber > 1 && (
                    <Button
                        large
                        text={translate('iou.removeThisExpense')}
                        onPress={showRemoveExpenseConfirmModal}
                        style={styles.mb3}
                        sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_REMOVE_EXPENSE_BUTTON}
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
                            onPress={(event, value) => confirm({paymentType: value as PaymentMethodType})}
                            options={splitOrRequestOptions}
                            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                            enterKeyEventListenerPriority={1}
                            useKeyboardShortcuts
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            isLoading={isConfirmed || isConfirming || isLoadingReceipt}
                            sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_SUBMIT_BUTTON}
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
        reportID,
        isConfirmed,
        isConfirming,
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
        isLoadingReceipt,
    ]);

    const isCompactMode = useMemo(() => !showMoreFields && isScanRequest && !isInLandscapeMode, [isScanRequest, showMoreFields, isInLandscapeMode]);
    const selectionListStyle = useMemo(
        () => ({
            containerStyle: [styles.flexBasisAuto],
            contentContainerStyle: isCompactMode ? [styles.flexGrow1] : undefined,
            listFooterContentStyle: isCompactMode ? [styles.flex1, styles.mv3] : [styles.mv3],
        }),
        [isCompactMode, styles.flexBasisAuto, styles.flexGrow1, styles.mv3, styles.flex1],
    );

    const listFooterContent = (
        <View style={isCompactMode ? styles.flex1 : undefined}>
            <MoneyRequestConfirmationListFooter
                action={action}
                distanceRateCurrency={currency}
                didConfirm={!!didConfirm}
                distance={distance}
                amount={amountToBeUsed}
                formattedAmount={formattedAmount}
                formattedAmountPerAttendee={formattedAmountPerAttendee}
                formError={formError}
                hasRoute={hasRoute}
                iouType={iouType}
                isCategoryRequired={isCategoryRequired}
                isDistanceRequest={isDistanceRequest}
                isManualDistanceRequest={isManualDistanceRequest}
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                isLoadingReceipt={isLoadingReceipt}
                isGPSDistanceRequest={isGPSDistanceRequest}
                isPerDiemRequest={isPerDiemRequest}
                isTimeRequest={isTimeRequest}
                isMerchantRequired={isMerchantRequired}
                isPolicyExpenseChat={isPolicyExpenseChat}
                isReadOnly={isReadOnly}
                isEditingSplitBill={isEditingSplitBill}
                isTypeInvoice={isTypeInvoice}
                onToggleBillable={onToggleBillable}
                policy={policy}
                policyTags={policyTags}
                policyTagLists={policyTagLists}
                rate={rate}
                distanceRateName={mileageRate.name}
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
                onToggleReimbursable={onToggleReimbursable}
                isReceiptEditable={isReceiptEditable}
                isDescriptionRequired={isDescriptionRequired}
                showMoreFields={showMoreFields}
                setShowMoreFields={setShowMoreFields}
            />
        </View>
    );

    return (
        <>
            <ConfirmationTelemetry transactionID={transactionID} />
            <TaxController
                transactionID={transactionID}
                policyID={policyID}
                isReadOnly={isReadOnly}
                shouldShowTax={shouldShowTax}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                defaultTaxCode={defaultTaxCode}
                defaultTaxValue={defaultTaxValue}
                shouldKeepCurrentTaxSelection={shouldKeepCurrentTaxSelection}
                taxAmountInSmallestCurrencyUnits={taxAmountInSmallestCurrencyUnits}
                transactionTaxAmount={transaction?.taxAmount}
            />
            <DistanceRequestController
                transactionID={transactionID}
                transaction={transaction}
                isDistanceRequest={isDistanceRequest}
                isManualDistanceRequest={isManualDistanceRequest}
                isPolicyExpenseChat={isPolicyExpenseChat}
                customUnitRateID={customUnitRateID}
                mileageRate={mileageRate}
                distance={distance}
                unit={unit}
                rate={rate}
                currency={currency}
                policy={policy}
                isReadOnly={isReadOnly}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                isTypeSplit={isTypeSplit}
                selectedParticipants={selectedParticipants}
                selectedParticipantsProp={selectedParticipantsProp}
                defaultMileageRateCustomUnitRateID={defaultRate}
                hasRoute={hasRoute}
                isDistanceRequestWithPendingRoute={isDistanceRequestWithPendingRoute}
                shouldCalculateDistanceAmount={shouldCalculateDistanceAmount}
                distanceRequestAmount={distanceRequestAmount}
                setFormError={setFormError}
                clearFormErrors={clearFormErrors}
            />
            <SplitBillController
                transaction={transaction}
                isTypeSplit={isTypeSplit}
                iouAmount={iouAmount}
                iouCurrencyCode={iouCurrencyCode}
                currentUserAccountID={currentUserPersonalDetails.accountID}
                isFocused={isFocused}
                onFormError={setFormError}
            />
            <FieldAutoSelector
                transactionID={transactionID}
                transaction={transaction}
                policyCategories={policyCategories}
                policyTagLists={policyTagLists}
                policyTags={policyTags}
                policy={policy}
                shouldShowCategories={shouldShowCategories}
                isCategoryRequired={isCategoryRequired}
                iouCategory={iouCategory}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
            />
            <MouseProvider>
                <SelectionListWithSections<MoneyRequestConfirmationListItem>
                    sections={sections}
                    ListItem={UserListItem}
                    onSelectRow={navigateToParticipantPage}
                    shouldSingleExecuteRowSelect
                    shouldPreventDefaultFocusOnSelectRow
                    shouldShowListEmptyContent={false}
                    footerContent={footerContent}
                    listFooterContent={listFooterContent}
                    style={selectionListStyle}
                    disableKeyboardShortcuts
                />
            </MouseProvider>
        </>
    );
}

export default memo(MoneyRequestConfirmationList);
