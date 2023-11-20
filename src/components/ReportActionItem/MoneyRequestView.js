import lodashGet from 'lodash/get';
import lodashValues from 'lodash/values';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
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
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
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
import ViolationUtils from '@libs/Violations/ViolationsUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {transactionViolationsPropTypes} from '@src/types/onyx/TransactionViolation';
import ReportActionItemImage from './ReportActionItemImage';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    /* Onyx Props */
    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** The transaction associated with the transactionThread */
    transaction: transactionPropTypes,

    /** Violations detected in this transaction */
    transactionViolations: transactionViolationsPropTypes,

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    parentReport: {},
    policyCategories: {},
    transaction: {
        amount: 0,
        currency: CONST.CURRENCY.USD,
        comment: {comment: ''},
    },
    transactionViolations: null,
    policyTags: {},
};

function MoneyRequestView({report, parentReport, policyCategories, shouldShowHorizontalRule, transaction, policyTags, policy, transactionViolations}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {canUseViolations} = usePermissions();
    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
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
    const isEmptyMerchant =
        transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.UNKNOWN_MERCHANT || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    let formattedTransactionAmount = transactionAmount ? CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency) : '';
    const hasPendingWaypoints = lodashGet(transaction, 'pendingFields.waypoints', null);
    if (isDistanceRequest && (!formattedTransactionAmount || hasPendingWaypoints)) {
        formattedTransactionAmount = translate('common.tbd');
    }
    const formattedOriginalAmount = transactionOriginalAmount && transactionOriginalCurrency && CurrencyUtils.convertToDisplayString(transactionOriginalAmount, transactionOriginalCurrency);
    const isExpensifyCardTransaction = TransactionUtils.isExpensifyCardTransaction(transaction);
    const cardProgramName = isExpensifyCardTransaction ? CardUtils.getCardDescription(transactionCardID) : '';

    // Flags for allowing or disallowing editing a money request
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const canEdit = ReportUtils.canEditMoneyRequest(parentReportAction) && !isExpensifyCardTransaction;

    // A flag for verifying that the current report is a sub-report of a workspace chat
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report)), [report]);

    // Fetches only the first tag, for now
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagsList = lodashGet(policyTag, 'tags', {});

    // Flags for showing categories and tags
    const shouldShowCategory = isPolicyExpenseChat && (transactionCategory || OptionsListUtils.hasEnabledOptions(lodashValues(policyCategories)));
    const shouldShowTag = isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledOptions(lodashValues(policyTagsList)));
    const shouldShowBillable = isPolicyExpenseChat && (transactionBillable || !lodashGet(policy, 'disabledFields.defaultBillable', true));

    /**
     * Returns the translated violation name for the provided field.
     *
     * Returns `undefined`If the user is not permitted to use violations or no violation exists on that field.
     */
    const getViolationForField = useCallback(
        (field) => {
            if (!canUseViolations) {
                return undefined;
            }
            return ViolationUtils.getTranslatedViolationNameForField(field, transactionViolations, translate);
        },
        [canUseViolations, transactionViolations, translate],
    );

    let amountDescription = `${translate('iou.amount')}`;

    if (isExpensifyCardTransaction) {
        if (formattedOriginalAmount) {
            amountDescription += ` • ${translate('iou.original')} ${formattedOriginalAmount}`;
        }
        if (TransactionUtils.isPending(transaction)) {
            amountDescription += ` • ${translate('iou.pending')}`;
        }
    } else {
        if (!isDistanceRequest) {
            amountDescription += ` • ${translate('iou.cash')}`;
        }
        if (isSettled) {
            amountDescription += ` • ${translate('iou.settledExpensify')}`;
        } else if (report.isWaitingOnBankAccount) {
            amountDescription += ` • ${translate('iou.pending')}`;
        }
    }

    // A temporary solution to hide the transaction detail
    // This will be removed after we properly add the transaction as a prop
    if (ReportActionsUtils.isDeletedAction(parentReportAction)) {
        return null;
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
                                image={receiptURIs.image}
                                isLocalFile={receiptURIs.isLocalFile}
                                transaction={transaction}
                                enablePreviewModal
                            />
                        </View>
                        {getViolationForField('receipt') && (
                            <View>
                                <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('receipt')}</Text>
                            </View>
                        )}
                    </OfflineWithFeedback>
                )}
                {!hasReceipt && canEdit && !isSettled && canUseViolations && (
                    <ReceiptEmptyState
                        hasError={hasErrors}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.RECEIPT))}
                    />
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.amount')}>
                    <MenuItemWithTopDescription
                        title={formattedTransactionAmount ? formattedTransactionAmount.toString() : ''}
                        shouldShowTitleIcon={isSettled}
                        titleIcon={Expensicons.Checkmark}
                        description={amountDescription}
                        titleStyle={styles.newKansasLarge}
                        interactive={canEdit && !isSettled}
                        shouldShowRightIcon={canEdit && !isSettled}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
                        brickRoadIndicator={hasErrors && transactionAmount === 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        error={hasErrors && transactionAmount === 0 ? translate('common.error.enterAmount') : ''}
                    />
                    {getViolationForField('amount') && (
                        <View>
                            <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('amount')}</Text>
                        </View>
                    )}
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
                        brickRoadIndicator={Boolean(getViolationForField('amount'))}
                        numberOfLinesTitle={0}
                    />
                    {getViolationForField('comment') && (
                        <View>
                            <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('comment')}</Text>
                        </View>
                    )}
                </OfflineWithFeedback>
                {isDistanceRequest ? (
                    <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.waypoints') || lodashGet(transaction, 'pendingAction')}>
                        <MenuItemWithTopDescription
                            description={translate('common.distance')}
                            title={hasPendingWaypoints ? transactionMerchant.replace(CONST.REGEX.FIRST_SPACE, translate('common.tbd')) : transactionMerchant}
                            interactive={canEdit && !isSettled}
                            shouldShowRightIcon={canEdit && !isSettled}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DISTANCE))}
                        />
                    </OfflineWithFeedback>
                ) : (
                    <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.merchant') || lodashGet(transaction, 'pendingAction')}>
                        <MenuItemWithTopDescription
                            description={translate('common.merchant')}
                            title={transactionMerchant}
                            interactive={canEdit}
                            shouldShowRightIcon={canEdit}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.MERCHANT))}
                            brickRoadIndicator={Boolean(getViolationForField('merchant')) || (hasErrors && isEmptyMerchant) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={hasErrors && isEmptyMerchant ? translate('common.error.enterMerchant') : ''}
                        />
                        {getViolationForField('merchant') && (
                            <View>
                                <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('merchant')}</Text>
                            </View>
                        )}
                    </OfflineWithFeedback>
                )}
                <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.created')}>
                    <MenuItemWithTopDescription
                        description={translate('common.date')}
                        title={transactionDate}
                        interactive={canEdit && !isSettled}
                        shouldShowRightIcon={canEdit && !isSettled}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
                        brickRoadIndicator={Boolean(getViolationForField('date')) || (hasErrors && transactionDate === '') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        error={hasErrors && transactionDate === '' ? translate('common.error.enterDate') : ''}
                    />
                    {getViolationForField('date') && (
                        <View>
                            <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('date')}</Text>
                        </View>
                    )}
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
                            brickRoadIndicator={Boolean(getViolationForField('category'))}
                        />
                        {getViolationForField('category') && (
                            <View>
                                <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('category')}</Text>
                            </View>
                        )}
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
                            brickRoadIndicator={Boolean(getViolationForField('tag'))}
                        />
                        {getViolationForField('tag') && (
                            <View>
                                <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('tag')}</Text>
                            </View>
                        )}
                    </OfflineWithFeedback>
                )}
                {isExpensifyCardTransaction && (
                    <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.cardID')}>
                        <MenuItemWithTopDescription
                            description={translate('iou.card')}
                            title={cardProgramName}
                            titleStyle={styles.flex1}
                            interactive={canEdit}
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
                                onToggle={(value) => IOU.editMoneyRequest(transaction.transactionID, report.reportID, {billable: value})}
                            />
                        </View>
                        {getViolationForField('billable') && (
                            <View>
                                <Text style={[styles.ph5, styles.textLabelError]}>{getViolationForField('billable')}</Text>
                            </View>
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
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
        policyCategories: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report.policyID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        transaction: {
            key: ({report}) => {
                const parentReportAction = ReportActionsUtils.getParentReportAction(report);
                const transactionID = lodashGet(parentReportAction, ['originalMessage', 'IOUTransactionID'], 0);
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            },
        },
        transactionViolation: {
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
