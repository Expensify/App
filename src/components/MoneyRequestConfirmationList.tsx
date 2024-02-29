import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useReducer, useState} from 'react';
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
        selectedParticipants: Participant[];

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
        reportID?: string;

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
        reportActionID?: string;

        /** Transaction object */
        transaction?: OnyxTypes.Transaction;
    };

function MoneyRequestConfirmationList({
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
    selectedParticipants,
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
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.SEND;

    const isSplitWithScan = isSplitBill && isScanRequest;

    const distance = transaction?.routes?.route0.distance ?? 0;
    const shouldCalculateDistanceAmount = isDistanceRequest && iouAmount === 0;
    const taxRates = policy?.taxRates;

    // A flag for showing the categories field
    const shouldShowCategories = isPolicyExpenseChat && (iouCategory || OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));

    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    // Do not hide fields in case of send money request
    const shouldShowAllFields = isDistanceRequest || shouldExpandFields || !shouldShowSmartScanFields || isTypeSend || isEditingSplitBill;

    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited. For distance requests, don't show the merchant as there's already another "Distance" menu item
    const shouldShowDate = shouldShowAllFields && !isTypeSend && !isSplitWithScan;
    const shouldShowMerchant = shouldShowAllFields && !isTypeSend && !isDistanceRequest && !isSplitWithScan;
    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);
    // A flag for showing the tags field
    const shouldShowTags = isPolicyExpenseChat && (iouTag || OptionsListUtils.hasEnabledTags(policyTagLists));

    // A flag for showing tax fields - tax rate and tax amount
    const shouldShowTax = isPolicyExpenseChat && (policy?.tax?.trackingEnabled ?? policy?.isTaxTrackingEnabled);

    // A flag for showing the billable field
    const shouldShowBillable = !policy?.disabledFields?.defaultBillable ?? true;

    const hasRoute = TransactionUtils.hasRoute(transaction ?? null);
    const isDistanceRequestWithPendingRoute = isDistanceRequest && (!hasRoute || !mileageRate?.rate);
    const formattedAmount = isDistanceRequestWithPendingRoute
        ? ''
        : CurrencyUtils.convertToDisplayString(
              shouldCalculateDistanceAmount
                  ? DistanceRequestUtils.getDistanceRequestAmount(distance, mileageRate?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, mileageRate?.rate ?? 0)
                  : iouAmount,
              isDistanceRequest ? mileageRate?.currency : iouCurrencyCode,
          );
    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(transaction?.taxAmount, iouCurrencyCode);

    const defaultTaxKey = taxRates?.defaultExternalID;
    const defaultTaxName = (defaultTaxKey && `${taxRates?.taxes[defaultTaxKey].name} (${taxRates?.taxes[defaultTaxKey].value}) • ${translate('common.default')}`) ?? '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const taxRateTitle = transaction?.taxRate?.text || defaultTaxName;

    const isFocused = useIsFocused();
    const [formError, setFormError] = useState<TranslationPaths | null>(null);

    const [didConfirm, setDidConfirm] = useState(false);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const shouldDisplayFieldError = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (!!hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transaction ?? null)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transaction ?? null));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = !iouMerchant || iouMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const shouldDisplayMerchantError = isPolicyExpenseChat && !isScanRequest && isMerchantEmpty;

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
        setFormError(null);
    }, [isFocused, transaction, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount) {
            return;
        }

        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, mileageRate?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, mileageRate?.rate ?? 0);
        IOU.setMoneyRequestAmount(amount);
    }, [shouldCalculateDistanceAmount, distance, mileageRate?.rate, mileageRate?.unit]);

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
        if (isSplitBill && iouAmount === 0) {
            text = translate('iou.split');
        } else if (!!(receiptPath && isTypeRequest) || isDistanceRequestWithPendingRoute) {
            text = translate('iou.request');
            if (iouAmount !== 0) {
                text = translate('iou.requestAmount', {amount: formattedAmount});
            }
        } else {
            const translationKey = isSplitBill ? 'iou.splitAmount' : 'iou.requestAmount';
            text = translate(translationKey, {amount: formattedAmount});
        }
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: iouType,
            },
        ];
    }, [isSplitBill, iouAmount, receiptPath, isTypeRequest, isDistanceRequestWithPendingRoute, iouType, translate, formattedAmount]);

    const selectedParticipantsMemo = useMemo(() => selectedParticipants.filter((participant) => participant.selected), [selectedParticipants]);
    const payeePersonalDetailsMemo = useMemo(() => payeePersonalDetails ?? currentUserPersonalDetails, [payeePersonalDetails, currentUserPersonalDetails]);
    const canModifyParticipantsValue = !isReadOnly && canModifyParticipants && hasMultipleParticipants;

    const optionSelectorSections: CategorySection[] = useMemo(() => {
        const sections = [];
        const unselectedParticipants = selectedParticipants.filter((participant) => !participant.selected);
        if (hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipantsMemo);
            let formattedParticipantsList = [...new Set([...formattedSelectedParticipants, ...unselectedParticipants])];

            if (!canModifyParticipantsValue) {
                formattedParticipantsList = formattedParticipantsList.map((participant) => ({
                    ...participant,
                    isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID ?? -1),
                }));
            }

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipantsMemo.length, iouAmount, iouCurrencyCode ?? '', true);
            const formattedPayeeOption = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(
                payeePersonalDetailsMemo,
                iouAmount > 0 ? CurrencyUtils.convertToDisplayString(myIOUAmount, iouCurrencyCode) : '',
            );

            sections.push(
                {
                    title: translate('moneyRequestConfirmationList.paidBy'),
                    data: [formattedPayeeOption],
                    shouldShow: true,
                    indexOffset: 0,
                    isDisabled: canModifyParticipantsValue,
                },
                {
                    title: translate('moneyRequestConfirmationList.splitWith'),
                    data: formattedParticipantsList,
                    shouldShow: true,
                    indexOffset: 1,
                },
            );
        } else {
            const formattedSelectedParticipants = selectedParticipants.map((participant) => ({
                ...participant,
                isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID ?? -1),
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
        hasMultipleParticipants,
        iouAmount,
        iouCurrencyCode,
        getParticipantsWithAmount,
        payeePersonalDetailsMemo,
        translate,
        canModifyParticipantsValue,
        selectedParticipantsMemo,
    ]);

    const selectedOptions = useMemo(() => {
        if (!hasMultipleParticipants) {
            return [];
        }
        const myIOUAmount = IOUUtils.calculateAmount(selectedParticipantsMemo.length, iouAmount, iouCurrencyCode ?? '', true);
        return [
            ...selectedParticipantsMemo,
            OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetailsMemo, CurrencyUtils.convertToDisplayString(myIOUAmount, iouCurrencyCode)),
        ];
    }, [hasMultipleParticipants, selectedParticipantsMemo, iouAmount, iouCurrencyCode, payeePersonalDetailsMemo]);

    useEffect(() => {
        if (!isDistanceRequest) {
            return;
        }
        /*
         Set pending waypoints based on the route status. We should handle this dynamically to cover cases such as:
         When the user completes the initial steps of the IOU flow offline and then goes online on the confirmation page.
         In this scenario, the route will be fetched from the server, and the waypoints will no longer be pending.
        */
        IOU.setMoneyRequestPendingFields(transactionID ?? '', {waypoints: isDistanceRequestWithPendingRoute ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null});
        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(
            hasRoute,
            distance,
            mileageRate?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            mileageRate?.rate ?? 0,
            mileageRate?.currency ?? 'USD',
            translate,
            toLocaleDigit,
        );
        IOU.setMoneyRequestMerchant(transactionID ?? '', distanceMerchant, false);
    }, [hasRoute, distance, mileageRate?.unit, mileageRate?.rate, mileageRate?.currency, translate, toLocaleDigit, isDistanceRequest, transactionID, isDistanceRequestWithPendingRoute]);

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

    const confirm = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            if (selectedParticipantsMemo.length === 0) {
                return;
            }
            if (iouCategory && iouCategory.length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
                setFormError('iou.error.invalidCategoryLength');
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

                if (isEditingSplitBill && TransactionUtils.areRequiredFieldsEmpty(transaction ?? null)) {
                    setDidConfirmSplit(true);
                    return;
                }

                setDidConfirm(true);
                onConfirm(selectedParticipantsMemo);
            }
        },
        [
            selectedParticipantsMemo,
            iouCategory,
            iouType,
            onSendMoney,
            iouCurrencyCode,
            isDistanceRequest,
            isDistanceRequestWithPendingRoute,
            iouAmount,
            isEditingSplitBill,
            transaction,
            onConfirm,
        ],
    );

    const footerContent = useMemo(() => {
        if (isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = iouType === CONST.IOU.TYPE.SEND;
        const shouldDisableButton = selectedParticipantsMemo.length === 0 || shouldDisplayMerchantError;

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
                shouldShowPersonalBankAccountOption
                enterKeyEventListenerPriority={1}
            />
        ) : (
            <ButtonWithDropdownMenu
                pressOnEnter
                isDisabled={shouldDisableButton}
                // eslint-disable-next-line @typescript-eslint/naming-convention
                onPress={(_, value) => confirm(value as PaymentMethodType)}
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
    }, [
        isReadOnly,
        iouType,
        selectedParticipantsMemo.length,
        shouldDisplayMerchantError,
        confirm,
        bankAccountRoute,
        iouCurrencyCode,
        policyID,
        splitOrRequestOptions,
        formError,
        styles.ph1,
        styles.mb2,
    ]);

    const receiptData = receiptPath && receiptFilename ? ReceiptUtils.getThumbnailAndImageURIs(transaction ?? null, receiptPath, receiptFilename) : null;

    const imageSource = useMemo(() => {
        if (receiptData?.thumbnail) {
            return typeof receiptData.thumbnail === 'string' ? {uri: receiptData.thumbnail} : receiptData.thumbnail;
        }

        return typeof receiptData?.image === 'string' ? {uri: receiptData.image} : receiptData?.image;
    }, [receiptData?.thumbnail, receiptData?.image]);

    return (
        // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
        <OptionsSelector
            sections={optionSelectorSections}
            onSelectRow={canModifyParticipantsValue ? selectParticipant : navigateToReportOrUserDetail}
            onAddToSelection={selectParticipant}
            onConfirmSelection={confirm}
            selectedOptions={selectedOptions}
            canSelectMultipleOptions={canModifyParticipantsValue}
            disableArrowKeysActions={!canModifyParticipantsValue}
            boldStyle
            showTitleTooltip
            shouldTextInputAppearBelowOptions
            shouldShowTextInput={false}
            shouldUseStyleForChildren={false}
            optionHoveredStyle={canModifyParticipantsValue ? styles.hoveredComponentBG : {}}
            footerContent={(!!iou?.id || isEditingSplitBill) && footerContent}
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
                    source={imageSource}
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
                                ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                    CONST.IOU.ACTION.CREATE,
                                    iouType,
                                    transaction?.transactionID ?? '',
                                    reportID ?? '',
                                    Navigation.getActiveRouteWithoutParams(),
                                ),
                            )
                        }
                    />
                )
            )}
            {shouldShowSmartScanFields && (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!isReadOnly && !isDistanceRequest}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    interactive={!isReadOnly}
                    onPress={() => {
                        if (isDistanceRequest) {
                            return;
                        }
                        if (isEditingSplitBill) {
                            Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID ?? '', reportActionID ?? '', CONST.EDIT_REQUEST_FIELD.AMOUNT));
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_AMOUNT.getRoute(iouType, reportID));
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={
                        isPolicyExpenseChat && shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction ?? null) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                    }
                    error={
                        shouldDisplayMerchantError || (isPolicyExpenseChat && shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction ?? null))
                            ? translate('common.error.enterMerchant')
                            : ''
                    }
                />
            )}
            <MenuItemWithTopDescription
                shouldShowRightIcon={!isReadOnly}
                shouldParseTitle
                title={iouComment}
                description={translate('common.description')}
                onPress={() => {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(
                            CONST.IOU.ACTION.EDIT,
                            iouType,
                            transaction?.transactionID ?? '',
                            reportID ?? '',
                            Navigation.getActiveRouteWithoutParams(),
                        ),
                    );
                }}
                style={styles.moneyRequestMenuItem}
                titleStyle={styles.flex1}
                disabled={didConfirm}
                interactive={!isReadOnly}
                numberOfLinesTitle={2}
            />
            {!shouldShowAllFields && (
                <ShowMoreButton
                    containerStyle={[styles.mt1, styles.mb2]}
                    onPress={toggleShouldExpandFields}
                />
            )}
            {shouldShowAllFields && (
                <>
                    {shouldShowDate && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
                            title={iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                            description={translate('common.date')}
                            style={styles.moneyRequestMenuItem}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        transaction?.transactionID ?? '',
                                        reportID ?? '',
                                        Navigation.getActiveRouteWithoutParams(),
                                    ),
                                );
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction ?? null) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            error={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction ?? null) ? translate('common.error.enterDate') : ''}
                        />
                    )}
                    {isDistanceRequest && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly && isTypeRequest}
                            title={iouMerchant}
                            description={translate('common.distance')}
                            style={styles.moneyRequestMenuItem}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_DISTANCE.getRoute(iouType, reportID))}
                            disabled={didConfirm || !isTypeRequest}
                            interactive={!isReadOnly}
                        />
                    )}
                    {shouldShowMerchant && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={isMerchantEmpty ? '' : iouMerchant}
                            description={translate('common.merchant')}
                            style={styles.moneyRequestMenuItem}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        transactionID ?? '',
                                        reportID ?? '',
                                        Navigation.getActiveRouteWithoutParams(),
                                    ),
                                );
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction ?? null) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            error={
                                shouldDisplayMerchantError || (shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction ?? null))
                                    ? translate('common.error.enterMerchant')
                                    : ''
                            }
                        />
                    )}
                    {shouldShowCategories && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={iouCategory}
                            description={translate('common.category')}
                            numberOfLinesTitle={2}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        iouType,
                                        transaction?.transactionID ?? '',
                                        reportID ?? '',
                                        Navigation.getActiveRouteWithoutParams(),
                                    ),
                                );
                            }}
                            style={styles.moneyRequestMenuItem}
                            titleStyle={styles.flex1}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            rightLabel={canUseViolations && Boolean(policy?.requiresCategory) ? translate('common.required') : ''}
                        />
                    )}
                    {shouldShowTags &&
                        policyTagLists.map(({name}, index) => (
                            <MenuItemWithTopDescription
                                key={name}
                                shouldShowRightIcon={!isReadOnly}
                                title={TransactionUtils.getTag(transaction ?? null, index)}
                                description={name}
                                numberOfLinesTitle={2}
                                onPress={() => {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(
                                            CONST.IOU.ACTION.EDIT,
                                            CONST.IOU.TYPE.SPLIT,
                                            index,
                                            transaction?.transactionID ?? '',
                                            reportID ?? '',
                                            Navigation.getActiveRouteWithoutParams(),
                                        ),
                                    );
                                }}
                                style={styles.moneyRequestMenuItem}
                                disabled={didConfirm}
                                interactive={!isReadOnly}
                                rightLabel={canUseViolations && !!policy?.requiresTag ? translate('common.required') : ''}
                            />
                        ))}

                    {shouldShowTax && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={taxRateTitle}
                            description={taxRates?.name}
                            style={styles.moneyRequestMenuItem}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(iouType, transaction?.transactionID ?? '', reportID ?? '', Navigation.getActiveRouteWithoutParams()),
                                )
                            }
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                        />
                    )}

                    {shouldShowTax && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={formattedTaxAmount}
                            description={taxRates?.name}
                            style={styles.moneyRequestMenuItem}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(iouType, transaction?.transactionID ?? '', reportID ?? '', Navigation.getActiveRouteWithoutParams()),
                                )
                            }
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                        />
                    )}

                    {shouldShowBillable && (
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                            <Text color={!iouIsBillable ? theme.textSupporting : undefined}>{translate('common.billable')}</Text>
                            <Switch
                                accessibilityLabel={translate('common.billable')}
                                isOn={iouIsBillable}
                                onToggle={onToggleBillable}
                            />
                        </View>
                    )}
                </>
            )}
        </OptionsSelector>
    );
}

MoneyRequestConfirmationList.displayName = 'MoneyRequestConfirmationList';

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
    })(MoneyRequestConfirmationList),
);
