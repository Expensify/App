import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import Str from 'expensify-common/lib/str';
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {DefaultMileageRate} from '@libs/DistanceRequestUtils';
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
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmedRoute from './ConfirmedRoute';
import ConfirmModal from './ConfirmModal';
import FormHelpMessage from './FormHelpMessage';
import * as Expensicons from './Icon/Expensicons';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import OptionsSelector from './OptionsSelector';
import PDFThumbnail from './PDFThumbnail';
import ReceiptEmptyState from './ReceiptEmptyState';
import ReceiptImage from './ReceiptImage';
import SettlementButton from './SettlementButton';
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

    /** Unit and rate used for if the money request is a distance request */
    mileageRate: OnyxEntry<DefaultMileageRate>;
};

type MoneyRequestConfirmationListProps = MoneyRequestConfirmationListOnyxProps & {
    /** Callback to inform parent modal of success */
    onConfirm?: (selectedParticipants: Participant[]) => void;

    /** Callback to parent modal to send money */
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
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;

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

    /** Payee of the money request with login */
    payeePersonalDetails?: OnyxTypes.PersonalDetails;

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

    /** Transaction that represents the money request */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the money request is a distance request */
    isDistanceRequest?: boolean;

    /** Whether the money request is a scan request */
    isScanRequest?: boolean;

    /** Whether we're editing a split bill */
    isEditingSplitBill?: boolean;

    /** Whether we should show the amount, date, and merchant fields. */
    shouldShowSmartScanFields?: boolean;

    /** A flag for verifying that the current report is a sub-report of a workspace chat */
    isPolicyExpenseChat?: boolean;

    /** Whether smart scan failed */
    hasSmartScanFailed?: boolean;

    reportActionID?: string;

    action?: ValueOf<typeof CONST.IOU.ACTION>;
};

const getTaxAmount = (transaction: OnyxEntry<OnyxTypes.Transaction>, defaultTaxValue: string) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const percentage = (transaction?.taxRate ? transaction?.taxRate?.data?.value : defaultTaxValue) || '';
    return TransactionUtils.calculateTaxAmount(percentage, transaction?.amount ?? 0);
};

function MoneyTemporaryForRefactorRequestConfirmationList({
    transaction = null,
    onSendMoney,
    onConfirm,
    onSelectParticipant,
    iouType = CONST.IOU.TYPE.REQUEST,
    isScanRequest = false,
    iouAmount,
    policyCategories,
    mileageRate,
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
    selectedParticipants: pickedParticipants,
    payeePersonalDetails,
    canModifyParticipants = false,
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
    action = CONST.IOU.ACTION.CREATE,
}: MoneyRequestConfirmationListProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {canUseViolations} = usePermissions();

    const isTypeRequest = iouType === CONST.IOU.TYPE.REQUEST;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.SEND;
    const isTypeTrackExpense = iouType === CONST.IOU.TYPE.TRACK_EXPENSE;

    const {unit, rate, currency} = mileageRate ?? {
        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
        rate: 0,
        currency: 'USD',
    };
    const distance = transaction?.routes?.route0.distance ?? 0;
    const shouldCalculateDistanceAmount = isDistanceRequest && iouAmount === 0;
    const taxRates = policy?.taxRates;

    // A flag for showing the categories field
    const shouldShowCategories = isPolicyExpenseChat && (!!iouCategory || OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));

    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    // Do not hide fields in case of send money request
    const shouldShowAllFields = isDistanceRequest || shouldExpandFields || !shouldShowSmartScanFields || isTypeSend || isEditingSplitBill;

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
    const hasRoute = TransactionUtils.hasRoute(transaction);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate) && !isMovingTransactionFromTrackExpense;
    const formattedAmount = isDistanceRequestWithPendingRoute
        ? ''
        : CurrencyUtils.convertToDisplayString(
              shouldCalculateDistanceAmount ? DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate ?? 0) : iouAmount,
              isDistanceRequest ? currency : iouCurrencyCode,
          );
    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(transaction?.taxAmount, iouCurrencyCode);
    const taxRateTitle = taxRates && transaction ? TransactionUtils.getDefaultTaxName(taxRates, transaction) : '';

    const previousTransactionAmount = usePrevious(transaction?.amount);

    const isFocused = useIsFocused();
    const [formError, setFormError] = useState('');

    const [didConfirm, setDidConfirm] = useState(false);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const [merchantError, setMerchantError] = useState(false);

    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transaction?.transactionID ?? '', reportID));
    };

    const shouldDisplayFieldError: boolean = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (!!hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transaction)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transaction));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = !iouMerchant || iouMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isMerchantRequired = isPolicyExpenseChat && !isScanRequest && shouldShowMerchant;

    const isCategoryRequired = canUseViolations && !!policy?.requiresCategory;

    useEffect(() => {
        if ((!isMerchantRequired && isMerchantEmpty) || !merchantError) {
            return;
        }
        if (!isMerchantEmpty && merchantError) {
            setMerchantError(false);
            if (formError === 'iou.error.invalidMerchant') {
                setFormError('');
            }
        }
    }, [formError, isMerchantEmpty, merchantError, isMerchantRequired]);

    useEffect(() => {
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        if (merchantError) {
            setFormError('iou.error.invalidMerchant');
            return;
        }
        // reset the form error whenever the screen gains or loses focus
        setFormError('');
    }, [isFocused, transaction, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit, isMerchantRequired, merchantError]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount) {
            return;
        }

        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate ?? 0);
        IOU.setMoneyRequestAmount_temporaryForRefactor(transaction?.transactionID ?? '', amount, currency ?? '');
    }, [shouldCalculateDistanceAmount, distance, rate, unit, transaction, currency]);

    // Calculate and set tax amount in transaction draft
    useEffect(() => {
        const taxAmount = getTaxAmount(transaction, taxRates?.defaultValue ?? '').toString();
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(taxAmount));

        if (transaction?.taxAmount && previousTransactionAmount === transaction?.amount) {
            return IOU.setMoneyRequestTaxAmount(transaction?.transactionID, transaction?.taxAmount, true);
        }

        IOU.setMoneyRequestTaxAmount(transaction?.transactionID ?? '', amountInSmallestCurrencyUnits, true);
    }, [taxRates?.defaultValue, transaction, previousTransactionAmount]);

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

    // If completing a split bill fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    const splitOrRequestOptions: Array<DropdownOption<string>> = useMemo(() => {
        let text;
        if (isTypeTrackExpense) {
            text = translate('iou.trackExpense');
        } else if (isTypeSplit && iouAmount === 0) {
            text = translate('iou.split');
        } else if ((receiptPath && isTypeRequest) || isDistanceRequestWithPendingRoute) {
            text = translate('iou.request');
            if (iouAmount !== 0) {
                text = translate('iou.requestAmount', {amount: formattedAmount});
            }
        } else {
            const translationKey = isTypeSplit ? 'iou.splitAmount' : 'iou.requestAmount';
            text = translate(translationKey, {amount: formattedAmount});
        }
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: iouType,
            },
        ];
    }, [isTypeTrackExpense, isTypeSplit, iouAmount, receiptPath, isTypeRequest, isDistanceRequestWithPendingRoute, iouType, translate, formattedAmount]);

    const selectedParticipants = useMemo(() => pickedParticipants.filter((participant) => participant.selected), [pickedParticipants]);
    const personalDetailsOfPayee = useMemo(() => payeePersonalDetails ?? currentUserPersonalDetails, [payeePersonalDetails, currentUserPersonalDetails]);
    const userCanModifyParticipants = useRef(!isReadOnly && canModifyParticipants && hasMultipleParticipants);
    useEffect(() => {
        userCanModifyParticipants.current = !isReadOnly && canModifyParticipants && hasMultipleParticipants;
    }, [isReadOnly, canModifyParticipants, hasMultipleParticipants]);
    const shouldDisablePaidBySection = userCanModifyParticipants.current;

    const optionSelectorSections = useMemo(() => {
        const sections = [];
        const unselectedParticipants = pickedParticipants.filter((participant) => !participant.selected);
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
                personalDetailsOfPayee,
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
        pickedParticipants,
        hasMultipleParticipants,
        iouAmount,
        iouCurrencyCode,
        getParticipantsWithAmount,
        personalDetailsOfPayee,
        translate,
        shouldDisablePaidBySection,
        canModifyParticipants,
    ]);

    const selectedOptions = useMemo(() => {
        if (!hasMultipleParticipants) {
            return [];
        }
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetailsOfPayee)];
    }, [selectedParticipants, hasMultipleParticipants, personalDetailsOfPayee]);

    useEffect(() => {
        if (!isDistanceRequest || isMovingTransactionFromTrackExpense) {
            return;
        }

        /*
         Set pending waypoints based on the route status. We should handle this dynamically to cover cases such as:
         When the user completes the initial steps of the IOU flow offline and then goes online on the confirmation page.
         In this scenario, the route will be fetched from the server, and the waypoints will no longer be pending.
        */
        IOU.setMoneyRequestPendingFields(transaction?.transactionID ?? '', {waypoints: isDistanceRequestWithPendingRoute ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null});

        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate ?? 0, currency ?? 'USD', translate, toLocaleDigit);
        IOU.setMoneyRequestMerchant(transaction?.transactionID ?? '', distanceMerchant, true);
    }, [isDistanceRequestWithPendingRoute, hasRoute, distance, unit, rate, currency, translate, toLocaleDigit, isDistanceRequest, transaction, action, isMovingTransactionFromTrackExpense]);

    // Auto select the category if there is only one enabled category and it is required
    useEffect(() => {
        const enabledCategories = Object.values(policyCategories ?? {}).filter((category) => category.enabled);
        if (iouCategory || !shouldShowCategories || enabledCategories.length !== 1 || !isCategoryRequired) {
            return;
        }
        IOU.setMoneyRequestCategory(transaction?.transactionID ?? '', enabledCategories[0].name);
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
            IOU.setMoneyRequestTag(transaction?.transactionID ?? '', updatedTagsString);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyTagLists, policyTags, canUseViolations]);

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
            if ((isMerchantRequired && isMerchantEmpty) || (shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction ?? null))) {
                setMerchantError(true);
                return;
            }

            if (iouType === CONST.IOU.TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                setDidConfirm(true);

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney?.(paymentMethod);
            } else {
                // validate the amount for distance requests
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

        const shouldShowSettlementButton = iouType === CONST.IOU.TYPE.SEND;
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
                        if (isEditingSplitBill) {
                            Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID ?? '', CONST.EDIT_REQUEST_FIELD.AMOUNT));
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()));
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
                            ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()),
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
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()),
                        )
                    }
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    disabled={didConfirm}
                    // todo: handle edit for transaction while moving from track expense
                    interactive={!isReadOnly && !isMovingTransactionFromTrackExpense}
                />
            ),
            shouldShow: isDistanceRequest,
            isSupplementary: true,
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
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()),
                        );
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={merchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    error={merchantError ? translate('common.error.fieldRequired') : ''}
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
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()));
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
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()),
                        )
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
                                ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, index, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()),
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
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()),
                        )
                    }
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
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(action, iouType, transaction?.transactionID ?? '', reportID, Navigation.getActiveRouteWithoutParams()),
                        )
                    }
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
                    previewSourceURL={resolvedThumbnail as string}
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
                    // but we don't need it to load the blob:// or file:// image when starting a money request / split bill
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
            onSelectRow={userCanModifyParticipants.current ? selectParticipant : navigateToReportOrUserDetail}
            onAddToSelection={selectParticipant}
            onConfirmSelection={confirm}
            selectedOptions={selectedOptions}
            canSelectMultipleOptions={userCanModifyParticipants.current}
            disableArrowKeysActions={!userCanModifyParticipants.current}
            boldStyle
            showTitleTooltip
            shouldTextInputAppearBelowOptions
            shouldShowTextInput={false}
            shouldUseStyleForChildren={false}
            optionHoveredStyle={userCanModifyParticipants.current ? styles.hoveredComponentBG : {}}
            footerContent={!isEditingSplitBill && footerContent}
            listStyles={listStyles}
            shouldAllowScrollingChildren
        >
            {isDistanceRequest && (
                <View style={styles.confirmationListMapItem}>
                    <ConfirmedRoute transaction={transaction ?? ({} as OnyxTypes.Transaction)} />
                </View>
            )}
            {(!isMovingTransactionFromTrackExpense || !hasRoute) &&
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (receiptImage || receiptThumbnail
                    ? receiptThumbnailContent
                    : // The empty receipt component should only show for IOU Requests of a paid policy ("Team" or "Corporate")
                      PolicyUtils.isPaidGroupPolicy(policy) &&
                      !isDistanceRequest &&
                      iouType === CONST.IOU.TYPE.REQUEST && (
                          <ReceiptEmptyState
                              onPress={() =>
                                  Navigation.navigate(
                                      ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                          CONST.IOU.ACTION.CREATE,
                                          iouType,
                                          transaction?.transactionID ?? '',
                                          reportID,
                                          Navigation.getActiveRouteWithoutParams(),
                                      ),
                                  )
                              }
                          />
                      ))}
            {primaryFields}
            {!shouldShowAllFields && (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.mh3, styles.alignItemsCenter, styles.mb2, styles.mt1]}>
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.mr0]} />
                    <Button
                        small
                        onPress={toggleShouldExpandFields}
                        text={translate('common.showMore')}
                        shouldShowRightIcon
                        iconRight={Expensicons.DownArrow}
                        iconFill={theme.icon}
                        style={styles.mh0}
                    />
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.ml0]} />
                </View>
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

MoneyTemporaryForRefactorRequestConfirmationList.displayName = 'MoneyTemporaryForRefactorRequestConfirmationList';

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
    mileageRate: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        selector: DistanceRequestUtils.getDefaultMileageRate,
    },
    policy: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    },
})(MoneyTemporaryForRefactorRequestConfirmationList);
