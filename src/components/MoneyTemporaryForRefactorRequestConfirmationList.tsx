import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Log from '@libs/Log';
import playSound, {SOUNDS} from '@libs/Sound';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {MileageRate} from '@src/types/onyx/Policy';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import ConfirmedRoute from './ConfirmedRoute';
import FormHelpMessage from './FormHelpMessage';
import Image from './Image';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import OptionsSelector from './OptionsSelector';
import ReceiptEmptyState from './ReceiptEmptyState';
import SettlementButton from './SettlementButton';
import ShowMoreButton from './ShowMoreButton';
import Switch from './Switch';
import Text from './Text';
import type {WithCurrentUserPersonalDetailsProps} from './withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from './withCurrentUserPersonalDetails';
import Button from './Button';

type DropdownOption = {
    text: string;
    value: DeepValueOf<typeof CONST.IOU.TYPE>;
};

type Option = Partial<ReportUtils.OptionData>;

type CategorySection = {
    title: string | undefined;
    shouldShow: boolean;
    indexOffset: number;
    data: Option[];
};

type MoneyRequestConfirmationListOnyxProps = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: OnyxEntry<OnyxTypes.IOU>;

    /** Unit and rate used for if the money request is a distance request */
    mileageRate: OnyxEntry<MileageRate>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;

    /** The policy of root parent report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The session of the logged in user */
    session: OnyxEntry<OnyxTypes.Session>;
};

type MoneyRequestConfirmationListProps = MoneyRequestConfirmationListOnyxProps &
    WithCurrentUserPersonalDetailsProps & {
        /** Callback to inform parent modal of success */
        onConfirm?: (selectedParticipants: Participant[]) => void;

        /** Callback to parent modal to send money */
        onSendMoney?: (paymentMethod: PaymentMethodType) => void;

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

        /** IOU Tag */
        iouTag?: string;

        /** IOU isBillable */
        iouIsBillable?: boolean;

        /** Callback to toggle the billable state */
        onToggleBillable?: () => void;

        /** Selected participants from MoneyRequestModal with login / accountID */
        pickedParticipants: Participant[];

        /** Payee of the money request with login */
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
        reportID: string;

        /** File path of the receipt */
        receiptPath?: string;

        /** File name of the receipt */
        receiptFilename?: string;

        /** List styles for OptionsSelector */
        listStyles?: StyleProp<ViewStyle>;

        /** ID of the transaction that represents the money request */
        transactionID?: string;

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

        /** Whether there is smartscan failed */
        hasSmartScanFailed?: boolean;

        /** ID of the report action  */
        reportActionID: string;

        /** Transaction object */
        transaction: OnyxTypes.Transaction;
    };

function MoneyTemporaryForRefactorRequestConfirmationList({
    onConfirm = () => {},
    onSendMoney = () => {},
    onSelectParticipant = () => {},
    iouType = CONST.IOU.TYPE.REQUEST,
    iouCategory = '',
    iouTag = '',
    iouIsBillable = false,
    onToggleBillable = () => {},
    payeePersonalDetails,
    canModifyParticipants = false,
    isReadOnly = false,
    bankAccountRoute,
    policyID,
    reportID,
    receiptPath,
    receiptFilename,
    transactionID,
    mileageRate,
    isDistanceRequest = false,
    isScanRequest = false,
    shouldShowSmartScanFields = true,
    isPolicyExpenseChat = false,
    transaction,
    iouAmount,
    policyTags,
    policyCategories,
    policy,
    iouCurrencyCode,
    isEditingSplitBill,
    hasSmartScanFailed,
    iouMerchant,
    currentUserPersonalDetails,
    hasMultipleParticipants,
    pickedParticipants,
    session,
    iou,
    reportActionID,
    iouCreated,
    listStyles,
    iouComment,
}: MoneyRequestConfirmationListProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const {canUseViolations} = usePermissions();

    const isTypeRequest = iouType === CONST.IOU.TYPE.REQUEST;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.SEND;

    const {unit, rate, currency} = mileageRate;
    const distance = transaction?.routes?.route0.distance ?? 0;
    const shouldCalculateDistanceAmount = isDistanceRequest && iouAmount === 0;
    const taxRates = policy?.taxRates ?? null;

    // A flag for showing the categories field
    const shouldShowCategories = isPolicyExpenseChat && (iouCategory || OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));


    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    // Do not hide fields in case of send money request
    const shouldShowAllFields = isDistanceRequest || shouldExpandFields || !shouldShowSmartScanFields || isTypeSend || isEditingSplitBill;

    const shouldShowDate = shouldShowSmartScanFields || isDistanceRequest;
    const shouldShowMerchant = shouldShowSmartScanFields && !isDistanceRequest;

    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);

    // A flag for showing the tags field
    const shouldShowTags = useMemo(() => isPolicyExpenseChat && OptionsListUtils.hasEnabledTags(policyTagLists), [isPolicyExpenseChat, policyTagLists]);

    // A flag for showing tax rate
    const shouldShowTax = isPolicyExpenseChat && (policy?.tax?.trackingEnabled ?? policy?.isTaxTrackingEnabled);

    // A flag for showing the billable field
    const shouldShowBillable = !policy?.disabledFields?.defaultBillable ?? true;

    const hasRoute = TransactionUtils.hasRoute(transaction);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !rate);
    const formattedAmount = isDistanceRequestWithPendingRoute
        ? ''
        : CurrencyUtils.convertToDisplayString(
              shouldCalculateDistanceAmount ? DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate) : iouAmount,
              isDistanceRequest ? currency : iouCurrencyCode,
          );
    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(transaction?.taxAmount, iouCurrencyCode);

    const defaultTaxKey = taxRates?.defaultExternalID;
    const defaultTaxName = (defaultTaxKey && `${taxRates.taxes[defaultTaxKey].name} (${taxRates.taxes[defaultTaxKey].value}) • ${translate('common.default')}`) || '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const taxRateTitle = (transaction?.taxRate?.text) || defaultTaxName;

    const isFocused = useIsFocused();
    const [formError, setFormError] = useState('');

    const [didConfirm, setDidConfirm] = useState(false);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const [merchantError, setMerchantError] = useState(false);

    const shouldDisplayFieldError = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (!!hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transaction ?? null)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transaction ?? null));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = !iouMerchant || iouMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isMerchantRequired = isPolicyExpenseChat && !isScanRequest && shouldShowMerchant;

    const isCategoryRequired = canUseViolations && (policy?.requiresCategory ?? false);
    const isTagRequired = canUseViolations && (policy?.requiresTag ?? false);

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

        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate);
        IOU.setMoneyRequestAmount_temporaryForRefactor(transaction?.transactionID, amount, currency);
    }, [shouldCalculateDistanceAmount, distance, rate, unit, transaction, currency]);

    /**
     * Returns the participants with amount
     */
    const getParticipantsWithAmount = useCallback(
        (participantsList: Participant[]) => {
            const calculatedIouAmount = IOUUtils.calculateAmount(participantsList.length, iouAmount, iouCurrencyCode ?? '');
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(
                participantsList,
                calculatedIouAmount > 0 ? CurrencyUtils.convertToDisplayString(calculatedIouAmount, iouCurrencyCode) : '',
            );
        },
        [iouAmount, iouCurrencyCode],
    );

    // If completing a split bill fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    const splitOrRequestOptions: DropdownOption[] = useMemo(() => {
        let text;
        if (isTypeSplit && iouAmount === 0) {
            text = translate('iou.split');
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
    }, [isTypeSplit, isTypeRequest, iouType, iouAmount, receiptPath, formattedAmount, isDistanceRequestWithPendingRoute, translate]);

    const selectedParticipants = useMemo(() => pickedParticipants.filter((participant) => participant.selected), [pickedParticipants]);
    const personalDetailsOfPayee = useMemo(() => payeePersonalDetails ?? currentUserPersonalDetails, [payeePersonalDetails, currentUserPersonalDetails]);
    const userCanModifyParticipants = useRef(!isReadOnly && canModifyParticipants && hasMultipleParticipants);
    useEffect(() => {
        userCanModifyParticipants.current = !isReadOnly && canModifyParticipants && hasMultipleParticipants;
    }, [isReadOnly, canModifyParticipants, hasMultipleParticipants]);
    const shouldDisablePaidBySection = userCanModifyParticipants.current;

    const optionSelectorSections: CategorySection[] = useMemo(() => {
        const sections = [];
        cosnt unselectedParticipants = pickedParticipants.filter((participant) => !participant.selected);
        if (hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipants);
            let formattedParticipantsList = _.union(formattedSelectedParticipants, unselectedParticipants);

            if (!userCanModifyParticipants.current) {
                formattedParticipantsList = _.map(formattedParticipantsList, (participant) => ({
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
                    indexOffset: 0,
                    isDisabled: shouldDisablePaidBySection,
                },
                {
                    title: translate('moneyRequestConfirmationList.splitWith'),
                    data: formattedParticipantsList,
                    shouldShow: true,
                    indexOffset: 1,
                },
            );
        } else {
            const formattedSelectedParticipants = _.map(selectedParticipants, (participant) => ({
                ...participant,
                isDisabled: !participant.isPolicyExpenseChat && ReportUtils.isOptimisticPersonalDetail(participant.accountID),
            }));
            sections.push({
                title: translate('common.to'),
                data: formattedSelectedParticipants,
                shouldShow: true,
                indexOffset: 0,
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
        userCanModifyParticipants,
    ]);

    const selectedOptions = useMemo(() => {
        if (!hasMultipleParticipants) {
            return [];
        }
        return [
            ...selectedParticipants, 
            OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetailsOfPayee, CurrencyUtils.convertToDisplayString(myIOUAmount, iouCurrencyCode))
        ];
    }, [selectedParticipants, hasMultipleParticipants, personalDetailsOfPayee]);

    useEffect(() => {
        if (!isDistanceRequest) {
            return;
        }

        /*
         Set pending waypoints based on the route status. We should handle this dynamically to cover cases such as:
         When the user completes the initial steps of the IOU flow offline and then goes online on the confirmation page.
         In this scenario, the route will be fetched from the server, and the waypoints will no longer be pending.
        */
        IOU.setMoneyRequestPendingFields(transaction.transactionID, {waypoints: isDistanceRequestWithPendingRoute ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null});

        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate, currency, translate, toLocaleDigit);
        IOU.setMoneyRequestMerchant(transaction.transactionID, distanceMerchant, true);
    }, [isDistanceRequestWithPendingRoute, hasRoute, distance, unit, rate, currency, translate, toLocaleDigit, isDistanceRequest, transaction]);

    const selectParticipant = useCallback(
        (option: Participant) => {
            // Return early if selected option is currently logged in user.
            if (option.accountID === session?.accountID) {
                return;
            }
            onSelectParticipant(option);
        },
        [session?.accountID, onSelectParticipant],
    );

    /**
     * Navigate to report details or profile of selected user
     */
    const navigateToReportOrUserDetail = (option: Participant | OnyxTypes.Report) => {
        if ('accountID' in option && option.accountID) {
            const activeRoute = Navigation.getActiveRouteWithoutParams();

            Navigation.navigate(ROUTES.PROFILE.getRoute(option.accountID, activeRoute));
        } else if ('reportID' in option && option.reportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(option.reportID));
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
            if ((isMerchantRequired && isMerchantEmpty) || (shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction))) {
                setMerchantError(true);
                return;
            }

            if (iouType === CONST.IOU.TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                setDidConfirm(true);

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney(paymentMethod);
            } else {
                // validate the amount for distance requests
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

                playSound(SOUNDS.DONE);
                setDidConfirm(true);
                onConfirm(selectedParticipants);
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
                addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
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
                pressOnEnter
                isDisabled={shouldDisableButton}
                onPress={(_, value) => confirm(value as PaymentMethodType)}
                options={splitOrRequestOptions}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                enterKeyEventListenerPriority={1}
            />
        );

        return (
            <>
                {!_.isEmpty(formError) && (
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
                            Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID, CONST.EDIT_REQUEST_FIELD.AMOUNT));
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    error={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? translate('common.error.enterAmount') : ''}
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
                            ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
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
                    shouldShowRightIcon={!isReadOnly && isTypeRequest}
                    title={iouMerchant}
                    description={translate('common.distance')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm || !isTypeRequest}
                    interactive={!isReadOnly}
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
                            ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(CONST.IOU.ACTION.CREATE, iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
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
                    title={iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                    description={translate('common.date')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(CONST.IOU.ACTION.CREATE, iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
                        );
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
                            ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST.IOU.ACTION.CREATE, iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
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
            isSupplementary: !isCategoryRequired,
        },
        ..._.map(policyTagLists, ({name}, index) => ({
            item: (
                <MenuItemWithTopDescription
                    key={name}
                    shouldShowRightIcon={!isReadOnly}
                    title={TransactionUtils.getTagForDisplay(transaction, index)}
                    description={name}
                    numberOfLinesTitle={2}
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(CONST.IOU.ACTION.CREATE, iouType, index, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
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
        })),
        {
            item: (
                <MenuItemWithTopDescription
                    key={`${taxRates?.name}${taxRateTitle}`}
                    shouldShowRightIcon={!isReadOnly}
                    title={taxRateTitle}
                    description={taxRates?.name}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
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
                    description={taxRates?.name}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
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
                        onToggle={onToggleBillable}
                    />
                </View>
            ),
            shouldShow: shouldShowBillable,
            isSupplementary: true,
        },
    ];

    const primaryFields = _.map(
        _.filter(classifiedFields, (classifiedField) => classifiedField.shouldShow && !classifiedField.isSupplementary),
        (primaryField) => primaryField.item,
    );

    const supplementaryFields = _.map(
        _.filter(classifiedFields, (classifiedField) => classifiedField.shouldShow && classifiedField.isSupplementary),
        (supplementaryField) => supplementaryField.item,
    );

    const receiptData = receiptPath && receiptFilename ? ReceiptUtils.getThumbnailAndImageURIs(transaction ?? null, receiptPath, receiptFilename) : null;
    return (
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
                    <ConfirmedRoute transaction={transaction} />
                </View>
            )}
            {receiptData?.image ?? receiptData?.thumbnail ? (
                <Image
                    style={styles.moneyRequestImage}
                    source={{uri: receiptData?.thumbnail ?? receiptData?.image}}
                    // AuthToken is required when retrieving the image from the server
                    // but we don't need it to load the blob:// or file:// image when starting a money request / split bill
                    // So if we have a thumbnail, it means we're retrieving the image from the server
                    isAuthTokenRequired={!!receiptData.thumbnail}
                />
            ) : (
                // The empty receipt component should only show for IOU Requests of a paid policy ("Team" or "Corporate")
                PolicyUtils.isPaidGroupPolicy(policy) &&
                !isDistanceRequest &&
                iouType === CONST.IOU.TYPE.REQUEST && (
                    <ReceiptEmptyState
                        onPress={() =>
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
                            )
                        }
                    />
                )
            )}
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
        </OptionsSelector>
    );
}


MoneyTemporaryForRefactorRequestConfirmationList.displayName = 'MoneyTemporaryForRefactorRequestConfirmationList';


export default withCurrentUserPersonalDetails(
    withOnyx<MoneyRequestConfirmationListProps, MoneyRequestConfirmationListOnyxProps>({
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
        iou: {
            key: ONYXKEYS.IOU,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(MoneyTemporaryForRefactorRequestConfirmationList),
);