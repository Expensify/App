import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
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
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import * as IOU from '@userActions/IOU';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
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
    policyTags: OnyxEntry<OnyxTypes.PolicyTags>;

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
};

type MoneyRequestViewProps = MoneyRequestViewTransactionOnyxProps & MoneyRequestViewPropsWithoutTransaction;

function MoneyRequestView({
    report,
    parentReport,
    parentReportActions,
    policyCategories,
    shouldShowHorizontalRule,
    transaction,
    policyTags,
    policy,
    transactionViolations,
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
    let formattedTransactionAmount = transactionAmount ? CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency) : '';
    const hasPendingWaypoints = transaction?.pendingFields?.waypoints;
    if (isDistanceRequest && (!formattedTransactionAmount || hasPendingWaypoints)) {
        formattedTransactionAmount = translate('common.tbd');
    }
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && CurrencyUtils.convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const cardProgramName = isCardTransaction && transactionCardID !== undefined ? CardUtils.getCardDescription(transactionCardID) : '';

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

    // Fetches only the first tag, for now
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagsList = policyTag?.tags ?? {};

    // Flags for showing categories and tags
    // transactionCategory can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowCategory = isPolicyExpenseChat && (transactionCategory || OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));
    // transactionTag can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowTag = isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledOptions(Object.values(policyTagsList)));
    const shouldShowBillable = isPolicyExpenseChat && (!!transactionBillable || !(policy?.disabledFields?.defaultBillable ?? true));

    const {getViolationsForField} = useViolations(transactionViolations ?? []);
    const hasViolations = useCallback((field: ViolationField): boolean => !!canUseViolations && getViolationsForField(field).length > 0, [canUseViolations, getViolationsForField]);

    let amountDescription = `${translate('iou.amount')}`;

    const saveBillable = useCallback(
        (newBillable: boolean) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newBillable === TransactionUtils.getBillable(transaction)) {
                Navigation.dismissModal();
                return;
            }
            IOU.updateMoneyRequestBillable(transaction?.transactionID ?? '', report?.reportID, newBillable);
            Navigation.dismissModal();
        },
        [transaction, report],
    );

    if (isCardTransaction) {
        if (formattedOriginalAmount) {
            amountDescription += ` • ${translate('iou.original')} ${formattedOriginalAmount}`;
        }
        if (TransactionUtils.isPending(transaction)) {
            amountDescription += ` • ${translate('iou.pending')}`;
        }
        if (isCancelled) {
            amountDescription += ` • ${translate('iou.canceled')}`;
        }
    } else {
        if (!isDistanceRequest) {
            amountDescription += ` • ${translate('iou.cash')}`;
        }
        if (ReportUtils.isReportApproved(report)) {
            amountDescription += ` • ${translate('iou.approved')}`;
        } else if (isCancelled) {
            amountDescription += ` • ${translate('iou.canceled')}`;
        } else if (isSettled) {
            amountDescription += ` • ${translate('iou.settledExpensify')}`;
        } else if (report.isWaitingOnBankAccount) {
            amountDescription += ` • ${translate('iou.pending')}`;
        }
    }

    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    let receiptURIs;
    let hasErrors = false;
    if (hasReceipt) {
        receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction);
        hasErrors = canEdit && TransactionUtils.hasMissingSmartscanFields(transaction);
    }

    const pendingAction = transaction?.pendingAction;
    const getPendingFieldAction = (fieldPath: TransactionPendingFieldsKey) => transaction?.pendingFields?.[fieldPath] ?? pendingAction;

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}>
                {hasReceipt && (
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
                            <ReportActionItemImage
                                thumbnail={receiptURIs?.thumbnail}
                                image={receiptURIs?.image}
                                isLocalFile={receiptURIs?.isLocalFile}
                                filename={receiptURIs?.filename}
                                transaction={transaction}
                                enablePreviewModal
                                canEditReceipt={canEditReceipt}
                            />
                        </View>
                    </OfflineWithFeedback>
                )}
                {!hasReceipt && canEditReceipt && canUseViolations && (
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
                        titleStyle={styles.newKansasLarge}
                        interactive={canEditAmount}
                        shouldShowRightIcon={canEditAmount}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
                        brickRoadIndicator={hasViolations('amount') || (hasErrors && transactionAmount === 0) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        error={hasErrors && transactionAmount === 0 ? translate('common.error.enterAmount') : ''}
                    />
                    {canUseViolations && <ViolationMessages violations={getViolationsForField('amount')} />}
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={getPendingFieldAction('comment')}>
                    <MenuItemWithTopDescription
                        description={translate('common.description')}
                        shouldParseTitle
                        title={transactionDescription}
                        interactive={canEdit}
                        shouldShowRightIcon={canEdit}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        brickRoadIndicator={hasViolations('comment') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        numberOfLinesTitle={0}
                    />
                    {canUseViolations && <ViolationMessages violations={getViolationsForField('comment')} />}
                </OfflineWithFeedback>
                {isDistanceRequest ? (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('waypoints')}>
                        <MenuItemWithTopDescription
                            description={translate('common.distance')}
                            title={hasPendingWaypoints ? transactionMerchant?.replace(CONST.REGEX.FIRST_SPACE, translate('common.tbd')) : transactionMerchant}
                            interactive={canEditDistance}
                            shouldShowRightIcon={canEditDistance}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DISTANCE))}
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
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.MERCHANT))}
                            brickRoadIndicator={
                                hasViolations('merchant') || (!isSettled && !isCancelled && hasErrors && isEmptyMerchant && isPolicyExpenseChat)
                                    ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                    : undefined
                            }
                            error={!isSettled && !isCancelled && hasErrors && isPolicyExpenseChat && isEmptyMerchant ? translate('common.error.enterMerchant') : ''}
                        />
                        {canUseViolations && <ViolationMessages violations={getViolationsForField('merchant')} />}
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('created')}>
                    <MenuItemWithTopDescription
                        description={translate('common.date')}
                        title={transactionDate}
                        interactive={canEditDate}
                        shouldShowRightIcon={canEditDate}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
                        brickRoadIndicator={hasViolations('date') || (hasErrors && transactionDate === '') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        error={hasErrors && transactionDate === '' ? translate('common.error.enterDate') : ''}
                    />
                    {canUseViolations && <ViolationMessages violations={getViolationsForField('date')} />}
                </OfflineWithFeedback>
                {shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('category')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={transactionCategory}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.CATEGORY))}
                            brickRoadIndicator={hasViolations('category') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                        {canUseViolations && <ViolationMessages violations={getViolationsForField('category')} />}
                    </OfflineWithFeedback>
                )}
                {shouldShowTag && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('tag')}>
                        <MenuItemWithTopDescription
                            description={policyTag?.name ?? translate('common.tag')}
                            title={PolicyUtils.getCleanedTagName(transactionTag ?? '')}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.REQUEST, transaction?.transactionID ?? '', report.reportID))
                            }
                            brickRoadIndicator={hasViolations('tag') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                        {canUseViolations && <ViolationMessages violations={getViolationsForField('tag')} />}
                    </OfflineWithFeedback>
                )}
                {isCardTransaction && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('cardID')}>
                        <MenuItemWithTopDescription
                            description={translate('iou.card')}
                            title={cardProgramName}
                            titleStyle={styles.flex1}
                        />
                    </OfflineWithFeedback>
                )}

                {shouldShowBillable && (
                    <>
                        <View style={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}>
                            <Text color={!transactionBillable ? theme.textSupporting : undefined}>{translate('common.billable')}</Text>
                            <Switch
                                accessibilityLabel={translate('common.billable')}
                                isOn={!!transactionBillable}
                                onToggle={saveBillable}
                            />
                        </View>
                        {hasViolations('billable') && (
                            <ViolationMessages
                                violations={getViolationsForField('billable')}
                                isLast
                            />
                        )}
                    </>
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
    policyTags: {
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
            key: ({report}) => {
                const parentReportAction = ReportActionsUtils.getParentReportAction(report);
                const originalMessage = parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? parentReportAction.originalMessage : undefined;
                const transactionID = originalMessage?.IOUTransactionID ?? 0;
                return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
            },
        },
    })(MoneyRequestView),
);
