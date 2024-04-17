import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmedRoute from '@components/ConfirmedRoute';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import SpacerView from '@components/SpacerView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useViolations from '@hooks/useViolations';
import type {ViolationField} from '@hooks/useViolations';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {isTaxTrackingEnabled} from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import Navigation from '@navigation/Navigation';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import * as IOU from '@userActions/IOU';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
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
};

type MoneyRequestViewPropsWithoutTransaction = MoneyRequestViewOnyxPropsWithoutTransaction & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: boolean;

    /** Whether we should display the animated banner above the component */
    shouldShowAnimatedBackground: boolean;
};

type MoneyRequestViewProps = MoneyRequestViewTransactionOnyxProps & MoneyRequestViewPropsWithoutTransaction;

function MoneyRequestView({
    report,
    parentReport,
    parentReportActions,
    policyCategories,
    shouldShowHorizontalRule,
    transaction,
    policyTagList,
    policy,
    transactionViolations,
    shouldShowAnimatedBackground,
}: MoneyRequestViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {canUseViolations} = usePermissions();
    const parentReportAction = parentReportActions?.[report.parentReportActionID ?? ''] ?? null;
    const moneyRequestReport = parentReport;
    const {
        created: transactionDate,
        amount: transactionAmount,
        taxAmount: transactionTaxAmount,
        taxCode: transactionTaxCode,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        billable: transactionBillable,
        category: transactionCategory,
        tag: transactionTag,
        originalAmount: transactionOriginalAmount,
        originalCurrency: transactionOriginalCurrency,
        cardID: transactionCardID,
    } = ReportUtils.getTransactionDetails(transaction) ?? {};
    const isEmptyMerchant = transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const formattedTransactionAmount = transactionAmount ? CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency) : '';
    const hasPendingWaypoints = transaction?.pendingFields?.waypoints;
    const showMapAsImage = isDistanceRequest && hasPendingWaypoints;
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && CurrencyUtils.convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const cardProgramName = isCardTransaction && transactionCardID !== undefined ? CardUtils.getCardDescription(transactionCardID) : '';
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const taxRates = policy?.taxRates;
    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(transactionTaxAmount, transactionCurrency);

    const taxRatesDescription = taxRates?.name;
    const taxRateTitle =
        taxRates &&
        (transactionTaxCode === taxRates?.defaultExternalID
            ? transaction && TransactionUtils.getDefaultTaxName(taxRates, transaction)
            : transactionTaxCode && TransactionUtils.getTaxName(taxRates?.taxes, transactionTaxCode));

    // Flags for allowing or disallowing editing a money request
    const isSettled = ReportUtils.isSettled(moneyRequestReport?.reportID);
    const isCancelled = moneyRequestReport && moneyRequestReport.isCancelledIOU;

    // Used for non-restricted fields such as: description, category, tag, billable, etc.
    const canEdit = ReportUtils.canEditMoneyRequest(parentReportAction);
    const canEditAmount = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT);
    const canEditMerchant = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.MERCHANT);
    const canEditDate = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE);
    const canEditReceipt = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const canEditDistance = ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DISTANCE);

    // A flag for verifying that the current report is a sub-report of a workspace chat
    // if the policy of the report is either Collect or Control, then this report must be tied to workspace chat
    const isPolicyExpenseChat = ReportUtils.isGroupPolicy(report);

    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTagList), [policyTagList]);

    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowCategory = isPolicyExpenseChat && (transactionCategory || OptionsListUtils.hasEnabledOptions(policyCategories ?? {}));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledTags(policyTagLists));
    const shouldShowBillable = isPolicyExpenseChat && (!!transactionBillable || !(policy?.disabledFields?.defaultBillable ?? true));

    // A flag for showing tax rate
    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy);

    const {getViolationsForField} = useViolations(transactionViolations ?? []);
    const hasViolations = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data']): boolean => !!canUseViolations && getViolationsForField(field, data).length > 0,
        [canUseViolations, getViolationsForField],
    );

    let amountDescription = `${translate('iou.amount')}`;

    const saveBillable = useCallback(
        (newBillable: boolean) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newBillable === TransactionUtils.getBillable(transaction)) {
                Navigation.dismissModal();
                return;
            }
            IOU.updateMoneyRequestBillable(transaction?.transactionID ?? '', report?.reportID, newBillable, policy, policyTagList, policyCategories);
            Navigation.dismissModal();
        },
        [transaction, report, policy, policyTagList, policyCategories],
    );

    if (isCardTransaction) {
        if (formattedOriginalAmount) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.original')} ${formattedOriginalAmount}`;
        }
        if (TransactionUtils.isPending(transaction)) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
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
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.settledExpensify')}`;
        } else if (report.isWaitingOnBankAccount) {
            amountDescription += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        }
    }

    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    let receiptURIs;
    const hasErrors = canEdit && TransactionUtils.hasMissingSmartscanFields(transaction);
    if (hasReceipt) {
        receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction);
    }

    const pendingAction = transaction?.pendingAction;
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => transaction?.pendingFields?.[fieldPath] ?? pendingAction;

    const getErrorForField = useCallback(
        (field: ViolationField, data?: OnyxTypes.TransactionViolation['data']) => {
            // Checks applied when creating a new money request
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

            // Return form errors if there are any
            if (hasErrors && isError && translationPath) {
                return translate(translationPath);
            }

            // Return violations if there are any
            if (canUseViolations && hasViolations(field, data)) {
                const violations = getViolationsForField(field, data);
                return ViolationsUtils.getViolationTranslation(violations[0], translate);
            }

            return '';
        },
        [transactionAmount, isSettled, isCancelled, isPolicyExpenseChat, isEmptyMerchant, transactionDate, hasErrors, canUseViolations, hasViolations, translate, getViolationsForField],
    );

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth, true, shouldShowAnimatedBackground)]}>
            {shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
            <View style={shouldShowAnimatedBackground && [StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth, true)]}>
                {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                {(showMapAsImage || hasReceipt) && (
                    <OfflineWithFeedback
                        pendingAction={pendingAction}
                        errors={transaction?.errors}
                        errorRowStyles={[styles.ml4]}
                        onClose={() => {
                            if (!transaction?.transactionID) {
                                return;
                            }
                            Transaction.clearError(transaction.transactionID);
                        }}
                    >
                        <View style={styles.moneyRequestViewImage}>
                            {showMapAsImage ? (
                                <ConfirmedRoute transaction={transaction} />
                            ) : (
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
                            )}
                        </View>
                    </OfflineWithFeedback>
                )}
                {!hasReceipt && canEditReceipt && (
                    <ReceiptEmptyState
                        hasError={hasErrors}
                        onPress={() =>
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                    CONST.IOU.ACTION.EDIT,
                                    CONST.IOU.TYPE.REQUEST,
                                    transaction?.transactionID ?? '',
                                    report.reportID,
                                    Navigation.getActiveRouteWithoutParams(),
                                ),
                            )
                        }
                    />
                )}
                {canUseViolations && <ViolationMessages violations={getViolationsForField('receipt')} />}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('amount')}>
                    <MenuItemWithTopDescription
                        title={formattedTransactionAmount ? formattedTransactionAmount.toString() : ''}
                        shouldShowTitleIcon={isSettled}
                        titleIcon={Expensicons.Checkmark}
                        description={amountDescription}
                        titleStyle={styles.textHeadlineH2}
                        interactive={canEditAmount}
                        shouldShowRightIcon={canEditAmount}
                        onPress={() =>
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID))
                        }
                        brickRoadIndicator={getErrorForField('amount') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        error={getErrorForField('amount')}
                    />
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={getPendingFieldAction('comment')}>
                    <MenuItemWithTopDescription
                        description={translate('common.description')}
                        shouldParseTitle
                        title={transactionDescription}
                        interactive={canEdit}
                        shouldShowRightIcon={canEdit}
                        titleStyle={styles.flex1}
                        onPress={() =>
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID),
                            )
                        }
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        brickRoadIndicator={getErrorForField('comment') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        error={getErrorForField('comment')}
                        numberOfLinesTitle={0}
                    />
                </OfflineWithFeedback>
                {isDistanceRequest ? (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('waypoints')}>
                        <MenuItemWithTopDescription
                            description={translate('common.distance')}
                            title={transactionMerchant}
                            interactive={canEditDistance}
                            shouldShowRightIcon={canEditDistance}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID),
                                )
                            }
                        />
                    </OfflineWithFeedback>
                ) : (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('merchant')}>
                        <MenuItemWithTopDescription
                            description={translate('common.merchant')}
                            title={isEmptyMerchant ? '' : transactionMerchant}
                            interactive={canEditMerchant}
                            shouldShowRightIcon={canEditMerchant}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID),
                                )
                            }
                            brickRoadIndicator={getErrorForField('merchant') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            error={getErrorForField('merchant')}
                        />
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('created')}>
                    <MenuItemWithTopDescription
                        description={translate('common.date')}
                        title={transactionDate}
                        interactive={canEditDate}
                        shouldShowRightIcon={canEditDate}
                        titleStyle={styles.flex1}
                        onPress={() =>
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID))
                        }
                        brickRoadIndicator={getErrorForField('date') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        error={getErrorForField('date')}
                    />
                </OfflineWithFeedback>
                {shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={transactionCategory}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID),
                                )
                            }
                            brickRoadIndicator={getErrorForField('category') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            error={getErrorForField('category')}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTag &&
                    policyTagLists.map(({name, orderWeight}, index) => (
                        <OfflineWithFeedback
                            key={name}
                            pendingAction={getPendingFieldAction('tag')}
                        >
                            <MenuItemWithTopDescription
                                description={name ?? translate('common.tag')}
                                title={TransactionUtils.getTagForDisplay(transaction, index)}
                                interactive={canEdit}
                                shouldShowRightIcon={canEdit}
                                titleStyle={styles.flex1}
                                onPress={() =>
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, orderWeight, transaction?.transactionID ?? '', report.reportID),
                                    )
                                }
                                brickRoadIndicator={getErrorForField('tag', {tagListIndex: index, tagListName: name}) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                error={getErrorForField('tag', {tagListIndex: index, tagListName: name})}
                            />
                        </OfflineWithFeedback>
                    ))}
                {isCardTransaction && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('cardID')}>
                        <MenuItemWithTopDescription
                            description={translate('iou.card')}
                            title={cardProgramName}
                            titleStyle={styles.flex1}
                        />
                    </OfflineWithFeedback>
                )}
                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxCode')}>
                        <MenuItemWithTopDescription
                            title={taxRateTitle ?? ''}
                            description={taxRatesDescription}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID),
                                )
                            }
                        />
                    </OfflineWithFeedback>
                )}

                {shouldShowTax && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('taxAmount')}>
                        <MenuItemWithTopDescription
                            title={formattedTaxAmount ? formattedTaxAmount.toString() : ''}
                            description={translate('iou.taxAmount')}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID),
                                )
                            }
                        />
                    </OfflineWithFeedback>
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
                            disabled={!canEdit}
                        />
                    </View>
                )}
            </View>
            <SpacerView
                shouldShow={shouldShowHorizontalRule}
                style={[shouldShowHorizontalRule ? styles.reportHorizontalRule : {}]}
            />
        </View>
    );
}

MoneyRequestView.displayName = 'MoneyRequestView';

export default withOnyx<MoneyRequestViewPropsWithoutTransaction, MoneyRequestViewOnyxPropsWithoutTransaction>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report.policyID}`,
    },
    policyTagList: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report.policyID}`,
    },
    parentReport: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
    },
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
        canEvict: false,
    },
})(
    withOnyx<MoneyRequestViewProps, MoneyRequestViewTransactionOnyxProps>({
        transaction: {
            key: ({report, parentReportActions}) => {
                const parentReportAction = parentReportActions?.[report.parentReportActionID ?? ''];
                const originalMessage = parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? parentReportAction.originalMessage : undefined;
                const transactionID = originalMessage?.IOUTransactionID ?? 0;
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            },
        },
        transactionViolations: {
            key: ({report, parentReportActions}) => {
                const parentReportAction = parentReportActions?.[report.parentReportActionID ?? ''];
                const originalMessage = parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? parentReportAction.originalMessage : undefined;
                const transactionID = originalMessage?.IOUTransactionID ?? 0;
                return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
            },
        },
    })(MoneyRequestView),
);
