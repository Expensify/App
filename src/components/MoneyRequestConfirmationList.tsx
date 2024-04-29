import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import Str from 'expensify-common/lib/str';
import React, {useCallback, useEffect, useMemo, useReducer, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Log from '@libs/Log';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {isTaxTrackingEnabled} from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import * as IOU from '@userActions/IOU';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmedRoute from './ConfirmedRoute';
import ConfirmModal from './ConfirmModal';
import FormHelpMessage from './FormHelpMessage';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import OptionsSelector from './OptionsSelector';
import PDFThumbnail from './PDFThumbnail';
import ReceiptEmptyState from './ReceiptEmptyState';
import ReceiptImage from './ReceiptImage';
import SettlementButton from './SettlementButton';
import ShowMoreButton from './ShowMoreButton';
import Switch from './Switch';
import Text from './Text';

type MoneyRequestConfirmationListOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The session of the logged in user */
    session: OnyxEntry<OnyxTypes.Session>;

    /** Unit and rate used for if the expense is a distance expense */
    mileageRates: OnyxEntry<Record<string, MileageRate>>;

    /** Mileage rate default for the policy */
    defaultMileageRate: OnyxEntry<MileageRate>;

    /** Last selected distance rates */
    lastSelectedDistanceRates: OnyxEntry<Record<string, string>>;
};

type MoneyRequestConfirmationListProps = MoneyRequestConfirmationListOnyxProps & {
    /** Callback to inform parent modal of success */
    onConfirm?: (selectedParticipants: Participant[]) => void;

    /** Callback to parent modal to pay someone */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    /** Callback to inform a participant is selected */
    onSelectParticipant?: (option: Participant) => void;

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: boolean;

    /** IOU amount */
    iouAmount: number;

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
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails>;

    /** Can the participants be modified or not */
    canModifyParticipants?: boolean;

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

    /** List styles for OptionsSelector */
    listStyles?: StyleProp<ViewStyle>;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is a distance expense */
    isDistanceRequest?: boolean;

    /** Whether the expense is a scan expense */
    isScanRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

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
};

const getTaxAmount = (transaction: OnyxEntry<OnyxTypes.Transaction>, defaultTaxValue: string) => {
    const percentage = (transaction?.taxRate ? transaction?.taxRate?.data?.value : defaultTaxValue) ?? '';
    return TransactionUtils.calculateTaxAmount(percentage, transaction?.amount ?? 0);
};

function MoneyRequestConfirmationList({
    transaction = null,
    onSendMoney,
    onConfirm,
    onSelectParticipant,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isScanRequest = false,
    iouAmount,
    policyCategories,
    mileageRates,
    isDistanceRequest = false,
    policy,
    isPolicyExpenseChat = false,
    iouCategory = '',
    shouldShowSmartScanFields = true,
    isEditingSplitBill,
    policyTags,
    iouCurrencyCode,
    iouMerchant,
    hasMultipleParticipants,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    canModifyParticipants: canModifyParticipantsProp = false,
    session,
    isReadOnly = false,
    bankAccountRoute = '',
    policyID = '',
    reportID = '',
    receiptPath = '',
    iouComment,
    receiptFilename = '',
    listStyles,
    iouCreated,
    iouIsBillable = false,
    onToggleBillable,
    hasSmartScanFailed,
    reportActionID,
    defaultMileageRate,
    lastSelectedDistanceRates,
    action = CONST.IOU.ACTION.CREATE,
}: MoneyRequestConfirmationListProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {canUseP2PDistanceRequests, canUseViolations} = usePermissions(iouType);
    const {isOffline} = useNetwork();

    const isTypeRequest = iouType === CONST.IOU.TYPE.SUBMIT;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeTrackExpense = iouType === CONST.IOU.TYPE.TRACK;

    const transactionID = transaction?.transactionID ?? '';
    const customUnitRateID = TransactionUtils.getRateID(transaction) ?? '';

    useEffect(() => {
        if (customUnitRateID || !canUseP2PDistanceRequests) {
            return;
        }
        if (!customUnitRateID) {
            const rateID = lastSelectedDistanceRates?.[policy?.id ?? ''] ?? defaultMileageRate?.customUnitRateID ?? '';
            IOU.setCustomUnitRateID(transactionID, rateID);
        }
    }, [defaultMileageRate, customUnitRateID, lastSelectedDistanceRates, policy?.id, canUseP2PDistanceRequests, transactionID]);

    const policyCurrency = policy?.outputCurrency ?? PolicyUtils.getPersonalPolicy()?.outputCurrency ?? CONST.CURRENCY.USD;

    const mileageRate = TransactionUtils.isCustomUnitRateIDForP2P(transaction)
        ? DistanceRequestUtils.getRateForP2P(policyCurrency)
        : mileageRates?.[customUnitRateID] ?? DistanceRequestUtils.getDefaultMileageRate(policy);

    const {unit, rate} = mileageRate ?? {};

    const prevRate = usePrevious(rate);
    const shouldCalculateDistanceAmount = isDistanceRequest && (iouAmount === 0 || prevRate !== rate);

    const currency = (mileageRate as MileageRate)?.currency ?? policyCurrency;

    const distance = transaction?.routes?.route0?.distance ?? 0;
    const taxRates = policy?.taxRates ?? null;

    // A flag for showing the categories field
    const shouldShowCategories = isPolicyExpenseChat && (!!iouCategory || OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));

    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    // Do not hide fields in case of paying someone
    const shouldShowAllFields = !!isDistanceRequest || shouldExpandFields || !shouldShowSmartScanFields || isTypeSend || !!isEditingSplitBill;

    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited. For distance requests, don't show the merchant as there's already another "Distance" menu item
    const shouldShowDate = (shouldShowSmartScanFields || isDistanceRequest) && !isTypeSend;
    const shouldShowMerchant = shouldShowSmartScanFields && !isDistanceRequest && !isTypeSend;

    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);

    // A flag for showing the tags field
    const shouldShowTags = useMemo(() => isPolicyExpenseChat && OptionsListUtils.hasEnabledTags(policyTagLists), [isPolicyExpenseChat, policyTagLists]);

    // A flag for showing tax rate
    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy);

    // A flag for showing the billable field
    const shouldShowBillable = policy?.disabledFields?.defaultBillable === false;
    const isMovingTransactionFromTrackExpense = IOUUtils.isMovingTransactionFromTrackExpense(action);
    const hasRoute = TransactionUtils.hasRoute(transaction, isDistanceRequest);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate) && !isMovingTransactionFromTrackExpense;
    const formattedAmount = isDistanceRequestWithPendingRoute
        ? ''
        : CurrencyUtils.convertToDisplayString(
              shouldCalculateDistanceAmount ? DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0) : iouAmount,
              isDistanceRequest ? currency : iouCurrencyCode,
          );
    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(transaction?.taxAmount, iouCurrencyCode);
    const taxRateTitle = taxRates && transaction ? TransactionUtils.getDefaultTaxName(taxRates, transaction) : '';

    const previousTransactionAmount = usePrevious(transaction?.amount);

    const isFocused = useIsFocused();
    const [formError, setFormError] = useState('');

    const [didConfirm, setDidConfirm] = useState(false);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
    };

    const shouldDisplayFieldError: boolean = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (!!hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transaction)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transaction));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = !iouMerchant || iouMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isMerchantRequired = isPolicyExpenseChat && !isScanRequest && shouldShowMerchant;

    const shouldDisplayMerchantError = isMerchantRequired && (shouldDisplayFieldError || formError === 'iou.error.invalidMerchant') && isMerchantEmpty;

    const isCategoryRequired = canUseViolations && !!policy?.requiresCategory;

    useEffect(() => {
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        // reset the form error whenever the screen gains or loses focus
        setFormError('');
    }, [isFocused, transaction, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount) {
            return;
        }

        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
        IOU.setMoneyRequestAmount(transactionID, amount, currency ?? '');
    }, [shouldCalculateDistanceAmount, distance, rate, unit, transactionID, currency]);

    // Calculate and set tax amount in transaction draft
    useEffect(() => {
        const taxAmount = getTaxAmount(transaction, taxRates?.defaultValue ?? '').toString();
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(taxAmount));

        if (transaction?.taxAmount && previousTransactionAmount === transaction?.amount) {
            return IOU.setMoneyRequestTaxAmount(transaction?.transactionID, transaction?.taxAmount, true);
        }

        IOU.setMoneyRequestTaxAmount(transactionID, amountInSmallestCurrencyUnits, true);
    }, [taxRates?.defaultValue, transaction, transactionID, previousTransactionAmount]);

    /**
     * Returns the participants with amount
     */
    const getParticipantsWithAmount = useCallback(
        (participantsList: Participant[]) => {
            const amount = IOUUtils.calculateAmount(participantsList.length, iouAmount, iouCurrencyCode ?? '');
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participantsList, amount > 0 ? CurrencyUtils.convertToDisplayString(amount, iouCurrencyCode) : '');
        },
        [iouAmount, iouCurrencyCode],
    );

    // If completing a split expense fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    const splitOrRequestOptions: Array<DropdownOption<string>> = useMemo(() => {
        let text;
        if (isTypeTrackExpense) {
            text = translate('iou.trackExpense');
        } else if (isTypeSplit && iouAmount === 0) {
            text = translate('iou.splitExpense');
        } else if ((receiptPath && isTypeRequest) || isDistanceRequestWithPendingRoute) {
            text = translate('iou.submitExpense');
            if (iouAmount !== 0) {
                text = translate('iou.submitAmount', {amount: formattedAmount});
            }
        } else {
            const translationKey = isTypeSplit ? 'iou.splitAmount' : 'iou.submitAmount';
            text = translate(translationKey, {amount: formattedAmount});
        }
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: iouType,
            },
        ];
    }, [isTypeTrackExpense, isTypeSplit, iouAmount, receiptPath, isTypeRequest, isDistanceRequestWithPendingRoute, iouType, translate, formattedAmount]);

    const selectedParticipants = useMemo(() => selectedParticipantsProp.filter((participant) => participant.selected), [selectedParticipantsProp]);
    const payeePersonalDetails = useMemo(() => payeePersonalDetailsProp ?? currentUserPersonalDetails, [payeePersonalDetailsProp, currentUserPersonalDetails]);
    const canModifyParticipants = !isReadOnly && canModifyParticipantsProp && hasMultipleParticipants;
    const shouldDisablePaidBySection = canModifyParticipants;
    const optionSelectorSections = useMemo(() => {
        const sections = [];
        const unselectedParticipants = selectedParticipantsProp.filter((participant) => !participant.selected);
        if (hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipants);
            let formattedParticipantsList = [...new Set([...formattedSelectedParticipants, ...unselectedParticipants])];

            if (!canModifyParticipants) {
                formattedParticipantsList = formattedParticipantsList.map((participant) => ({
                    ...participant,
                    isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID ?? -1),
                }));
            }

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants.length, iouAmount, iouCurrencyCode ?? '', true);
            const formattedPayeeOption = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(
                payeePersonalDetails,
                iouAmount > 0 ? CurrencyUtils.convertToDisplayString(myIOUAmount, iouCurrencyCode) : '',
            );

            sections.push(
                {
                    title: translate('moneyRequestConfirmationList.paidBy'),
                    data: [formattedPayeeOption],
                    shouldShow: true,
                    isDisabled: shouldDisablePaidBySection,
                },
                {
                    title: translate('moneyRequestConfirmationList.splitWith'),
                    data: formattedParticipantsList,
                    shouldShow: true,
                },
            );
        } else {
            const formattedSelectedParticipants = selectedParticipants.map((participant) => ({
                ...participant,
                isDisabled: !participant.isPolicyExpenseChat && !participant.isSelfDM && ReportUtils.isOptimisticPersonalDetail(participant.accountID ?? -1),
            }));
            sections.push({
                title: translate('common.to'),
                data: formattedSelectedParticipants,
                shouldShow: true,
            });
        }
        return sections;
    }, [
        selectedParticipants,
        selectedParticipantsProp,
        hasMultipleParticipants,
        iouAmount,
        iouCurrencyCode,
        getParticipantsWithAmount,
        payeePersonalDetails,
        translate,
        shouldDisablePaidBySection,
        canModifyParticipants,
    ]);

    const selectedOptions = useMemo(() => {
        if (!hasMultipleParticipants) {
            return [];
        }
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)];
    }, [selectedParticipants, hasMultipleParticipants, payeePersonalDetails]);

    useEffect(() => {
        if (!isDistanceRequest || isMovingTransactionFromTrackExpense) {
            return;
        }

        /*
         Set pending waypoints based on the route status. We should handle this dynamically to cover cases such as:
         When the user completes the initial steps of the IOU flow offline and then goes online on the confirmation page.
         In this scenario, the route will be fetched from the server, and the waypoints will no longer be pending.
        */
        IOU.setMoneyRequestPendingFields(transactionID, {waypoints: isDistanceRequestWithPendingRoute ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null});

        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate ?? 0, currency ?? CONST.CURRENCY.USD, translate, toLocaleDigit);
        IOU.setMoneyRequestMerchant(transactionID, distanceMerchant, true);
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
        transaction,
        transactionID,
        action,
        isMovingTransactionFromTrackExpense,
    ]);

    // Auto select the category if there is only one enabled category and it is required
    useEffect(() => {
        const enabledCategories = Object.values(policyCategories ?? {}).filter((category) => category.enabled);
        if (iouCategory || !shouldShowCategories || enabledCategories.length !== 1 || !isCategoryRequired) {
            return;
        }
        IOU.setMoneyRequestCategory(transactionID, enabledCategories[0].name);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowCategories, policyCategories, isCategoryRequired]);

    // Auto select the tag if there is only one enabled tag and it is required
    useEffect(() => {
        let updatedTagsString = TransactionUtils.getTag(transaction);
        policyTagLists.forEach((tagList, index) => {
            const enabledTags = Object.values(tagList.tags).filter((tag) => tag.enabled);
            const isTagListRequired = tagList.required === undefined ? false : tagList.required && canUseViolations;
            if (!isTagListRequired || enabledTags.length !== 1 || TransactionUtils.getTag(transaction, index)) {
                return;
            }
            updatedTagsString = IOUUtils.insertTagIntoTransactionTagsString(updatedTagsString, enabledTags[0] ? enabledTags[0].name : '', index);
        });
        if (updatedTagsString !== TransactionUtils.getTag(transaction) && updatedTagsString) {
            IOU.setMoneyRequestTag(transactionID, updatedTagsString);
        }
    }, [policyTagLists, transaction, transactionID, policyTags, canUseViolations]);

    /**
     */
    const selectParticipant = useCallback(
        (option: Participant) => {
            // Return early if selected option is currently logged in user.
            if (option.accountID === session?.accountID) {
                return;
            }
            onSelectParticipant?.(option);
        },
        [session?.accountID, onSelectParticipant],
    );

    /**
     * Navigate to report details or profile of selected user
     */
    const navigateToReportOrUserDetail = (option: ReportUtils.OptionData) => {
        const activeRoute = Navigation.getActiveRouteWithoutParams();

        if (option.isSelfDM) {
            Navigation.navigate(ROUTES.PROFILE.getRoute(currentUserPersonalDetails.accountID, activeRoute));
            return;
        }

        if (option.accountID) {
            Navigation.navigate(ROUTES.PROFILE.getRoute(option.accountID, activeRoute));
        } else if (option.reportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(option.reportID, activeRoute));
        }
    };

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            if (selectedParticipants.length === 0) {
                return;
            }
            if (!isEditingSplitBill && isMerchantRequired && (isMerchantEmpty || (shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction ?? null)))) {
                setFormError('iou.error.invalidMerchant');
                return;
            }
            if (iouCategory.length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
                setFormError('iou.error.invalidCategoryLength');
                return;
            }

            if (iouType === CONST.IOU.TYPE.PAY) {
                if (!paymentMethod) {
                    return;
                }

                setDidConfirm(true);

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney?.(paymentMethod);
            } else {
                // validate the amount for distance expenses
                const decimals = CurrencyUtils.getCurrencyDecimals(iouCurrencyCode);
                if (isDistanceRequest && !isDistanceRequestWithPendingRoute && !MoneyRequestUtils.validateAmount(String(iouAmount), decimals)) {
                    setFormError('common.error.invalidAmount');
                    return;
                }

                if (isEditingSplitBill && TransactionUtils.areRequiredFieldsEmpty(transaction ?? null)) {
                    setDidConfirmSplit(true);
                    setFormError('iou.error.genericSmartscanFailureMessage');
                    return;
                }

                playSound(SOUNDS.DONE);
                setDidConfirm(true);
                onConfirm?.(selectedParticipants);
            }
        },
        [
            selectedParticipants,
            isMerchantRequired,
            isMerchantEmpty,
            shouldDisplayFieldError,
            transaction,
            iouType,
            onSendMoney,
            iouCurrencyCode,
            isDistanceRequest,
            iouCategory,
            isDistanceRequestWithPendingRoute,
            iouAmount,
            isEditingSplitBill,
            onConfirm,
        ],
    );

    const footerContent = useMemo(() => {
        if (isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = iouType === CONST.IOU.TYPE.PAY;
        const shouldDisableButton = selectedParticipants.length === 0;

        const button = shouldShowSettlementButton ? (
            <SettlementButton
                pressOnEnter
                isDisabled={shouldDisableButton}
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
            />
        ) : (
            <ButtonWithDropdownMenu
                success
                pressOnEnter
                isDisabled={shouldDisableButton}
                onPress={(event, value) => confirm(value as PaymentMethodType)}
                options={splitOrRequestOptions}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                enterKeyEventListenerPriority={1}
            />
        );

        return (
            <>
                {!!formError && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={formError}
                    />
                )}

                {button}
            </>
        );
    }, [isReadOnly, iouType, selectedParticipants.length, confirm, bankAccountRoute, iouCurrencyCode, policyID, splitOrRequestOptions, formError, styles.ph1, styles.mb2]);

    // An intermediate structure that helps us classify the fields as "primary" and "supplementary".
    // The primary fields are always shown to the user, while an extra action is needed to reveal the supplementary ones.
    const classifiedFields = [
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('iou.amount')}
                    shouldShowRightIcon={!isReadOnly && !isDistanceRequest}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    interactive={!isReadOnly}
                    onPress={() => {
                        if (isDistanceRequest) {
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction ?? null) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    error={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction ?? null) ? translate('common.error.enterAmount') : ''}
                />
            ),
            shouldShow: shouldShowSmartScanFields,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.description')}
                    shouldShowRightIcon={!isReadOnly}
                    shouldParseTitle
                    title={iouComment}
                    description={translate('common.description')}
                    onPress={() => {
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams(), reportActionID),
                        );
                    }}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    numberOfLinesTitle={2}
                />
            ),
            shouldShow: true,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.distance')}
                    shouldShowRightIcon={!isReadOnly && !isMovingTransactionFromTrackExpense}
                    title={isMerchantEmpty ? '' : iouMerchant}
                    description={translate('common.distance')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    // todo: handle edit for transaction while moving from track expense
                    interactive={!isReadOnly && !isMovingTransactionFromTrackExpense}
                />
            ),
            shouldShow: isDistanceRequest && !canUseP2PDistanceRequests,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.distance')}
                    shouldShowRightIcon={!isReadOnly}
                    title={DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate)}
                    description={translate('common.distance')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                />
            ),
            shouldShow: isDistanceRequest && canUseP2PDistanceRequests,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.rate')}
                    shouldShowRightIcon={Boolean(rate) && !isReadOnly && isPolicyExpenseChat}
                    title={DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline)}
                    description={translate('common.rate')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={Boolean(rate) && !isReadOnly && isPolicyExpenseChat}
                />
            ),
            shouldShow: isDistanceRequest && canUseP2PDistanceRequests,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.merchant')}
                    shouldShowRightIcon={!isReadOnly}
                    title={isMerchantEmpty ? '' : iouMerchant}
                    description={translate('common.merchant')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={shouldDisplayMerchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    error={shouldDisplayMerchantError ? translate('common.error.fieldRequired') : ''}
                    rightLabel={isMerchantRequired ? translate('common.required') : ''}
                />
            ),
            shouldShow: shouldShowMerchant,
            isSupplementary: !isMerchantRequired,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.date')}
                    shouldShowRightIcon={!isReadOnly}
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    title={iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                    description={translate('common.date')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    error={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? translate('common.error.enterDate') : ''}
                />
            ),
            shouldShow: shouldShowDate,
            isSupplementary: true,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.category')}
                    shouldShowRightIcon={!isReadOnly}
                    title={iouCategory}
                    description={translate('common.category')}
                    numberOfLinesTitle={2}
                    onPress={() =>
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams(), reportActionID))
                    }
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    rightLabel={isCategoryRequired ? translate('common.required') : ''}
                />
            ),
            shouldShow: shouldShowCategories,
            isSupplementary: action === CONST.IOU.ACTION.CATEGORIZE ? false : !isCategoryRequired,
        },
        ...policyTagLists.map(({name, required}, index) => {
            const isTagRequired = required === undefined ? false : canUseViolations && required;
            return {
                item: (
                    <MenuItemWithTopDescription
                        key={name}
                        shouldShowRightIcon={!isReadOnly}
                        title={TransactionUtils.getTagForDisplay(transaction, index)}
                        description={name}
                        numberOfLinesTitle={2}
                        onPress={() =>
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, index, transactionID, reportID, Navigation.getActiveRouteWithoutParams(), reportActionID),
                            )
                        }
                        style={[styles.moneyRequestMenuItem]}
                        disabled={didConfirm}
                        interactive={!isReadOnly}
                        rightLabel={isTagRequired ? translate('common.required') : ''}
                    />
                ),
                shouldShow: shouldShowTags,
                isSupplementary: !isTagRequired,
            };
        }),
        {
            item: (
                <MenuItemWithTopDescription
                    key={`${taxRates?.name}${taxRateTitle}`}
                    shouldShowRightIcon={!isReadOnly}
                    title={taxRateTitle}
                    description={taxRates?.name}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                />
            ),
            shouldShow: shouldShowTax,
            isSupplementary: true,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={`${taxRates?.name}${formattedTaxAmount}`}
                    shouldShowRightIcon={!isReadOnly}
                    title={formattedTaxAmount}
                    description={translate('iou.taxAmount')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                />
            ),
            shouldShow: shouldShowTax,
            isSupplementary: true,
        },
        {
            item: (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                    <Text color={!iouIsBillable ? theme.textSupporting : undefined}>{translate('common.billable')}</Text>
                    <Switch
                        accessibilityLabel={translate('common.billable')}
                        isOn={iouIsBillable}
                        onToggle={(isOn) => onToggleBillable?.(isOn)}
                    />
                </View>
            ),
            shouldShow: shouldShowBillable,
            isSupplementary: true,
        },
    ];

    const primaryFields = classifiedFields.filter((classifiedField) => classifiedField.shouldShow && !classifiedField.isSupplementary).map((primaryField) => primaryField.item);

    const supplementaryFields = classifiedFields
        .filter((classifiedField) => classifiedField.shouldShow && classifiedField.isSupplementary)
        .map((supplementaryField) => supplementaryField.item);

    const {
        image: receiptImage,
        thumbnail: receiptThumbnail,
        isThumbnail,
        fileExtension,
        isLocalFile,
    } = receiptPath && receiptFilename ? ReceiptUtils.getThumbnailAndImageURIs(transaction ?? null, receiptPath, receiptFilename) : ({} as ReceiptUtils.ThumbnailAndImageURI);

    const resolvedThumbnail = isLocalFile ? receiptThumbnail : tryResolveUrlFromApiRoot(receiptThumbnail ?? '');
    const resolvedReceiptImage = isLocalFile ? receiptImage : tryResolveUrlFromApiRoot(receiptImage ?? '');

    const receiptThumbnailContent = useMemo(
        () =>
            isLocalFile && Str.isPDF(receiptFilename) ? (
                <PDFThumbnail
                    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                    previewSourceURL={resolvedReceiptImage as string}
                    style={styles.moneyRequestImage}
                    // We don't support scaning password protected PDF receipt
                    enabled={!isAttachmentInvalid}
                    onPassword={() => setIsAttachmentInvalid(true)}
                />
            ) : (
                <ReceiptImage
                    style={styles.moneyRequestImage}
                    isThumbnail={isThumbnail}
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    source={resolvedThumbnail || resolvedReceiptImage || ''}
                    // AuthToken is required when retrieving the image from the server
                    // but we don't need it to load the blob:// or file:// image when starting an expense/split
                    // So if we have a thumbnail, it means we're retrieving the image from the server
                    isAuthTokenRequired={!!receiptThumbnail}
                    fileExtension={fileExtension}
                />
            ),
        [isLocalFile, receiptFilename, resolvedThumbnail, styles.moneyRequestImage, isAttachmentInvalid, isThumbnail, resolvedReceiptImage, receiptThumbnail, fileExtension],
    );

    return (
        // @ts-expect-error This component is deprecated and will not be migrated to TypeScript (context: https://expensify.slack.com/archives/C01GTK53T8Q/p1709232289899589?thread_ts=1709156803.359359&cid=C01GTK53T8Q)
        <OptionsSelector
            sections={optionSelectorSections}
            onSelectRow={canModifyParticipants ? selectParticipant : navigateToReportOrUserDetail}
            onAddToSelection={selectParticipant}
            onConfirmSelection={confirm}
            selectedOptions={selectedOptions}
            canSelectMultipleOptions={canModifyParticipants}
            disableArrowKeysActions={!canModifyParticipants}
            boldStyle
            showTitleTooltip
            shouldTextInputAppearBelowOptions
            shouldShowTextInput={false}
            shouldUseStyleForChildren={false}
            optionHoveredStyle={canModifyParticipants ? styles.hoveredComponentBG : {}}
            footerContent={footerContent}
            listStyles={listStyles}
            shouldAllowScrollingChildren
        >
            {isDistanceRequest && (
                <View style={styles.confirmationListMapItem}>
                    <ConfirmedRoute transaction={transaction ?? ({} as OnyxTypes.Transaction)} />
                </View>
            )}
            {!isDistanceRequest &&
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (receiptImage || receiptThumbnail
                    ? receiptThumbnailContent
                    : // The empty receipt component should only show for IOU Requests of a paid policy ("Team" or "Corporate")
                      PolicyUtils.isPaidGroupPolicy(policy) &&
                      !isDistanceRequest &&
                      iouType === CONST.IOU.TYPE.SUBMIT && (
                          <ReceiptEmptyState
                              onPress={() =>
                                  Navigation.navigate(
                                      ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
                                  )
                              }
                          />
                      ))}
            {primaryFields}
            {!shouldShowAllFields && (
                <ShowMoreButton
                    containerStyle={[styles.mt1, styles.mb2]}
                    onPress={toggleShouldExpandFields}
                />
            )}
            {shouldShowAllFields && supplementaryFields}
            <ConfirmModal
                title={translate('attachmentPicker.wrongFileType')}
                onConfirm={navigateBack}
                onCancel={navigateBack}
                isVisible={isAttachmentInvalid}
                prompt={translate('attachmentPicker.protectedPDFNotSupported')}
                confirmText={translate('common.close')}
                shouldShowCancelButton={false}
            />
        </OptionsSelector>
    );
}

MoneyRequestConfirmationList.displayName = 'MoneyRequestConfirmationList';

export default withOnyx<MoneyRequestConfirmationListProps, MoneyRequestConfirmationListOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
    policyTags: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
    },
    defaultMileageRate: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        selector: DistanceRequestUtils.getDefaultMileageRate,
    },
    mileageRates: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        selector: DistanceRequestUtils.getMileageRates,
    },
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    },
    lastSelectedDistanceRates: {
        key: ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
    },
})(MoneyRequestConfirmationList);
