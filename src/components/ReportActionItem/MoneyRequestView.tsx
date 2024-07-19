import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSession} from '@components/OnyxProvider';
import ReceiptAudit, {ReceiptAuditMessages} from '@components/ReceiptAudit';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useViolations from '@hooks/useViolations';
import type {ViolationField} from '@hooks/useViolations';
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {isTaxTrackingEnabled} from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import * as IOU from '@userActions/IOU';
import * as Link from '@userActions/Link';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import * as Report from '@src/libs/actions/Report';
import * as ReportActions from '@src/libs/actions/ReportActions';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';
import ReportActionItemImage from './ReportActionItemImage';

type MoneyRequestViewTransactionOnyxProps = {
    /** The transaction associated with the transactionThread */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Violations detected in this transaction */
    transactionViolations: OnyxEntry<OnyxTypes.TransactionViolations>;
};

type MoneyRequestViewOnyxPropsWithoutTransaction = {
    /** The policy object for the current route */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>;

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: OnyxEntry<OnyxTypes.Report>;

    /** The actions from the parent report */
    parentReportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** The distance rates from the policy */
    distanceRates: Record<string, MileageRate>;
};

type MoneyRequestViewPropsWithoutTransaction = MoneyRequestViewOnyxPropsWithoutTransaction & {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Whether we should display the animated banner above the component */
    shouldShowAnimatedBackground: boolean;

    /** Whether we should show Money Request with disabled all fields */
    readonly?: boolean;

    /** Updated transaction to show in duplicate transaction flow  */
    updatedTransaction?: OnyxEntry<OnyxTypes.Transaction>;
};

type MoneyRequestViewProps = MoneyRequestViewTransactionOnyxProps & MoneyRequestViewPropsWithoutTransaction;

const deleteTransaction = (parentReport: OnyxEntry<OnyxTypes.Report>, parentReportAction: OnyxEntry<OnyxTypes.ReportAction>) => {
    if (!parentReportAction) {
        return;
    }
    const iouTransactionID = ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID ?? '-1' : '-1';
    if (ReportActionsUtils.isTrackExpenseAction(parentReportAction)) {
        IOU.deleteTrackExpense(parentReport?.reportID ?? '-1', iouTransactionID, parentReportAction, true);
        return;
    }
    IOU.deleteMoneyRequest(iouTransactionID, parentReportAction, true);
};

function MoneyRequestView({
    report,
    parentReport,
    parentReportActions,
    policyCategories,
    transaction,
    policyTagList,
    policy,
    transactionViolations,
    shouldShowAnimatedBackground,
    distanceRates,
    readonly = false,
    updatedTransaction,
}: MoneyRequestViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const session = useSession();
    const {isOffline} = useNetwork();
    const {translate, toLocaleDigit} = useLocalize();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.parentReportID}`, {
        selector: (chatReportValue) => chatReportValue && {reportID: chatReportValue.reportID, errorFields: chatReportValue.errorFields},
    });

    const parentReportAction = parentReportActions?.[report?.parentReportActionID ?? '-1'];
    const isTrackExpense = ReportUtils.isTrackExpenseReport(report);
    const {canUseViolations, canUseP2PDistanceRequests} = usePermissions(isTrackExpense ? CONST.IOU.TYPE.TRACK : undefined);
    const moneyRequestReport = parentReport;
    const {
        created: transactionDate,
        amount: transactionAmount,
        taxAmount: transactionTaxAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        billable: transactionBillable,
        category: transactionCategory,
        tag: transactionTag,
        originalAmount: transactionOriginalAmount,
        originalCurrency: transactionOriginalCurrency,
        cardID: transactionCardID,
    } = useMemo<Partial<TransactionDetails>>(() => ReportUtils.getTransactionDetails(transaction) ?? {}, [transaction]);
    const isEmptyMerchant = transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const formattedTransactionAmount = transactionAmount ? CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency) : '';
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && CurrencyUtils.convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const cardProgramName = isCardTransaction && transactionCardID !== undefined ? CardUtils.getCardDescription(transactionCardID) : '';
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isInvoice = ReportUtils.isInvoiceReport(moneyRequestReport);
    const isPaidReport = ReportActionsUtils.isPayAction(parentReportAction);
    const taxRates = policy?.taxRates;

    const formattedTaxAmount = updatedTransaction?.taxAmount
        ? CurrencyUtils.convertToDisplayString(updatedTransaction?.taxAmount, transactionCurrency)
        : CurrencyUtils.convertToDisplayString(transactionTaxAmount, transactionCurrency);

    const taxRatesDescription = taxRates?.name;
    const taxRateTitle = updatedTransaction ? TransactionUtils.getTaxName(policy, updatedTransaction) : TransactionUtils.getTaxName(policy, transaction);

    // Flags for allowing or disallowing editing an expense
    const isSettled = ReportUtils.isSettled(moneyRequestReport?.reportID);
    const isCancelled = moneyRequestReport && moneyRequestReport?.isCancelledIOU;

    // Used for non-restricted fields such as: description, category, tag, billable, etc.
    const canEdit = ReportActionsUtils.isMoneyRequestAction(parentReportAction) && ReportUtils.canEditMoneyRequest(parentReportAction);
    const canEditTaxFields = canEdit && !isDistanceRequest;

    const canEditAmount = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT);
    const canEditMerchant = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.MERCHANT);
    const canEditDate = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE);
    const canEditReceipt = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    const isReceiptBeingScanned = hasReceipt && TransactionUtils.isReceiptBeingScanned(transaction);
    const didReceiptScanSucceed = hasReceipt && TransactionUtils.didReceiptScanSucceed(transaction);
    const canEditDistance = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE);

    const isAdmin = policy?.role === 'admin';
    const isApprover = ReportUtils.isMoneyRequestReport(moneyRequestReport) && moneyRequestReport?.managerID !== null && session?.accountID === moneyRequestReport?.managerID;
    // A flag for verifying that the current report is a sub-report of a workspace chat
    // if the policy of the report is either Collect or Control, then this report must be tied to workspace chat
    const isPolicyExpenseChat = ReportUtils.isReportInGroupPolicy(report);

    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTagList), [policyTagList]);

    const iouType = isTrackExpense ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowCategory = isPolicyExpenseChat && (transactionCategory || OptionsListUtils.hasEnabledOptions(policyCategories ?? {}));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledTags(policyTagLists));
    const shouldShowBillable = isPolicyExpenseChat && (!!transactionBillable || !(policy?.disabledFields?.defaultBillable ?? true));

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest);
    const tripID = ReportUtils.getTripIDFromTransactionParentReport(parentReport);
    const shouldShowViewTripDetails = TransactionUtils.hasReservationList(transaction) && !!tripID;

    const {getViolationsForField} = useViolations(transactionViolations ?? [], isReceiptBeingScanned || !ReportUtils.isPaidGroupPolicy(report));
    const hasViolations = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string): boolean =>
            !!canUseViolations && getViolationsForField(field, data, policyHasDependentTags, tagValue).length > 0,
        [canUseViolations, getViolationsForField],
    );

    let amountDescription = `${translate('iou.amount')}`;

    const hasRoute = TransactionUtils.hasRoute(transaction, isDistanceRequest);
    const rateID = transaction?.comment.customUnit?.customUnitRateID ?? '-1';

    const currency = policy ? policy.outputCurrency : PolicyUtils.getPersonalPolicy()?.outputCurrency ?? CONST.CURRENCY.USD;

    const mileageRate = TransactionUtils.isCustomUnitRateIDForP2P(transaction) ? DistanceRequestUtils.getRateForP2P(currency) : distanceRates[rateID] ?? {};
    const {unit} = mileageRate;
    const rate = transaction?.comment?.customUnit?.defaultP2PRate ?? mileageRate.rate;

    const distance = DistanceRequestUtils.convertToDistanceInMeters(TransactionUtils.getDistance(transaction), unit);
    const rateToDisplay = DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate);
    let merchantTitle = isEmptyMerchant ? '' : transactionMerchant;
    let amountTitle = formattedTransactionAmount ? formattedTransactionAmount.toString() : '';
    if (TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction)) {
        merchantTitle = translate('iou.receiptStatusTitle');
        amountTitle = translate('iou.receiptStatusTitle');
    }

    const saveBillable = useCallback(
        (newBillable: boolean) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newBillable === TransactionUtils.getBillable(transaction)) {
                return;
            }
            IOU.updateMoneyRequestBillable(transaction?.transactionID ?? '-1', report?.reportID ?? '-1', newBillable, policy, policyTagList, policyCategories);
        },
        [transaction, report, policy, policyTagList, policyCategories],
    );

    if (isCardTransaction) {
        if (formattedOriginalAmount) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.original')} ${formattedOriginalAmount}`;
        }
        if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        }
    } else {
        if (!isDistanceRequest) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.cash')}`;
        }
        if (isApproved) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (isSettled) {
            amountDescription += ` • ${translate('iou.settledExpensify')}`;
        }
    }

    let receiptURIs;
    const hasErrors = TransactionUtils.hasMissingSmartscanFields(transaction);
    if (hasReceipt) {
        receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction);
    }
    const pendingAction = transaction?.pendingAction;
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => transaction?.pendingFields?.[fieldPath] ?? pendingAction;

    const getErrorForField = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string) => {
            // Checks applied when creating a new expense
            // NOTE: receipt field can return multiple violations, so we need to handle it separately
            const fieldChecks: Partial<Record<ViolationField, {isError: boolean; translationPath: TranslationPaths}>> = {
                amount: {
                    isError: transactionAmount === 0,
                    translationPath: 'common.error.enterAmount',
                },
                merchant: {
                    isError: !isSettled && !isCancelled && isPolicyExpenseChat && isEmptyMerchant,
                    translationPath: 'common.error.enterMerchant',
                },
                date: {
                    isError: transactionDate === '',
                    translationPath: 'common.error.enterDate',
                },
            };

            const {isError, translationPath} = fieldChecks[field] ?? {};

            if (readonly) {
                return '';
            }

            // Return form errors if there are any
            if (hasErrors && isError && translationPath) {
                return translate(translationPath);
            }

            // Return violations if there are any
            if (hasViolations(field, data, policyHasDependentTags, tagValue)) {
                const violations = getViolationsForField(field, data, policyHasDependentTags, tagValue);
                return ViolationsUtils.getViolationTranslation(violations[0], translate);
            }

            return '';
        },
        [transactionAmount, isSettled, isCancelled, isPolicyExpenseChat, isEmptyMerchant, transactionDate, readonly, hasErrors, hasViolations, translate, getViolationsForField],
    );

    const distanceRequestFields = canUseP2PDistanceRequests ? (
        <>
            <OfflineWithFeedback pendingAction={getPendingFieldAction('waypoints')}>
                <MenuItemWithTopDescription
                    description={translate('common.distance')}
                    title={getPendingFieldAction('waypoints') ? translate('iou.fieldPending') : distanceToDisplay}
                    interactive={canEditDistance}
                    shouldShowRightIcon={canEditDistance}
                    titleStyle={styles.flex1}
                    onPress={() =>
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'))
                    }
                />
            </OfflineWithFeedback>
            {/* TODO: correct the pending field action https://github.com/Expensify/App/issues/36987 */}
            <OfflineWithFeedback pendingAction={getPendingFieldAction('waypoints')}>
                <MenuItemWithTopDescription
                    description={translate('common.rate')}
                    title={rateToDisplay}
                    // TODO: https://github.com/Expensify/App/issues/36987 make it interactive and show right icon when EditRatePage is ready
                    interactive={false}
                    shouldShowRightIcon={false}
                    titleStyle={styles.flex1}
                    // TODO: https://github.com/Expensify/App/issues/36987 Add route for editing rate
                    onPress={() => {}}
                />
            </OfflineWithFeedback>
        </>
    ) : (
        <OfflineWithFeedback pendingAction={getPendingFieldAction('waypoints')}>
            <MenuItemWithTopDescription
                description={translate('common.distance')}
                title={transactionMerchant}
                interactive={canEditDistance}
                shouldShowRightIcon={canEditDistance}
                titleStyle={styles.flex1}
                onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'))}
            />
        </OfflineWithFeedback>
    );

    const isReceiptAllowed = !isPaidReport && !isInvoice;
    const shouldShowReceiptEmptyState =
        isReceiptAllowed && !hasReceipt && !isApproved && !isSettled && (canEditReceipt || isAdmin || isApprover) && (canEditReceipt || ReportUtils.isPaidGroupPolicy(report));
    const receiptViolationNames: OnyxTypes.ViolationName[] = [
        CONST.VIOLATIONS.RECEIPT_REQUIRED,
        CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
        CONST.VIOLATIONS.CASH_EXPENSE_WITH_NO_RECEIPT,
        CONST.VIOLATIONS.SMARTSCAN_FAILED,
    ];
    const receiptViolations =
        transactionViolations?.filter((violation) => receiptViolationNames.includes(violation.name)).map((violation) => ViolationsUtils.getViolationTranslation(violation, translate)) ?? [];

    // Whether to show receipt audit result (e.g.`Verified`, `Issue Found`) and messages (e.g. `Receipt not verified. Please confirm accuracy.`)
    // `!!(receiptViolations.length || didReceiptScanSucceed)` is for not showing `Verified` when `receiptViolations` is empty and `didReceiptScanSucceed` is false.
    const shouldShowAuditMessage =
        !isReceiptBeingScanned && hasReceipt && !!(receiptViolations.length || didReceiptScanSucceed) && !!canUseViolations && ReportUtils.isPaidGroupPolicy(report);
    const shouldShowReceiptAudit = isReceiptAllowed && (shouldShowReceiptEmptyState || hasReceipt);

    const errors = {
        ...(transaction?.errorFields?.route ?? transaction?.errors),
        ...parentReportAction?.errors,
    };

    const tagList = policyTagLists.map(({name, orderWeight}, index) => {
        const tagError = getErrorForField(
            'tag',
            {
                tagListIndex: index,
                tagListName: name,
            },
            PolicyUtils.hasDependentTags(policy, policyTagList),
            TransactionUtils.getTagForDisplay(updatedTransaction ?? transaction, index),
        );
        return (
            <OfflineWithFeedback
                key={name}
                pendingAction={getPendingFieldAction('tag')}
            >
                <MenuItemWithTopDescription
                    description={name ?? translate('common.tag')}
                    title={TransactionUtils.getTagForDisplay(updatedTransaction ?? transaction, index)}
                    interactive={canEdit && !readonly}
                    shouldShowRightIcon={canEdit}
                    titleStyle={styles.flex1}
                    onPress={() =>
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(CONST.IOU.ACTION.EDIT, iouType, orderWeight, transaction?.transactionID ?? '', report?.reportID ?? '-1'))
                    }
                    brickRoadIndicator={tagError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={tagError}
                />
            </OfflineWithFeedback>
        );
    });

    return (
        <View style={styles.pRelative}>
            {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
            <>
                {shouldShowReceiptAudit && (
                    <ReceiptAudit
                        notes={receiptViolations}
                        shouldShowAuditResult={shouldShowAuditMessage}
                    />
                )}
                {(hasReceipt || errors) && (
                    <OfflineWithFeedback
                        pendingAction={pendingAction}
                        errors={errors}
                        errorRowStyles={[styles.mh4]}
                        onClose={() => {
                            if (!transaction?.transactionID) {
                                return;
                            }

                            const isCreateChatErrored = !!report?.errorFields?.createChat;
                            if ((isCreateChatErrored || !!report?.isOptimisticReport) && parentReportAction) {
                                const urlToNavigateBack = IOU.cleanUpMoneyRequest(transaction.transactionID, parentReportAction, true);
                                Navigation.goBack(urlToNavigateBack);
                                return;
                            }

                            if (transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                                if (chatReport?.reportID && ReportUtils.getAddWorkspaceRoomOrChatReportErrors(chatReport)) {
                                    Report.navigateToConciergeChatAndDeleteReport(chatReport.reportID, true, true);
                                    return;
                                }
                                if (Object.values(transaction?.errors ?? {})?.find((error) => ErrorUtils.isReceiptError(error))) {
                                    deleteTransaction(parentReport, parentReportAction);
                                }
                            }
                            Transaction.clearError(transaction.transactionID);
                            ReportActions.clearAllRelatedReportActionErrors(report?.reportID ?? '-1', parentReportAction);
                        }}
                    >
                        {hasReceipt && (
                            <View style={styles.moneyRequestViewImage}>
                                <ReportActionItemImage
                                    thumbnail={receiptURIs?.thumbnail}
                                    fileExtension={receiptURIs?.fileExtension}
                                    isThumbnail={receiptURIs?.isThumbnail}
                                    image={receiptURIs?.image}
                                    isLocalFile={receiptURIs?.isLocalFile}
                                    filename={receiptURIs?.filename}
                                    transaction={transaction}
                                    enablePreviewModal
                                />
                            </View>
                        )}
                    </OfflineWithFeedback>
                )}
                {shouldShowReceiptEmptyState && (
                    <ReceiptEmptyState
                        hasError={hasErrors}
                        disabled={!canEditReceipt}
                        onPress={() =>
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                    CONST.IOU.ACTION.EDIT,
                                    iouType,
                                    transaction?.transactionID ?? '-1',
                                    report?.reportID ?? '-1',
                                    Navigation.getActiveRouteWithoutParams(),
                                ),
                            )
                        }
                    />
                )}
                {!shouldShowReceiptEmptyState && !hasReceipt && <View style={{marginVertical: 6}} />}
                {shouldShowAuditMessage && <ReceiptAuditMessages notes={receiptViolations} />}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('amount')}>
                    <MenuItemWithTopDescription
                        title={amountTitle}
                        shouldShowTitleIcon={isSettled}
                        titleIcon={Expensicons.Checkmark}
                        description={amountDescription}
                        titleStyle={styles.textHeadlineH2}
                        interactive={canEditAmount && !readonly}
                        shouldShowRightIcon={canEditAmount}
                        onPress={() =>
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'))
                        }
                        brickRoadIndicator={getErrorForField('amount') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('amount')}
                    />
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={getPendingFieldAction('comment')}>
                    <MenuItemWithTopDescription
                        description={translate('common.description')}
                        shouldParseTitle
                        title={TransactionUtils.getDescription(updatedTransaction ?? null) ?? transactionDescription}
                        interactive={canEdit && !readonly}
                        shouldShowRightIcon={canEdit}
                        titleStyle={styles.flex1}
                        onPress={() =>
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'))
                        }
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        brickRoadIndicator={getErrorForField('comment') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('comment')}
                        numberOfLinesTitle={0}
                    />
                </OfflineWithFeedback>
                {isDistanceRequest ? (
                    distanceRequestFields
                ) : (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('merchant')}>
                        <MenuItemWithTopDescription
                            description={translate('common.merchant')}
                            title={updatedTransaction?.modifiedMerchant ?? merchantTitle}
                            interactive={canEditMerchant && !readonly}
                            shouldShowRightIcon={canEditMerchant}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'))
                            }
                            wrapperStyle={[styles.taskDescriptionMenuItem]}
                            brickRoadIndicator={getErrorForField('merchant') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('merchant')}
                            numberOfLinesTitle={0}
                        />
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('created')}>
                    <MenuItemWithTopDescription
                        description={translate('common.date')}
                        title={transactionDate}
                        interactive={canEditDate && !readonly}
                        shouldShowRightIcon={canEditDate}
                        titleStyle={styles.flex1}
                        onPress={() =>
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1' ?? '-1'))
                        }
                        brickRoadIndicator={getErrorForField('date') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={getErrorForField('date')}
                    />
                </OfflineWithFeedback>
                {shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={updatedTransaction?.category ?? transactionCategory}
                            interactive={canEdit && !readonly}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'))
                            }
                            brickRoadIndicator={getErrorForField('category') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('category')}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTag && tagList}
                {isCardTransaction && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('cardID')}>
                        <MenuItemWithTopDescription
                            description={translate('iou.card')}
                            title={cardProgramName}
                            titleStyle={styles.flex1}
                            interactive={false}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxCode')}>
                        <MenuItemWithTopDescription
                            title={taxRateTitle ?? ''}
                            description={taxRatesDescription}
                            interactive={canEditTaxFields && !readonly}
                            shouldShowRightIcon={canEditTaxFields}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'))
                            }
                            brickRoadIndicator={getErrorForField('tax') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={getErrorForField('tax')}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxAmount')}>
                        <MenuItemWithTopDescription
                            title={formattedTaxAmount ? formattedTaxAmount.toString() : ''}
                            description={translate('iou.taxAmount')}
                            interactive={canEditTaxFields && !readonly}
                            shouldShowRightIcon={canEditTaxFields}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID ?? '-1', report?.reportID ?? '-1'),
                                )
                            }
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowViewTripDetails && (
                    <MenuItem
                        title={translate('travel.viewTripDetails')}
                        icon={Expensicons.Suitcase}
                        iconRight={Expensicons.NewWindow}
                        shouldShowRightIcon
                        onPress={() => Link.openTravelDotLink(activePolicyID, CONST.TRIP_ID_PATH(tripID))}
                    />
                )}
                {shouldShowBillable && (
                    <View style={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}>
                        <View>
                            <Text color={!transactionBillable ? theme.textSupporting : undefined}>{translate('common.billable')}</Text>
                            {!!getErrorForField('billable') && (
                                <ViolationMessages
                                    violations={getViolationsForField('billable')}
                                    containerStyle={[styles.mt1]}
                                    textStyle={[styles.ph0]}
                                    isLast
                                />
                            )}
                        </View>
                        <Switch
                            accessibilityLabel={translate('common.billable')}
                            isOn={!!transactionBillable}
                            onToggle={saveBillable}
                            disabled={!canEdit || readonly}
                        />
                    </View>
                )}
            </>
        </View>
    );
}

MoneyRequestView.displayName = 'MoneyRequestView';

export default withOnyx<MoneyRequestViewPropsWithoutTransaction, MoneyRequestViewOnyxPropsWithoutTransaction>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? ''}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID ?? ''}`,
    },
    policyTagList: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID ?? ''}`,
    },
    parentReport: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID ?? ''}`,
    },
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report?.parentReportID : '-1'}`,
        canEvict: false,
    },
    distanceRates: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`,
        selector: (policy: OnyxEntry<OnyxTypes.Policy>) => DistanceRequestUtils.getMileageRates(policy, true),
    },
})(
    withOnyx<MoneyRequestViewProps, MoneyRequestViewTransactionOnyxProps>({
        transaction: {
            key: ({report, parentReportActions}) => {
                const parentReportAction = parentReportActions?.[report?.parentReportActionID ?? '-1'];
                const originalMessage =
                    parentReportAction && ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction) : undefined;
                const transactionID = originalMessage?.IOUTransactionID ?? -1;
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            },
        },
        transactionViolations: {
            key: ({report, parentReportActions}) => {
                const parentReportAction = parentReportActions?.[report?.parentReportActionID ?? '-1'];
                const originalMessage =
                    parentReportAction && ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction) : undefined;
                const transactionID = originalMessage?.IOUTransactionID ?? -1;
                return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
            },
        },
    })(MoneyRequestView),
);
