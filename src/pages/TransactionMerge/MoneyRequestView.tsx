import {Str} from 'expensify-common';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePolicyCategories, usePolicyTags} from '@components/OnyxListItemProvider';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import type {ViolationField} from '@hooks/useViolations';
import useViolations from '@hooks/useViolations';
import {getCompanyCardDescription} from '@libs/CardUtils';
import {isCategoryMissing} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportIDForExpense} from '@libs/MergeTransactionUtils';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getLengthOfTag, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getReportName,
    getReportOrDraftReport,
    getTransactionDetails,
    getTripIDFromTransactionParentReportID,
    isInvoiceReport,
    isPaidGroupPolicy,
    isReportApproved,
    isReportInGroupPolicy,
    isSettled as isSettledReportUtils,
    isTrackExpenseReport,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {
    getBillable,
    getCurrency,
    getDescription,
    getDistanceInMeters,
    getFormattedCreated,
    getOriginalTransactionWithSplitInfo,
    getReimbursable,
    getTagForDisplay,
    getTaxName,
    hasMissingSmartscanFields,
    hasReservationList,
    hasRoute as hasRouteTransactionUtils,
    isManagedCardTransaction as isCardTransactionTransactionUtils,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isExpenseUnreported as isExpenseUnreportedTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanning,
    shouldShowAttendees as shouldShowAttendeesTransactionUtils,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import {initSplitExpense, updateMoneyRequestBillable, updateMoneyRequestReimbursable} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {TransactionPendingFieldsKey} from '@src/types/onyx/Transaction';

type MoneyRequestViewProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

    /** Policy that the report belongs to */
    expensePolicy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether we should display the animated banner above the component */
    shouldShowAnimatedBackground: boolean;

    /** Whether we should show Money Request with disabled all fields */
    readonly?: boolean;

    /** whether this report is from review duplicates */
    isFromReviewDuplicates?: boolean;

    /** Updated transaction to show in duplicate & merge transaction flow  */
    updatedTransaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Merge transaction ID to show in merge transaction flow */
    mergeTransactionID?: string;
};

function MoneyRequestView({allReports, expensePolicy, shouldShowAnimatedBackground, updatedTransaction}: MoneyRequestViewProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const {translate, toLocaleDigit} = useLocalize();

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${updatedTransaction?.reportID}`];
    const isExpenseUnreported = isExpenseUnreportedTransactionUtils(updatedTransaction);
    const {policyForMovingExpensesID, policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();
    // If the expense is unreported the policy should be the user's default policy, otherwise it should be the policy the expense was made for
    const policy = isExpenseUnreported ? policyForMovingExpenses : expensePolicy;
    const policyID = isExpenseUnreported ? policyForMovingExpensesID : report?.policyID;

    const allPolicyCategories = usePolicyCategories();
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${updatedTransaction?.reportID}`];
    const targetPolicyID = updatedTransaction?.reportID ? transactionReport?.policyID : policyID;
    const allPolicyTags = usePolicyTags();
    const policyTagList = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyID}`];
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});

    const transactionViolations = useTransactionViolations(updatedTransaction?.transactionID);

    const allowNegativeAmount = shouldEnableNegative(report, policy);

    const {
        created: transactionDate,
        amount: transactionAmount,
        attendees: transactionAttendees,
        taxAmount: transactionTaxAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        reimbursable: transactionReimbursable,
        billable: transactionBillable,
        category: transactionCategory,
        tag: transactionTag,
        originalAmount: transactionOriginalAmount,
        originalCurrency: transactionOriginalCurrency,
        postedDate: transactionPostedDate,
    } = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(updatedTransaction, undefined, undefined, allowNegativeAmount) ?? {}, [allowNegativeAmount, updatedTransaction]);
    const isEmptyMerchant = transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isDistanceRequest = isDistanceRequestTransactionUtils(updatedTransaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(updatedTransaction);
    const isMapDistanceRequest = isDistanceRequest && !isManualDistanceRequest;
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(updatedTransaction);
    const isTransactionScanning = isScanning(updatedTransaction);
    const hasRoute = hasRouteTransactionUtils(updatedTransaction, isDistanceRequest);

    const attendees = updatedTransaction?.comment?.attendees;

    // Use the updated transaction amount in merge flow to have correct positive/negative sign
    const actualAmount = updatedTransaction?.amount;
    const actualCurrency = getCurrency(updatedTransaction);
    const shouldDisplayTransactionAmount = ((isDistanceRequest && hasRoute) || !!actualAmount) && actualAmount !== undefined;
    const formattedTransactionAmount = shouldDisplayTransactionAmount ? convertToDisplayString(actualAmount, actualCurrency) : '';
    const formattedPerAttendeeAmount = shouldDisplayTransactionAmount ? convertToDisplayString(actualAmount / (attendees?.length ?? 1), actualCurrency) : '';

    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isCardTransaction = isCardTransactionTransactionUtils(updatedTransaction);
    const cardProgramName = getCompanyCardDescription(updatedTransaction?.cardName, updatedTransaction?.cardID, cardList);
    const shouldShowCard = isCardTransaction && cardProgramName;

    const moneyRequestReport = report;
    const taxRates = policy?.taxRates;
    const formattedTaxAmount =
        updatedTransaction?.taxAmount !== undefined
            ? convertToDisplayString(Math.abs(updatedTransaction.taxAmount), actualCurrency)
            : convertToDisplayString(Math.abs(transactionTaxAmount ?? 0), actualCurrency);

    const taxRatesDescription = taxRates?.name;
    const taxRateTitle = updatedTransaction ? getTaxName(policy, updatedTransaction) : getTaxName(policy, updatedTransaction);

    const actualTransactionDate = getFormattedCreated(updatedTransaction);
    const fallbackTaxRateTitle = updatedTransaction?.taxValue;

    const isSettled = isSettledReportUtils(moneyRequestReport?.reportID);
    const isCancelled = moneyRequestReport && moneyRequestReport?.isCancelledIOU;
    const isChatReportArchived = useReportIsArchived(moneyRequestReport?.chatReportID);
    const shouldShowPaid = isSettled && transactionReimbursable;

    // A flag for verifying that the current report is a sub-report of a expense chat
    // if the policy of the report is either Collect or Control, then this report must be tied to expense chat
    const isPolicyExpenseChat = isReportInGroupPolicy(report);
    const policyTagLists = useMemo(() => getTagLists(policyTagList), [policyTagList]);

    const category = transactionCategory ?? '';
    const categoryForDisplay = isCategoryMissing(category) ? '' : category;

    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowCategory =
        (isPolicyExpenseChat && (categoryForDisplay || hasEnabledOptions(policyCategories ?? {}))) || (isExpenseUnreported && (!policyForMovingExpenses || policy?.areCategoriesEnabled));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = isPolicyExpenseChat && (transactionTag || hasEnabledTags(policyTagLists));
    const shouldShowBillable = isPolicyExpenseChat && (!!transactionBillable || !(policy?.disabledFields?.defaultBillable ?? true) || !!updatedTransaction?.billable);
    const isCurrentTransactionReimbursableDifferentFromPolicyDefault =
        policy?.defaultReimbursable !== undefined && !!(updatedTransaction?.reimbursable ?? transactionReimbursable) !== policy.defaultReimbursable;
    const shouldShowReimbursable = isPolicyExpenseChat && (policy?.disabledFields?.reimbursable !== true || isCurrentTransactionReimbursableDifferentFromPolicyDefault) && !isCardTransaction;
    const shouldShowAttendees = policy?.isAttendeeTrackingEnabled;

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest, isPerDiemRequest);
    const tripID = getTripIDFromTransactionParentReportID(report?.parentReportID);
    const shouldShowViewTripDetails = hasReservationList(updatedTransaction) && !!tripID;

    const {getViolationsForField} = useViolations(transactionViolations ?? [], isTransactionScanning || !isPaidGroupPolicy(report));
    const hasViolations = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data'], policyHasDependentTags = false, tagValue?: string): boolean =>
            getViolationsForField(field, data, policyHasDependentTags, tagValue).length > 0,
        [getViolationsForField],
    );

    let amountDescription = `${translate('iou.amount')}`;
    let dateDescription = `${translate('common.date')}`;

    const {unit, rate} = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy});
    const distance = getDistanceInMeters(updatedTransaction, unit);
    const currency = transactionCurrency ?? CONST.CURRENCY.USD;
    const isCustomUnitOutOfPolicy = transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY) || (isDistanceRequest && !rate);
    const rateToDisplay = isCustomUnitOutOfPolicy ? translate('common.rateOutOfPolicy') : DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate);
    let merchantTitle = isEmptyMerchant ? '' : transactionMerchant;
    let amountTitle = formattedTransactionAmount ? formattedTransactionAmount.toString() : '';
    if (isTransactionScanning) {
        merchantTitle = translate('iou.receiptStatusTitle');
        amountTitle = translate('iou.receiptStatusTitle');
    }

    const shouldNavigateToUpgradePath = !policyForMovingExpenses && !shouldSelectPolicy;

    const updatedTransactionDescription = useMemo(() => {
        if (!updatedTransaction) {
            return undefined;
        }
        return getDescription(updatedTransaction ?? null);
    }, [updatedTransaction]);
    const isEmptyUpdatedMerchant = updatedTransaction?.modifiedMerchant === '' || updatedTransaction?.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const updatedMerchantTitle = isEmptyUpdatedMerchant ? '' : (updatedTransaction?.modifiedMerchant ?? merchantTitle);

    if (isCardTransaction) {
        if (transactionPostedDate) {
            dateDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.posted')} ${transactionPostedDate}`;
        }
        if (formattedOriginalAmount) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.original')} ${formattedOriginalAmount}`;
        }
        if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        }
    } else {
        if (!isDistanceRequest && !isPerDiemRequest) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.cash')}`;
        }
        if (isCancelled) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (false /*isApproved*/) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (shouldShowPaid) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.settledExpensify')}`;
        }
    }

    const hasErrors = hasMissingSmartscanFields(updatedTransaction);
    const pendingAction = updatedTransaction?.pendingAction;
    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => (pendingAction ? undefined : updatedTransaction?.pendingFields?.[fieldPath]);

    const distanceCopyValue = distanceToDisplay;
    const distanceRateCopyValue = rateToDisplay;
    const amountCopyValue = amountTitle;
    const descriptionCopyValue = useMemo(() => {
        const descriptionHTML = updatedTransactionDescription ?? transactionDescription;
        if (!descriptionHTML) {
            return undefined;
        }

        return Parser.htmlToText(descriptionHTML);
    }, [transactionDescription, updatedTransactionDescription]);

    const merchantCopyValue = updatedMerchantTitle;
    const dateCopyValue = transactionDate;
    const categoryValue = updatedTransaction?.category ?? categoryForDisplay;
    const categoryCopyValue = categoryValue;
    const cardCopyValue = cardProgramName;
    const taxRateValue = taxRateTitle ?? fallbackTaxRateTitle;
    const taxRateCopyValue = taxRateValue;
    const taxAmountTitle = formattedTaxAmount ? formattedTaxAmount.toString() : '';
    const taxAmountCopyValue = taxAmountTitle;

    const distanceRequestFields = (
        <>
            <OfflineWithFeedback pendingAction={getPendingFieldAction('waypoints') ?? getPendingFieldAction('merchant')}>
                <MenuItemWithTopDescription
                    description={translate('common.distance')}
                    title={distanceToDisplay}
                    titleStyle={styles.flex1}
                    copyValue={distanceCopyValue}
                    copyable={!!distanceCopyValue}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={getPendingFieldAction('customUnitRateID')}>
                <MenuItemWithTopDescription
                    description={translate('common.rate')}
                    title={rateToDisplay}
                    titleStyle={styles.flex1}
                    copyValue={distanceRateCopyValue}
                    copyable={!!distanceRateCopyValue}
                />
            </OfflineWithFeedback>
        </>
    );

    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTagList);

    const previousTransactionTag = usePrevious(transactionTag);

    const [previousTag, setPreviousTag] = useState<string | undefined>(undefined);
    const [currentTransactionTag, setCurrentTransactionTag] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (transactionTag === previousTransactionTag) {
            return;
        }
        setPreviousTag(previousTransactionTag);
        setCurrentTransactionTag(transactionTag);
    }, [transactionTag, previousTransactionTag]);

    const getAttendeesTitle = useMemo(() => {
        return Array.isArray(attendees) ? attendees.map((item) => item?.displayName ?? item?.login).join(', ') : '';
    }, [transactionAttendees]);
    const attendeesCopyValue = getAttendeesTitle;

    const previousTagLength = getLengthOfTag(previousTag ?? '');
    const currentTagLength = getLengthOfTag(currentTransactionTag ?? '');

    const tagList = policyTagLists.map(({name, orderWeight, tags}, index) => {
        const tagForDisplay = getTagForDisplay(updatedTransaction ?? updatedTransaction, index);
        let shouldShow = false;
        if (hasDependentTags) {
            if (index === 0) {
                shouldShow = true;
            } else {
                const prevTagValue = getTagForDisplay(updatedTransaction, index - 1);
                shouldShow = !!prevTagValue;
            }
        } else {
            shouldShow = !!tagForDisplay || hasEnabledOptions(tags);
        }

        if (!shouldShow) {
            return null;
        }

        const tagCopyValue = tagForDisplay;

        return (
            <OfflineWithFeedback
                key={name}
                pendingAction={getPendingFieldAction('tag')}
            >
                <MenuItemWithTopDescription
                    highlighted={hasDependentTags && shouldShow && !getTagForDisplay(updatedTransaction, index) && currentTagLength > previousTagLength}
                    description={name ?? translate('common.tag')}
                    title={tagForDisplay}
                    numberOfLinesTitle={2}
                    titleStyle={styles.flex1}
                    shouldShowBasicTitle
                    shouldShowDescriptionOnTop
                    copyValue={tagCopyValue}
                    copyable={!!tagCopyValue}
                />
            </OfflineWithFeedback>
        );
    });

    const actualParentReport = getReportOrDraftReport(getReportIDForExpense(updatedTransaction));
    const shouldShowReport = !!report?.reportID || !!actualParentReport;
    const reportCopyValue = getReportName(actualParentReport);

    if (!report?.reportID || !updatedTransaction?.transactionID) {
        return <ReportActionsSkeletonView />;
    }

    return (
        <View style={styles.pRelative}>
            {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
            <>
                {/* <MoneyRequestReceiptView */}
                {/*     allReports={allReports} */}
                {/*     report={report} */}
                {/*     readonly={readonly} */}
                {/*     updatedTransaction={updatedTransaction} */}
                {/*     isFromReviewDuplicates={isFromReviewDuplicates} */}
                {/*     mergeTransactionID={mergeTransactionID} */}
                {/* /> */}
                {isCustomUnitOutOfPolicy && isPerDiemRequest && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.mh4, styles.mb2]}>
                        <Icon
                            src={Expensicons.DotIndicator}
                            fill={theme.danger}
                            height={16}
                            width={16}
                        />
                        <Text
                            numberOfLines={1}
                            style={[StyleUtils.getDotIndicatorTextStyles(true), styles.pre, styles.flexShrink1]}
                        >
                            {translate('violations.customUnitOutOfPolicy')}
                        </Text>
                    </View>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('amount') ?? (amountTitle ? getPendingFieldAction('customUnitRateID') : undefined)}>
                    <MenuItemWithTopDescription
                        title={amountTitle}
                        shouldShowTitleIcon={shouldShowPaid}
                        titleIcon={Expensicons.Checkmark}
                        description={amountDescription}
                        titleStyle={styles.textHeadlineH2}
                        copyValue={amountCopyValue}
                        copyable={!!amountCopyValue}
                    />
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={getPendingFieldAction('comment')}>
                    <MenuItemWithTopDescription
                        description={translate('common.description')}
                        shouldRenderAsHTML
                        title={updatedTransactionDescription ?? transactionDescription}
                        titleStyle={styles.flex1}
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        numberOfLinesTitle={0}
                        copyValue={descriptionCopyValue}
                        copyable={!!descriptionCopyValue}
                    />
                </OfflineWithFeedback>
                {isManualDistanceRequest || (isMapDistanceRequest && updatedTransaction?.comment?.waypoints) ? (
                    distanceRequestFields
                ) : (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('merchant')}>
                        <MenuItemWithTopDescription
                            description={translate('common.merchant')}
                            title={updatedMerchantTitle}
                            titleStyle={styles.flex1}
                            wrapperStyle={[styles.taskDescriptionMenuItem]}
                            numberOfLinesTitle={0}
                            copyValue={merchantCopyValue}
                            copyable={!!merchantCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('created')}>
                    <MenuItemWithTopDescription
                        description={dateDescription}
                        title={actualTransactionDate}
                        titleStyle={styles.flex1}
                        copyValue={dateCopyValue}
                        copyable={!!dateCopyValue}
                    />
                </OfflineWithFeedback>
                {!!shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={categoryValue}
                            numberOfLinesTitle={2}
                            titleStyle={styles.flex1}
                            copyValue={categoryCopyValue}
                            copyable={!!categoryCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTag && tagList}
                {!!shouldShowCard && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('cardID')}>
                        <MenuItemWithTopDescription
                            description={translate('iou.card')}
                            title={cardCopyValue}
                            titleStyle={styles.flex1}
                            interactive={false}
                            copyValue={cardCopyValue}
                            copyable={!!cardCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxCode')}>
                        <MenuItemWithTopDescription
                            title={taxRateValue}
                            description={taxRatesDescription}
                            titleStyle={styles.flex1}
                            copyValue={taxRateCopyValue}
                            copyable={!!taxRateCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxAmount')}>
                        <MenuItemWithTopDescription
                            title={taxAmountTitle}
                            description={translate('iou.taxAmount')}
                            titleStyle={styles.flex1}
                            copyValue={taxAmountCopyValue}
                            copyable={!!taxAmountCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowAttendees && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('attendees')}>
                        <MenuItemWithTopDescription
                            key="attendees"
                            title={getAttendeesTitle}
                            description={`${translate('iou.attendees')} ${
                                Array.isArray(attendees) && attendees.length > 1 && formattedPerAttendeeAmount
                                    ? `${CONST.DOT_SEPARATOR} ${formattedPerAttendeeAmount} ${translate('common.perPerson')}`
                                    : ''
                            }`}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            shouldRenderAsHTML
                            copyValue={attendeesCopyValue}
                            copyable={!!attendeesCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowReimbursable && (
                    <OfflineWithFeedback
                        pendingAction={getPendingFieldAction('reimbursable')}
                        contentContainerStyle={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}
                    >
                        <View>
                            <Text>{Str.UCFirst(translate('iou.reimbursable'))}</Text>
                        </View>
                        <Switch
                            accessibilityLabel={Str.UCFirst(translate('iou.reimbursable'))}
                            isOn={updatedTransaction?.reimbursable ?? !!transactionReimbursable}
                            onToggle={(_) => {}}
                            disabled
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowBillable && (
                    <OfflineWithFeedback
                        pendingAction={getPendingFieldAction('billable')}
                        contentContainerStyle={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}
                    >
                        <View>
                            <Text>{translate('common.billable')}</Text>
                        </View>
                        <Switch
                            accessibilityLabel={translate('common.billable')}
                            isOn={updatedTransaction?.billable ?? !!transactionBillable}
                            onToggle={(_) => {}}
                            disabled
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowReport && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('reportID')}>
                        <MenuItemWithTopDescription
                            title={getReportName(actualParentReport) || actualParentReport?.reportName}
                            description={translate('common.report')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            shouldRenderAsHTML
                            copyValue={reportCopyValue}
                            copyable={!!reportCopyValue}
                        />
                    </OfflineWithFeedback>
                )}
            </>
        </View>
    );
}

MoneyRequestView.displayName = 'MoneyRequestView';

export default MoneyRequestView;
