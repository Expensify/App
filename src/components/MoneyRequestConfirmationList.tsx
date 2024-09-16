import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {MouseProvider} from '@hooks/useMouseContext';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Log from '@libs/Log';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getCustomUnitRate, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import {hasInvoicingDetails} from '@userActions/Policy/Policy';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {SplitShares} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import FormHelpMessage from './FormHelpMessage';
import MoneyRequestAmountInput from './MoneyRequestAmountInput';
import MoneyRequestConfirmationListFooter from './MoneyRequestConfirmationListFooter';
import {PressableWithFeedback} from './Pressable';
import SelectionList from './SelectionList';
import type {SectionListDataType} from './SelectionList/types';
import UserListItem from './SelectionList/UserListItem';
import SettlementButton from './SettlementButton';
import Text from './Text';

type MoneyRequestConfirmationListOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of draft categories attached to a policy */
    policyCategoriesDraft: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The draft policy of the report */
    policyDraft: OnyxEntry<OnyxTypes.Policy>;

    /** Unit and rate used for if the expense is a distance expense */
    mileageRates: OnyxEntry<Record<string, MileageRate>>;

    /** Mileage rate default for the policy */
    defaultMileageRate: OnyxEntry<MileageRate>;

    /** Last selected distance rates */
    lastSelectedDistanceRates: OnyxEntry<Record<string, string>>;

    /** List of currencies */
    currencyList: OnyxEntry<OnyxTypes.CurrencyList>;
};

type MoneyRequestConfirmationListProps = MoneyRequestConfirmationListOnyxProps & {
    /** Callback to inform parent modal of success */
    onConfirm?: (selectedParticipants: Participant[]) => void;

    /** Callback to parent modal to pay someone */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

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
    isDistanceRequest?: boolean;

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
};

type MoneyRequestConfirmationListItem = Participant | ReportUtils.OptionData;

function MoneyRequestConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    iouType = CONST.IOU.TYPE.SUBMIT,
    iouAmount,
    policyCategories: policyCategoriesReal,
    policyCategoriesDraft,
    mileageRates: mileageRatesReal,
    isDistanceRequest = false,
    policy: policyReal,
    policyDraft,
    isPolicyExpenseChat = false,
    iouCategory = '',
    shouldShowSmartScanFields = true,
    isEditingSplitBill,
    policyTags,
    iouCurrencyCode,
    iouMerchant,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    bankAccountRoute = '',
    policyID = '',
    reportID = '',
    receiptPath = '',
    iouComment,
    receiptFilename = '',
    iouCreated,
    iouIsBillable = false,
    onToggleBillable,
    hasSmartScanFailed,
    reportActionID,
    defaultMileageRate,
    lastSelectedDistanceRates,
    action = CONST.IOU.ACTION.CREATE,
    currencyList,
    shouldDisplayReceipt = false,
    shouldPlaySound = true,
    isConfirmed,
}: MoneyRequestConfirmationListProps) {
    const policy = policyReal ?? policyDraft;
    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;
    const [mileageRatesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID || '-1'}`, {
        selector: (selectedPolicy: OnyxEntry<OnyxTypes.Policy>) => DistanceRequestUtils.getMileageRates(selectedPolicy),
    });
    const mileageRates = isEmptyObject(mileageRatesReal) ? mileageRatesDraft : mileageRatesReal;

    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {canUseP2PDistanceRequests} = usePermissions(iouType);

    const isTypeRequest = iouType === CONST.IOU.TYPE.SUBMIT;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const isScanRequest = useMemo(() => TransactionUtils.isScanRequest(transaction), [transaction]);

    const transactionID = transaction?.transactionID ?? '-1';
    const customUnitRateID = TransactionUtils.getRateID(transaction) ?? '-1';

    useEffect(() => {
        if ((customUnitRateID && customUnitRateID !== '-1') || !isDistanceRequest) {
            return;
        }

        const defaultRate = defaultMileageRate?.customUnitRateID ?? '';
        const lastSelectedRate = lastSelectedDistanceRates?.[policy?.id ?? ''] ?? defaultRate;
        const rateID = canUseP2PDistanceRequests ? lastSelectedRate : defaultRate;
        IOU.setCustomUnitRateID(transactionID, rateID);
    }, [defaultMileageRate, customUnitRateID, lastSelectedDistanceRates, policy?.id, canUseP2PDistanceRequests, transactionID, isDistanceRequest]);

    const policyCurrency = policy?.outputCurrency ?? PolicyUtils.getPersonalPolicy()?.outputCurrency ?? CONST.CURRENCY.USD;

    const mileageRate = TransactionUtils.isCustomUnitRateIDForP2P(transaction) ? DistanceRequestUtils.getRateForP2P(policyCurrency) : mileageRates?.[customUnitRateID] ?? defaultMileageRate;

    const {unit, rate} = mileageRate ?? {};

    const prevRate = usePrevious(rate);

    const currency = (mileageRate as MileageRate)?.currency ?? policyCurrency;

    // A flag for showing the categories field
    const shouldShowCategories = (isPolicyExpenseChat || isTypeInvoice) && (!!iouCategory || OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowMerchant = shouldShowSmartScanFields && !isDistanceRequest && !isTypeSend;

    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest);

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
            (transaction.taxCode &&
                previousTransactionModifiedCurrency === transaction.modifiedCurrency &&
                previousTransactionCurrency === transaction.currency &&
                previousCustomUnitRateID === customUnitRateID)
        ) {
            return;
        }
        const defaultTaxCode = TransactionUtils.getDefaultTaxCode(policy, transaction);
        IOU.setMoneyRequestTaxRate(transactionID, defaultTaxCode ?? '');
    }, [customUnitRateID, policy, previousCustomUnitRateID, previousTransactionCurrency, previousTransactionModifiedCurrency, shouldShowTax, transaction, transactionID]);

    const isMovingTransactionFromTrackExpense = IOUUtils.isMovingTransactionFromTrackExpense(action);

    const distance = TransactionUtils.getDistanceInMeters(transaction, unit);
    const prevDistance = usePrevious(distance);

    const shouldCalculateDistanceAmount = isDistanceRequest && (iouAmount === 0 || prevRate !== rate || prevDistance !== distance);

    const hasRoute = TransactionUtils.hasRoute(transaction, isDistanceRequest);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate) && !isMovingTransactionFromTrackExpense;
    const distanceRequestAmount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
    const formattedAmount = isDistanceRequestWithPendingRoute
        ? ''
        : CurrencyUtils.convertToDisplayString(shouldCalculateDistanceAmount ? distanceRequestAmount : iouAmount, isDistanceRequest ? currency : iouCurrencyCode);

    const isFocused = useIsFocused();
    const [formError, debouncedFormError, setFormError] = useDebouncedState<TranslationPaths | ''>('');

    const [didConfirm, setDidConfirm] = useState(isConfirmed);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const shouldDisplayFieldError: boolean = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (!!hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transaction)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transaction));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = useMemo(() => !iouMerchant || TransactionUtils.isMerchantMissing(transaction), [transaction, iouMerchant]);
    const isMerchantRequired = isPolicyExpenseChat && (!isScanRequest || isEditingSplitBill) && shouldShowMerchant;

    const isCategoryRequired = !!policy?.requiresCategory;

    const shouldDisableParticipant = (participant: Participant): boolean => {
        if (ReportUtils.isDraftReport(participant.reportID)) {
            return true;
        }

        if (!participant.isInvoiceRoom && !participant.isPolicyExpenseChat && !participant.isSelfDM && ReportUtils.isOptimisticPersonalDetail(participant.accountID ?? -1)) {
            return true;
        }

        return false;
    };

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

    const isFirstUpdatedDistanceAmount = useRef(false);

    useEffect(() => {
        if (isFirstUpdatedDistanceAmount.current) {
            return;
        }
        if (!isDistanceRequest) {
            return;
        }
        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
        IOU.setMoneyRequestAmount(transactionID, amount, currency ?? '');
        isFirstUpdatedDistanceAmount.current = true;
    }, [distance, rate, unit, transactionID, currency, isDistanceRequest]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount) {
            return;
        }

        const amount = distanceRequestAmount;
        IOU.setMoneyRequestAmount(transactionID, amount, currency ?? '');

        // If it's a split request among individuals, set the split shares
        const participantAccountIDs: number[] = selectedParticipantsProp.map((participant) => participant.accountID ?? -1);
        if (isTypeSplit && !isPolicyExpenseChat && amount && transaction?.currency) {
            IOU.setSplitShares(transaction, amount, currency, participantAccountIDs);
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

        let taxableAmount: number;
        let taxCode: string;
        if (isDistanceRequest) {
            const customUnitRate = getCustomUnitRate(policy, customUnitRateID);
            taxCode = customUnitRate?.attributes?.taxRateExternalID ?? '';
            taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, distance);
        } else {
            taxableAmount = transaction.amount ?? 0;
            taxCode = transaction.taxCode ?? TransactionUtils.getDefaultTaxCode(policy, transaction) ?? '';
        }
        const taxPercentage = TransactionUtils.getTaxValue(policy, transaction, taxCode) ?? '';
        const taxAmount = TransactionUtils.calculateTaxAmount(taxPercentage, taxableAmount, transaction.currency);
        const taxAmountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(taxAmount.toString()));
        IOU.setMoneyRequestTaxAmount(transaction.transactionID ?? '', taxAmountInSmallestCurrencyUnits);
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
    }, [isTypeTrackExpense, isTypeSplit, iouAmount, receiptPath, isTypeRequest, policy, isDistanceRequestWithPendingRoute, iouType, translate, formattedAmount, isTypeInvoice]);

    const onSplitShareChange = useCallback(
        (accountID: number, value: number) => {
            if (!transaction?.transactionID) {
                return;
            }
            const amountInCents = CurrencyUtils.convertToBackendAmount(value);
            IOU.setIndividualShare(transaction?.transactionID, accountID, amountInCents);
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
        IOU.adjustRemainingSplitShares(transaction);
    }, [isTypeSplit, transaction]);

    const selectedParticipants = useMemo(() => selectedParticipantsProp.filter((participant) => participant.selected), [selectedParticipantsProp]);
    const payeePersonalDetails = useMemo(() => payeePersonalDetailsProp ?? currentUserPersonalDetails, [payeePersonalDetailsProp, currentUserPersonalDetails]);
    const shouldShowReadOnlySplits = useMemo(() => isPolicyExpenseChat || isReadOnly || isScanRequest, [isPolicyExpenseChat, isReadOnly, isScanRequest]);

    const splitParticipants = useMemo(() => {
        if (!isTypeSplit) {
            return [];
        }

        const payeeOption = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails);
        if (shouldShowReadOnlySplits) {
            return [payeeOption, ...selectedParticipants].map((participantOption: Participant) => {
                const isPayer = participantOption.accountID === payeeOption.accountID;
                let amount: number | undefined = 0;
                if (iouAmount > 0) {
                    amount =
                        transaction?.comment?.splits?.find((split) => split.accountID === participantOption.accountID)?.amount ??
                        IOUUtils.calculateAmount(selectedParticipants.length, iouAmount, iouCurrencyCode ?? '', isPayer);
                }
                return {
                    ...participantOption,
                    isSelected: false,
                    isInteractive: !shouldDisableParticipant(participantOption),
                    rightElement: (
                        <View style={[styles.flexWrap, styles.pl2]}>
                            <Text style={[styles.textLabel]}>{amount ? CurrencyUtils.convertToDisplayString(amount, iouCurrencyCode) : ''}</Text>
                        </View>
                    ),
                };
            });
        }

        const currencySymbol = currencyList?.[iouCurrencyCode ?? '']?.symbol ?? iouCurrencyCode;
        const formattedTotalAmount = CurrencyUtils.convertToDisplayStringWithoutCurrency(iouAmount, iouCurrencyCode);

        return [payeeOption, ...selectedParticipants].map((participantOption: Participant) => ({
            ...participantOption,
            tabIndex: -1,
            isSelected: false,
            isInteractive: !shouldDisableParticipant(participantOption),
            rightElement: (
                <MoneyRequestAmountInput
                    autoGrow={false}
                    amount={transaction?.splitShares?.[participantOption.accountID ?? -1]?.amount}
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
                    onFormatAmount={CurrencyUtils.convertToDisplayStringWithoutCurrency}
                    onAmountChange={(value: string) => onSplitShareChange(participantOption.accountID ?? -1, Number(value))}
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
                {!shouldShowReadOnlySplits && isSplitModified && (
                    <PressableWithFeedback
                        onPress={() => {
                            IOU.resetSplitShares(transaction);
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
                        data: [OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)],
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
                isInteractive: !shouldDisableParticipant(participant),
            }));
            options.push({
                title: translate('common.to'),
                data: formattedSelectedParticipants,
                shouldShow: true,
            });
        }

        return options;
    }, [isTypeSplit, translate, payeePersonalDetails, getSplitSectionHeader, splitParticipants, selectedParticipants]);

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
        IOU.setMoneyRequestCategory(transactionID, enabledCategories.at(0)?.name ?? '');
        // Keep 'transaction' out to ensure that we autoselect the option only once
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldShowCategories, policyCategories, isCategoryRequired]);

    // Auto select the tag if there is only one enabled tag and it is required
    useEffect(() => {
        let updatedTagsString = TransactionUtils.getTag(transaction);
        policyTagLists.forEach((tagList, index) => {
            const enabledTags = Object.values(tagList.tags).filter((tag) => tag.enabled);
            const isTagListRequired = tagList.required ?? false;
            if (!isTagListRequired || enabledTags.length !== 1 || TransactionUtils.getTag(transaction, index)) {
                return;
            }
            updatedTagsString = IOUUtils.insertTagIntoTransactionTagsString(updatedTagsString, enabledTags.at(0)?.name ?? '', index);
        });
        if (updatedTagsString !== TransactionUtils.getTag(transaction) && updatedTagsString) {
            IOU.setMoneyRequestTag(transactionID, updatedTagsString);
        }
        // Keep 'transaction' out to ensure that we autoselect the option only once
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policyTagLists, policyTags]);

    /**
     * Navigate to report details or profile of selected user
     */
    const navigateToReportOrUserDetail = (option: MoneyRequestConfirmationListItem) => {
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
            if (iouType === CONST.IOU.TYPE.INVOICE && !hasInvoicingDetails(policy)) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_COMPANY_INFO.getRoute(iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                return;
            }

            if (selectedParticipants.length === 0) {
                return;
            }
            if (!isEditingSplitBill && isMerchantRequired && (isMerchantEmpty || (shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction)))) {
                setFormError('iou.error.invalidMerchant');
                return;
            }
            if (iouCategory.length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
                setFormError('iou.error.invalidCategoryLength');
                return;
            }

            if (iouType !== CONST.IOU.TYPE.PAY) {
                // validate the amount for distance expenses
                const decimals = CurrencyUtils.getCurrencyDecimals(iouCurrencyCode);
                if (isDistanceRequest && !isDistanceRequestWithPendingRoute && !MoneyRequestUtils.validateAmount(String(iouAmount), decimals)) {
                    setFormError('common.error.invalidAmount');
                    return;
                }

                if (isEditingSplitBill && TransactionUtils.areRequiredFieldsEmpty(transaction)) {
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
            isDistanceRequestWithPendingRoute,
            iouAmount,
            onConfirm,
            shouldPlaySound,
            transactionID,
            reportID,
            policy,
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
                useKeyboardShortcuts
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
                useKeyboardShortcuts
            />
        );

        return (
            <>
                {!!formError && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={isTypeSplit && !shouldShowReadOnlySplits ? debouncedFormError && translate(debouncedFormError) : translate(formError)}
                    />
                )}

                {button}
            </>
        );
    }, [
        isReadOnly,
        isTypeSplit,
        iouType,
        selectedParticipants.length,
        confirm,
        bankAccountRoute,
        iouCurrencyCode,
        policyID,
        splitOrRequestOptions,
        formError,
        styles.ph1,
        styles.mb2,
        shouldShowReadOnlySplits,
        debouncedFormError,
        translate,
    ]);

    const listFooterContent = (
        <MoneyRequestConfirmationListFooter
            action={action}
            canUseP2PDistanceRequests={canUseP2PDistanceRequests}
            currency={currency}
            didConfirm={!!didConfirm}
            distance={distance}
            formattedAmount={formattedAmount}
            formError={formError}
            hasRoute={hasRoute}
            iouCategory={iouCategory}
            iouComment={iouComment}
            iouCreated={iouCreated}
            iouCurrencyCode={iouCurrencyCode}
            iouIsBillable={iouIsBillable}
            iouMerchant={iouMerchant}
            iouType={iouType}
            isCategoryRequired={isCategoryRequired}
            isDistanceRequest={isDistanceRequest}
            isEditingSplitBill={isEditingSplitBill}
            isMerchantEmpty={isMerchantEmpty}
            isMerchantRequired={isMerchantRequired}
            isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
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
            shouldShowTax={shouldShowTax}
            transaction={transaction}
            transactionID={transactionID}
            unit={unit}
        />
    );

    return (
        <MouseProvider>
            <SelectionList<MoneyRequestConfirmationListItem>
                sections={sections}
                ListItem={UserListItem}
                onSelectRow={navigateToReportOrUserDetail}
                shouldSingleExecuteRowSelect
                canSelectMultiple={false}
                shouldPreventDefaultFocusOnSelectRow
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

export default withOnyx<MoneyRequestConfirmationListProps, MoneyRequestConfirmationListOnyxProps>({
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
    policyCategoriesDraft: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`,
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
        selector: (policy: OnyxEntry<OnyxTypes.Policy>) => DistanceRequestUtils.getMileageRates(policy),
    },
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    },
    policyDraft: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`,
    },
    lastSelectedDistanceRates: {
        key: ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
    },
    currencyList: {
        key: ONYXKEYS.CURRENCY_LIST,
    },
})(
    memo(
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
            prevProps.iouComment === nextProps.iouComment &&
            prevProps.receiptFilename === nextProps.receiptFilename &&
            prevProps.iouCreated === nextProps.iouCreated &&
            prevProps.iouIsBillable === nextProps.iouIsBillable &&
            prevProps.onToggleBillable === nextProps.onToggleBillable &&
            prevProps.hasSmartScanFailed === nextProps.hasSmartScanFailed &&
            prevProps.reportActionID === nextProps.reportActionID &&
            lodashIsEqual(prevProps.defaultMileageRate, nextProps.defaultMileageRate) &&
            lodashIsEqual(prevProps.lastSelectedDistanceRates, nextProps.lastSelectedDistanceRates) &&
            lodashIsEqual(prevProps.action, nextProps.action) &&
            lodashIsEqual(prevProps.currencyList, nextProps.currencyList) &&
            prevProps.shouldDisplayReceipt === nextProps.shouldDisplayReceipt,
    ),
);
