import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashValues from 'lodash/values';
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import Permissions from '../../libs/Permissions';
import Navigation from '../../libs/Navigation/Navigation';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import compose from '../../libs/compose';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import * as ReportUtils from '../../libs/ReportUtils';
import * as IOU from '../../libs/actions/IOU';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import * as PolicyUtils from '../../libs/PolicyUtils';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import EmptyStateBackgroundImage from '../../../assets/images/empty-state_background-fade.png';
import useLocalize from '../../hooks/useLocalize';
import * as ReceiptUtils from '../../libs/ReceiptUtils';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import transactionPropTypes from '../transactionPropTypes';
import Image from '../Image';
import Text from '../Text';
import Switch from '../Switch';
import ReportActionItemImage from './ReportActionItemImage';
import * as TransactionUtils from '../../libs/TransactionUtils';
import OfflineWithFeedback from '../OfflineWithFeedback';
import categoryPropTypes from '../categoryPropTypes';
import SpacerView from '../SpacerView';
import tagPropTypes from '../tagPropTypes';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    /* Onyx Props */
    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** The transaction associated with the transactionThread */
    transaction: transactionPropTypes,

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    betas: [],
    parentReport: {},
    policyCategories: {},
    transaction: {
        amount: 0,
        currency: CONST.CURRENCY.USD,
        comment: {comment: ''},
    },
    policyTags: {},
};

function MoneyRequestView({report, betas, parentReport, policyCategories, shouldShowHorizontalRule, transaction, policyTags, policy}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
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
    } = ReportUtils.getTransactionDetails(transaction);
    const isEmptyMerchant =
        transactionMerchant === '' || transactionMerchant === CONST.TRANSACTION.UNKNOWN_MERCHANT || transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const formattedTransactionAmount = transactionAmount && transactionCurrency && CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);

    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const canEdit = ReportUtils.canEditMoneyRequest(parentReportAction);
    // A flag for verifying that the current report is a sub-report of a workspace chat
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report)), [report]);

    // Fetches only the first tag, for now
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagsList = lodashGet(policyTag, 'tags', {});

    // Flags for showing categories and tags
    const shouldShowCategory = isPolicyExpenseChat && Permissions.canUseCategories(betas) && (transactionCategory || OptionsListUtils.hasEnabledOptions(lodashValues(policyCategories)));
    const shouldShowTag = isPolicyExpenseChat && Permissions.canUseTags(betas) && (transactionTag || OptionsListUtils.hasEnabledOptions(lodashValues(policyTagsList)));
    const shouldShowBillable = isPolicyExpenseChat && Permissions.canUseTags(betas) && (transactionBillable || !lodashGet(policy, 'disabledFields.defaultBillable', true));

    let description = `${translate('iou.amount')} • ${translate('iou.cash')}`;
    if (isSettled) {
        description += ` • ${translate('iou.settledExpensify')}`;
    } else if (report.isWaitingOnBankAccount) {
        description += ` • ${translate('iou.pending')}`;
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
        receiptURIs = ReceiptUtils.getThumbnailAndImageURIs(transaction.receipt.source, transaction.filename);
        hasErrors = canEdit && TransactionUtils.hasMissingSmartscanFields(transaction);
    }

    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const pendingAction = lodashGet(transaction, 'pendingAction');
    const getPendingFieldAction = (fieldPath) => lodashGet(transaction, fieldPath) || pendingAction;

    return (
        <View>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth), StyleUtils.getMinimumHeight(CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT.MIN_HEIGHT)]}>
                <Image
                    pointerEvents="none"
                    source={EmptyStateBackgroundImage}
                    style={[StyleUtils.getReportWelcomeBackgroundImageStyle(true)]}
                />
            </View>

            {hasReceipt && (
                <OfflineWithFeedback pendingAction={pendingAction}>
                    <View style={styles.moneyRequestViewImage}>
                        <ReportActionItemImage
                            thumbnail={receiptURIs.thumbnail}
                            image={receiptURIs.image}
                            enablePreviewModal
                        />
                    </View>
                </OfflineWithFeedback>
            )}
            <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.amount')}>
                <MenuItemWithTopDescription
                    title={formattedTransactionAmount ? formattedTransactionAmount.toString() : ''}
                    shouldShowTitleIcon={isSettled}
                    titleIcon={Expensicons.Checkmark}
                    description={description}
                    titleStyle={styles.newKansasLarge}
                    interactive={canEdit}
                    shouldShowRightIcon={canEdit}
                    onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.AMOUNT))}
                    brickRoadIndicator={hasErrors && transactionAmount === 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                    error={hasErrors && transactionAmount === 0 ? translate('common.error.enterAmount') : ''}
                />
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
                    numberOfLinesTitle={0}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={getPendingFieldAction('pendingFields.created')}>
                <MenuItemWithTopDescription
                    description={translate('common.date')}
                    title={transactionDate}
                    interactive={canEdit}
                    shouldShowRightIcon={canEdit}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.DATE))}
                    brickRoadIndicator={hasErrors && transactionDate === '' ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                    error={hasErrors && transactionDate === '' ? translate('common.error.enterDate') : ''}
                />
            </OfflineWithFeedback>
            {isDistanceRequest ? (
                <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.waypoints') || lodashGet(transaction, 'pendingAction')}>
                    <MenuItemWithTopDescription
                        description={translate('common.distance')}
                        title={transactionMerchant}
                        interactive={canEdit}
                        shouldShowRightIcon={canEdit}
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
                        brickRoadIndicator={hasErrors && isEmptyMerchant ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                        subtitle={hasErrors && isEmptyMerchant ? translate('common.error.enterMerchant') : ''}
                        subtitleTextStyle={styles.textLabelError}
                    />
                </OfflineWithFeedback>
            )}
            {shouldShowCategory && (
                <OfflineWithFeedback pendingAction={lodashGet(transaction, 'pendingFields.category') || lodashGet(transaction, 'pendingAction')}>
                    <MenuItemWithTopDescription
                        description={translate('common.category')}
                        title={transactionCategory}
                        interactive={canEdit}
                        shouldShowRightIcon={canEdit}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.EDIT_REQUEST.getRoute(report.reportID, CONST.EDIT_REQUEST_FIELD.CATEGORY))}
                    />
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
                    />
                </OfflineWithFeedback>
            )}
            {shouldShowBillable && (
                <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8]}>
                    <Text color={!transactionBillable ? themeColors.textSupporting : undefined}>{translate('common.billable')}</Text>
                    <Switch
                        accessibilityLabel={translate('common.billable')}
                        isOn={transactionBillable}
                        onToggle={(value) => IOU.editMoneyRequest(transaction.transactionID, report.reportID, {billable: value})}
                    />
                </View>
            )}
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
        betas: {
            key: ONYXKEYS.BETAS,
        },
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
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report.policyID}`,
        },
    }),
)(MoneyRequestView);
