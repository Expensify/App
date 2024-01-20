import lodashGet from 'lodash/get';
import lodashValues from 'lodash/values';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import categoryPropTypes from '@components/categoryPropTypes';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import SpacerView from '@components/SpacerView';
import Switch from '@components/Switch';
import tagPropTypes from '@components/tagPropTypes';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import ViolationMessages from '@components/ViolationMessages';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useViolations from '@hooks/useViolations';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CardUtils from '@libs/CardUtils';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import {policyDefaultProps, policyPropTypes} from '@pages/workspace/withPolicy';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ReportActionItemImage from './ReportActionItemImage';

const violationNames = lodashValues(CONST.VIOLATIONS);

const transactionViolationPropType = PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.oneOf(violationNames).isRequired,
    data: PropTypes.shape({
        rejectedBy: PropTypes.string,
        rejectReason: PropTypes.string,
        amount: PropTypes.string,
        surcharge: PropTypes.number,
        invoiceMarkup: PropTypes.number,
        maxAge: PropTypes.number,
        tagName: PropTypes.string,
        formattedLimitAmount: PropTypes.string,
        categoryLimit: PropTypes.string,
        limit: PropTypes.string,
        category: PropTypes.string,
        brokenBankConnection: PropTypes.bool,
        isAdmin: PropTypes.bool,
        email: PropTypes.string,
        isTransactionOlderThan7Days: PropTypes.bool,
        member: PropTypes.string,
        taxName: PropTypes.string,
    }),
});

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    /* Onyx Props */
    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The actions from the parent report */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** The policy the report is tied to */
    ...policyPropTypes,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** The transaction associated with the transactionThread */
    transaction: transactionPropTypes,

    /** Violations detected in this transaction */
    transactionViolations: PropTypes.arrayOf(transactionViolationPropType),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    parentReport: {},
    parentReportActions: {},
    transaction: {
        amount: 0,
        currency: CONST.CURRENCY.USD,
        comment: {comment: ''},
    },
    transactionViolations: [],
    policyCategories: {},
    policyTags: {},
    ...policyDefaultProps,
};

function MoneyRequestView({report, parentReport, parentReportActions, policyCategories, shouldShowHorizontalRule, transaction, policyTags, policy, transactionViolations}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {canUseViolations} = usePermissions();
    const parentReportAction = parentReportActions[report.parentReportActionID] || {};
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
    } = ReportUtils.getTransactionDetails(transaction);
    const isEmptyMerchant = transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    let formattedTransactionAmount = transactionAmount ? CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency) : '';
    const hasPendingWaypoints = lodashGet(transaction, 'pendingFields.waypoints', null);
    if (isDistanceRequest && (!formattedTransactionAmount || hasPendingWaypoints)) {
        formattedTransactionAmount = translate('common.tbd');
    }
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && CurrencyUtils.convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const cardProgramName = isCardTransaction ? CardUtils.getCardDescription(transactionCardID) : '';

    // Flags for allowing or disallowing editing a money request
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
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
    const policyTagsList = lodashGet(policyTag, 'tags', {});

    // Flags for showing categories and tags
    const shouldShowCategory = isPolicyExpenseChat && (transactionCategory || OptionsListUtils.hasEnabledOptions(lodashValues(policyCategories)));
    const shouldShowTag = isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledOptions(lodashValues(policyTagsList)));
    const shouldShowBillable = isPolicyExpenseChat && (transactionBillable || !lodashGet(policy, 'disabledFields.defaultBillable', true));

    const {getViolationsForField} = useViolations(transactionViolations);
    const hasViolations = useCallback((field) => canUseViolations && getViolationsForField(field).length > 0, [canUseViolations, getViolationsForField]);

    let amountDescription = `${translate('iou.amount')}`;

    const saveBillable = useCallback(
        (newBillable) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newBillable === TransactionUtils.getBillable(transaction)) {
                Navigation.dismissModal();
                return;
            }
            IOU.updateMoneyRequestBillable(transaction.transactionID, report.reportID, newBillable);
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

    const pendingAction = lodashGet(transaction, 'pendingAction');
    const getPendingFieldAction = (fieldPath) => lodashGet(transaction, fieldPath) || pendingAction;

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}>
                {hasReceipt && (
                    <OfflineWithFeedback pendingAction={pendingAction}>
                        <View style={styles.moneyRequestViewImage}>
                            <ReportActionItemImage
                                thumbnail={receiptURIs.thumbnail}
                                isThumbnail={receiptURIs.isThumbnail}
                                image={receiptURIs.image}
                                isLocalFile={receiptURIs.isLocalFile}
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
                                    transaction.transactionID,
                                    report.reportID,
                                    Navigation.getActiveRouteWithoutParams(),
                                ),
                            )
                        }
                    />
                )}
                {canUseViolations && <ViolationMessages violations={getViolationsForField('receipt')} />}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.amount')}>
                    <MenuItemWithTopDescription
                        title={formattedTransactionAmount ? formattedTransactionAmount.toString() : ''}
                        shouldShowTitleIcon={isSettled}
                        titleIcon={Expensicons.Checkmark}
                        description={amountDescription}
                        titleStyle={styles.newKansasLarge}
                        interactive={canEditAmount}
                        shouldShowRightIcon={canEditAmount}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
                        brickRoadIndicator={hasViolations('amount') || (hasErrors && transactionAmount === 0) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        error={hasErrors && transactionAmount === 0 ? translate('common.error.enterAmount') : ''}
                    />
                    {canUseViolations && <ViolationMessages violations={getViolationsForField('amount')} />}
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.comment')}>
                    <MenuItemWithTopDescription
                        description={translate('common.description')}
                        shouldParseTitle
                        title={transactionDescription}
                        interactive={canEdit}
                        shouldShowRightIcon={canEdit}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION))}
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        brickRoadIndicator={hasViolations('comment') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        numberOfLinesTitle={0}
                    />
                    {canUseViolations && <ViolationMessages violations={getViolationsForField('comment')} />}
                </OfflineWithFeedback>
                {isDistanceRequest ? (
                    <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.waypoints') || lodashGet(transaction, 'pendingAction')}>
                        <MenuItemWithTopDescription
                            description={translate('common.distance')}
                            title={hasPendingWaypoints ? transactionMerchant.replace(CONST.REGEX.FIRST_SPACE, translate('common.tbd')) : transactionMerchant}
                            interactive={canEditDistance}
                            shouldShowRightIcon={canEditDistance}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DISTANCE))}
                        />
                    </OfflineWithFeedback>
                ) : (
                    <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.merchant') || lodashGet(transaction, 'pendingAction')}>
                        <MenuItemWithTopDescription
                            description={translate('common.merchant')}
                            title={isEmptyMerchant ? '' : transactionMerchant}
                            interactive={canEditMerchant}
                            shouldShowRightIcon={canEditMerchant}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.MERCHANT))}
                            brickRoadIndicator={hasViolations('merchant') || (hasErrors && isEmptyMerchant && isPolicyExpenseChat) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={hasErrors && isPolicyExpenseChat && isEmptyMerchant ? translate('common.error.enterMerchant') : ''}
                        />
                        {canUseViolations && <ViolationMessages violations={getViolationsForField('merchant')} />}
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.created')}>
                    <MenuItemWithTopDescription
                        description={translate('common.date')}
                        title={transactionDate}
                        interactive={canEditDate}
                        shouldShowRightIcon={canEditDate}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
                        brickRoadIndicator={hasViolations('date') || (hasErrors && transactionDate === '') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        error={hasErrors && transactionDate === '' ? translate('common.error.enterDate') : ''}
                    />
                    {canUseViolations && <ViolationMessages violations={getViolationsForField('date')} />}
                </OfflineWithFeedback>
                {shouldShowCategory && (
                    <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.category') || lodashGet(transaction, 'pendingAction')}>
                        <MenuItemWithTopDescription
                            description={translate('common.category')}
                            title={transactionCategory}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.CATEGORY))}
                            brickRoadIndicator={hasViolations('category') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        />
                        {canUseViolations && <ViolationMessages violations={getViolationsForField('category')} />}
                    </OfflineWithFeedback>
                )}
                {shouldShowTag && (
                    <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.tag') || lodashGet(transaction, 'pendingAction')}>
                        <MenuItemWithTopDescription
                            description={lodashGet(policyTag, 'name', translate('common.tag'))}
                            title={transactionTag}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.TAG))}
                            brickRoadIndicator={hasViolations('tag') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        />
                        {canUseViolations && <ViolationMessages violations={getViolationsForField('tag')} />}
                    </OfflineWithFeedback>
                )}
                {isCardTransaction && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.cardID')}>
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
                                isOn={transactionBillable}
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

MoneyRequestView.propTypes = propTypes;
MoneyRequestView.defaultProps = defaultProps;
MoneyRequestView.displayName = 'MoneyRequestView';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
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
    }),
    withOnyx({
        transaction: {
            key: ({report, parentReportActions}) => {
                const parentReportAction = parentReportActions[report.parentReportActionID];
                const transactionID = lodashGet(parentReportAction, ['originalMessage', 'IOUTransactionID'], 0);
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            },
        },
        transactionViolations: {
            key: ({report}) => {
                const parentReportAction = ReportActionsUtils.getParentReportAction(report);
                const transactionID = lodashGet(parentReportAction, ['originalMessage', 'IOUTransactionID'], 0);
                return `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
            },
        },
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report.policyID}`,
        },
    }),
)(MoneyRequestView);
