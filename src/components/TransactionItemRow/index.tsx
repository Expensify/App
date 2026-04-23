import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import {PressableWithFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import ActionCell from '@components/Search/SearchList/ListItem/ActionCell';
import AttendeesCell from '@components/Search/SearchList/ListItem/AttendeesCell';
import DateCell from '@components/Search/SearchList/ListItem/DateCell';
import ExportedIconCell from '@components/Search/SearchList/ListItem/ExportedIconCell';
import StatusCell from '@components/Search/SearchList/ListItem/StatusCell';
import TextCell from '@components/Search/SearchList/ListItem/TextCell';
import AmountCell from '@components/Search/SearchList/ListItem/TotalCell';
import UserInfoCell from '@components/Search/SearchList/ListItem/UserInfoCell';
import WorkspaceCell from '@components/Search/SearchList/ListItem/WorkspaceCell';
import type {SearchColumnType, TableColumnSize} from '@components/Search/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyCardDescription} from '@libs/CardUtils';
import {isCategoryMissing} from '@libs/CategoryUtils';
import getBase62ReportID from '@libs/getBase62ReportID';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {isExpenseReport, isIOUReport, isSettled} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {
    getAmount,
    getAttendees,
    getCurrency,
    getDescription,
    getExchangeRate,
    getMerchant,
    getOriginalAmountForDisplay,
    getOriginalCurrencyForDisplay,
    getReimbursable,
    getTaxName,
    getCreated as getTransactionCreated,
    hasMissingSmartscanFields,
    isAmountMissing,
    isDeletedTransaction as isDeletedTransactionUtil,
    isExpenseUnreported,
    isMerchantMissing,
    isScanning,
    isTimeRequest,
    shouldShowAttendees as shouldShowAttendeesUtils,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, PersonalDetails, Policy, Report, ReportAction, TransactionViolation} from '@src/types/onyx';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';
import CategoryCell from './DataCells/CategoryCell';
import ChatBubbleCell from './DataCells/ChatBubbleCell';
import MerchantOrDescriptionCell from './DataCells/MerchantCell';
import ReceiptCell from './DataCells/ReceiptCell';
import TagCell from './DataCells/TagCell';
import TaxCell from './DataCells/TaxCell';
import TotalCell from './DataCells/TotalCell';
import TypeCell from './DataCells/TypeCell';
import TransactionItemRowRBR from './TransactionItemRowRBR';

type TransactionWithOptionalSearchFields = TransactionWithOptionalHighlight & {
    /** The action that can be performed for the transaction */
    action?: SearchTransactionAction;

    /** Function passed to the action button, triggered when the button is pressed */
    onButtonPress?: () => void;

    /** The personal details of the user requesting money */
    from?: PersonalDetails;

    /** The personal details of the user paying the request */
    to?: PersonalDetails;

    /** The date the report was exported */
    exported?: string;

    /** formatted "to" value used for displaying and sorting on Reports page */
    formattedTo?: string;

    /** formatted "from" value used for displaying and sorting on Reports page */
    formattedFrom?: string;

    /** formatted "merchant" value used for displaying and sorting on Reports page */
    formattedMerchant?: string;

    /** information about whether to show merchant, that is provided on Reports page */
    shouldShowMerchant?: boolean;

    /** information about whether to show the description, that is provided on Reports page */
    shouldShowDescription?: boolean;

    /** Precomputed violations */
    violations?: TransactionViolation[];

    /** Used to initiate payment from search page */
    hash?: number;

    /** Report to which the transaction belongs */
    report?: Report;

    /** Policy to which the transaction belongs */
    policy?: Policy;
};

type TransactionItemRowProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    report?: Report;
    policy?: Policy;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    submittedColumnSize?: TableColumnSize;
    approvedColumnSize?: TableColumnSize;
    postedColumnSize?: TableColumnSize;
    exportedColumnSize?: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    onCheckboxPress?: (transactionID: string) => void;
    shouldShowCheckbox?: boolean;
    columns?: SearchColumnType[];
    onButtonPress?: () => void;
    style?: StyleProp<ViewStyle>;
    isReportItemChild?: boolean;
    isActionLoading?: boolean;
    isInSingleTransactionReport?: boolean;
    shouldShowRadioButton?: boolean;
    onRadioButtonPress?: (transactionID: string) => void;
    shouldShowErrors?: boolean;
    shouldHighlightItemWhenSelected?: boolean;
    isDisabled?: boolean;
    violations?: TransactionViolation[];
    shouldShowBottomBorder?: boolean;
    onArrowRightPress?: () => void;
    isHover?: boolean;
    shouldShowArrowRightOnNarrowLayout?: boolean;
    reportActions?: ReportAction[];
    checkboxSentryLabel?: string;
    isLargeScreenWidth?: boolean;
    policyForMovingExpenses?: Policy;
    nonPersonalAndWorkspaceCards?: CardList;
    isActionColumnWide?: boolean;
    /** Callbacks for inline cell editing */
    onEditDate?: (newDate: string) => void;
    onEditMerchant?: (newMerchant: string) => void;
    onEditDescription?: (newDescription: string) => void;
    onEditCategory?: (newCategory: string) => void;
    onEditAmount?: (newAmount: number) => void;
    onEditTag?: (newTag: string) => void;

    /** Per-field edit permissions — controls whether the cell shows editable affordance */
    canEditDate?: boolean;
    canEditMerchant?: boolean;
    canEditDescription?: boolean;
    canEditCategory?: boolean;
    canEditAmount?: boolean;
    canEditTag?: boolean;
};

const EMPTY_ACTIVE_STYLE: StyleProp<ViewStyle> = [];

function getMerchantName(transactionItem: TransactionWithOptionalSearchFields, translate: (key: TranslationPaths) => string) {
    const shouldShowMerchant = transactionItem.shouldShowMerchant ?? true;

    let merchant = transactionItem?.formattedMerchant ?? getMerchant(transactionItem);

    if (isScanning(transactionItem) && shouldShowMerchant) {
        merchant = translate('iou.receiptStatusTitle');
    }

    const merchantName = StringUtils.getFirstLine(merchant);
    return merchantName !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchantName !== CONST.TRANSACTION.DEFAULT_MERCHANT ? merchantName : '';
}

function TransactionItemRow({
    transactionItem,
    report,
    policy,
    shouldUseNarrowLayout,
    isSelected,
    shouldShowTooltip,
    dateColumnSize,
    submittedColumnSize,
    approvedColumnSize,
    postedColumnSize,
    exportedColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    onCheckboxPress = () => {},
    shouldShowCheckbox = false,
    columns,
    onButtonPress = () => {},
    style,
    isReportItemChild = false,
    isActionLoading,
    isInSingleTransactionReport = false,
    shouldShowRadioButton = false,
    onRadioButtonPress = () => {},
    shouldShowErrors = true,
    shouldHighlightItemWhenSelected = true,
    isDisabled = false,
    violations,
    shouldShowBottomBorder,
    onArrowRightPress,
    isHover = false,
    shouldShowArrowRightOnNarrowLayout,
    reportActions,
    checkboxSentryLabel,
    nonPersonalAndWorkspaceCards = {},
    isLargeScreenWidth: isLargeScreenWidthProp,
    policyForMovingExpenses,
    isActionColumnWide: isActionColumnWideProp,
    onEditDate,
    onEditMerchant,
    onEditDescription,
    onEditCategory,
    onEditAmount,
    onEditTag,
    canEditDate,
    canEditMerchant,
    canEditDescription,
    canEditCategory,
    canEditAmount,
    canEditTag,
}: TransactionItemRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const isLargeScreenWidth = isLargeScreenWidthProp ?? !shouldUseNarrowLayout;
    const hasCategoryOrTag = !isCategoryMissing(transactionItem?.category) || !!transactionItem.tag;

    // For unreported expenses (SelfDM), use active policy to show policy-specific fields like categories and tags
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const reportPolicyID = report?.policyID ?? transactionItem.report?.policyID;
    const effectivePolicyID = isExpenseUnreported(transactionItem) ? activePolicyID : reportPolicyID;
    const createdAt = getTransactionCreated(transactionItem);
    const expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const transactionThreadReportID = reportActions ? getIOUActionForTransactionID(reportActions, transactionItem.transactionID)?.childReportID : undefined;
    const isDeletedTransaction = isDeletedTransactionUtil(transactionItem);

    const isDateColumnWide = dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isSubmittedColumnWide = submittedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isApprovedColumnWide = approvedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isPostedColumnWide = postedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isExportedColumnWide = exportedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isAmountColumnWide = amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isTaxAmountColumnWide = taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;

    const bgActiveStyles = useMemo(() => {
        if (!isSelected || !shouldHighlightItemWhenSelected) {
            return EMPTY_ACTIVE_STYLE;
        }
        return styles.activeComponentBG;
    }, [isSelected, styles.activeComponentBG, shouldHighlightItemWhenSelected]);

    const merchant = useMemo(() => getMerchantName(transactionItem, translate), [transactionItem, translate]);
    const description = getDescription(transactionItem);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const merchantOrDescription = merchant || description;

    const missingFieldError = useMemo(() => {
        if (isSettled(report)) {
            return '';
        }

        const hasFieldErrors = hasMissingSmartscanFields(transactionItem, report);
        if (hasFieldErrors) {
            const amountMissing = isAmountMissing(transactionItem);
            const merchantMissing = isMerchantMissing(transactionItem);
            let error = '';

            if (amountMissing && merchantMissing) {
                error = translate('violations.reviewRequired');
            } else if (amountMissing) {
                error = translate('iou.missingAmount');
            } else if (merchantMissing && !isSettled(report)) {
                error = translate('iou.missingMerchant');
            }

            return error;
        }
    }, [transactionItem, translate, report]);

    const exchangeRateMessage = getExchangeRate(transactionItem, report?.currency);
    const cardName = getCompanyCardDescription(translate, transactionItem?.cardName, transactionItem?.cardID, nonPersonalAndWorkspaceCards);
    const transactionAttendees = useMemo(() => getAttendees(transactionItem, currentUserPersonalDetails), [transactionItem, currentUserPersonalDetails]);

    const isUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const shouldShowAttendees = shouldShowAttendeesUtils(CONST.IOU.TYPE.SUBMIT, isUnreported ? policyForMovingExpenses : policy) && transactionAttendees.length > 0;

    const totalPerAttendee = useMemo(() => {
        const attendeesCount = transactionAttendees.length ?? 0;
        const totalAmount = getAmount(transactionItem, isExpenseReport(report));

        if (!attendeesCount || totalAmount === undefined) {
            return undefined;
        }

        return totalAmount / attendeesCount;
    }, [report, transactionAttendees.length, transactionItem]);

    const renderColumn = (column: SearchColumnType): React.ReactNode => {
        switch (column) {
            case CONST.SEARCH.TABLE_COLUMNS.TYPE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}
                    >
                        <TypeCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.RECEIPT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}
                    >
                        <ReceiptCell
                            transactionItem={transactionItem}
                            isSelected={isSelected}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TAG:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}
                    >
                        <TagCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                            canEdit={canEditTag}
                            onSave={onEditTag}
                            policyID={effectivePolicyID}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.DATE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, {isDateColumnWide})]}
                    >
                        <DateCell
                            canEdit={canEditDate}
                            date={createdAt}
                            onSave={onEditDate}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth={!shouldUseNarrowLayout}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.SUBMITTED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.SUBMITTED, {isDateColumnWide, isSubmittedColumnWide})]}
                    >
                        <DateCell
                            date={report?.submitted ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth={!shouldUseNarrowLayout}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.APPROVED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.APPROVED, {isApprovedColumnWide})]}
                    >
                        <DateCell
                            date={report?.approved ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth={!shouldUseNarrowLayout}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.POSTED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.POSTED, {isPostedColumnWide})]}
                    >
                        <DateCell
                            date={transactionItem.posted ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth={!shouldUseNarrowLayout}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.EXPORTED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED, {isExportedColumnWide})]}
                    >
                        <DateCell
                            date={transactionItem.exported ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth={!shouldUseNarrowLayout}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.CATEGORY:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}
                    >
                        <CategoryCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                            canEdit={canEditCategory}
                            onSave={onEditCategory}
                            policyID={effectivePolicyID}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE)]}
                    >
                        <Text>{getReimbursable(transactionItem) ? translate('common.yes') : translate('common.no')}</Text>
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.BILLABLE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BILLABLE)]}
                    >
                        <Text>{transactionItem.billable ? translate('common.yes') : translate('common.no')}</Text>
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.ACTION:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION, {isActionColumnWide: isActionColumnWideProp ?? isDeletedTransaction})]}
                    >
                        {!!transactionItem.action && (
                            <ActionCell
                                action={transactionItem.action}
                                isSelected={isSelected}
                                isChildListItem={isReportItemChild}
                                onButtonPress={onButtonPress}
                                isLoading={isActionLoading}
                                reportID={transactionItem.reportID}
                                policyID={report?.policyID}
                                hash={transactionItem?.hash}
                                amount={report?.total}
                                shouldDisablePointerEvents={isDisabled}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.MERCHANT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}
                    >
                        <MerchantOrDescriptionCell
                            merchantOrDescription={merchant ?? ''}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                            canEdit={canEditMerchant}
                            onSave={onEditMerchant}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION)]}
                    >
                        <MerchantOrDescriptionCell
                            merchantOrDescription={description}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                            isDescription
                            canEdit={canEditDescription}
                            onSave={onEditDescription}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TO:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}
                    >
                        {!!transactionItem.to && (
                            <UserInfoCell
                                accountID={transactionItem.to.accountID}
                                avatar={transactionItem.to.avatar}
                                displayName={transactionItem.formattedTo ?? transactionItem.to.displayName ?? ''}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.FROM:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}
                    >
                        {!!transactionItem.from && (
                            <UserInfoCell
                                accountID={transactionItem.from.accountID}
                                avatar={transactionItem.from.avatar}
                                displayName={transactionItem.formattedFrom ?? transactionItem.from.displayName ?? ''}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.CARD:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CARD)]}
                    >
                        <TextCell text={cardName} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.ATTENDEES:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ATTENDEES)]}
                    >
                        {shouldShowAttendees && (
                            <AttendeesCell
                                attendees={transactionAttendees}
                                isHovered={isHover}
                                isPressed={isSelected}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.COMMENTS:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.COMMENTS)]}
                    >
                        <ChatBubbleCell
                            transaction={transactionItem}
                            isInSingleTransactionReport={isInSingleTransactionReport}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE)]}
                    >
                        <TextCell text={exchangeRateMessage} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, {isAmountColumnWide})]}
                    >
                        <TotalCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                            canEdit={canEditAmount}
                            onSave={onEditAmount}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, {isAmountColumnWide})]}
                    >
                        {shouldShowAttendees && (
                            <AmountCell
                                total={totalPerAttendee ?? 0}
                                currency={getCurrency(transactionItem)}
                                isScanning={isScanning(transactionItem)}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT, {isAmountColumnWide})]}
                    >
                        <AmountCell
                            total={getOriginalAmountForDisplay(transactionItem, isExpenseReport(transactionItem.report))}
                            currency={getOriginalCurrencyForDisplay(transactionItem)}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.REPORT_ID:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REPORT_ID)]}
                    >
                        <TextCell text={transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : transactionItem.reportID} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID)]}
                    >
                        <TextCell text={transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : getBase62ReportID(Number(transactionItem.reportID))} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TAX_RATE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_RATE)]}
                    >
                        <TextCell text={isTimeRequest(transactionItem) ? '' : (getTaxName(policy, transactionItem) ?? transactionItem.taxValue ?? '')} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT, {isTaxAmountColumnWide})]}
                    >
                        {isTimeRequest(transactionItem) ? null : (
                            <TaxCell
                                transactionItem={transactionItem}
                                shouldShowTooltip={shouldShowTooltip}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME)]}
                    >
                        <WorkspaceCell
                            policyID={transactionItem.report?.policyID}
                            report={transactionItem.report}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TITLE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}
                    >
                        <TextCell
                            text={getReportName(transactionItem.report) || (transactionItem.report?.reportName ?? '')}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.STATUS:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)]}
                    >
                        <StatusCell
                            stateNum={transactionItem.report?.stateNum}
                            statusNum={transactionItem.report?.statusNum}
                            isDeleted={isDeletedTransaction}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO)]}
                    >
                        <ExportedIconCell reportActions={reportActions} />
                    </View>
                );
            default:
                return null;
        }
    };
    const shouldRenderChatBubbleCell = useMemo(() => {
        return columns?.includes(CONST.SEARCH.TABLE_COLUMNS.COMMENTS) ?? false;
    }, [columns]);

    if (shouldUseNarrowLayout) {
        return (
            <>
                <View
                    style={[styles.expenseWidgetRadius, bgActiveStyles, styles.justifyContentEvenly, style, styles.overflowHidden]}
                    testID="transaction-item-row"
                >
                    <View style={[styles.flexRow]}>
                        {shouldShowCheckbox && (
                            <Checkbox
                                disabled={isDisabled}
                                onPress={() => {
                                    onCheckboxPress(transactionItem.transactionID);
                                }}
                                accessibilityLabel={CONST.ROLE.CHECKBOX}
                                isChecked={isSelected}
                                style={styles.mr3}
                                containerStyle={styles.m0}
                                wrapperStyle={styles.justifyContentCenter}
                                sentryLabel={checkboxSentryLabel}
                            />
                        )}
                        <ReceiptCell
                            transactionItem={transactionItem}
                            isSelected={isSelected}
                            style={styles.mr3}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                        <View style={[styles.flex2, styles.flexColumn, styles.justifyContentEvenly]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.minHeight5, styles.maxHeight5]}>
                                <DateCell
                                    date={createdAt}
                                    showTooltip={shouldShowTooltip}
                                    isLargeScreenWidth={!shouldUseNarrowLayout}
                                />
                                <Text style={[styles.textMicroSupporting]}> • </Text>
                                <TypeCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                                {!merchantOrDescription && (
                                    <View style={[styles.mlAuto]}>
                                        <TotalCell
                                            transactionItem={transactionItem}
                                            shouldShowTooltip={shouldShowTooltip}
                                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        />
                                    </View>
                                )}
                            </View>
                            {!!merchantOrDescription && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                    <MerchantOrDescriptionCell
                                        merchantOrDescription={merchantOrDescription}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        isDescription={!merchant}
                                    />
                                    <TotalCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                            )}
                        </View>
                        {!!shouldShowArrowRightOnNarrowLayout && !!onArrowRightPress && (
                            <View style={[styles.justifyContentEnd, styles.alignItemsEnd, styles.mbHalf, styles.ml1]}>
                                <Icon
                                    src={expensicons.ArrowRight}
                                    fill={theme.icon}
                                    additionalStyles={styles.opacitySemiTransparent}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </View>
                        )}
                        {shouldShowRadioButton && (
                            <View style={[styles.ml3, styles.justifyContentCenter]}>
                                <RadioButton
                                    isChecked={isSelected}
                                    disabled={isDisabled}
                                    onPress={() => onRadioButtonPress?.(transactionItem.transactionID)}
                                    accessibilityLabel={CONST.ROLE.RADIO}
                                    shouldUseNewStyle
                                />
                            </View>
                        )}
                    </View>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart]}>
                        <View style={[styles.flexColumn, styles.flex1]}>
                            {hasCategoryOrTag && !isIOUReport(report) && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt2, styles.minHeight4]}>
                                    <CategoryCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        policyID={effectivePolicyID}
                                    />
                                    <TagCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        policyID={effectivePolicyID}
                                    />
                                </View>
                            )}
                            {shouldShowErrors && (
                                <TransactionItemRowRBR
                                    transaction={transactionItem}
                                    violations={violations}
                                    report={report}
                                    containerStyles={[styles.mt2, styles.minHeight4]}
                                    missingFieldError={missingFieldError}
                                    transactionThreadReportID={transactionThreadReportID}
                                />
                            )}
                        </View>
                        {shouldRenderChatBubbleCell && (
                            <ChatBubbleCell
                                transaction={transactionItem}
                                containerStyles={[styles.mt2]}
                                isInSingleTransactionReport={isInSingleTransactionReport}
                            />
                        )}
                    </View>
                </View>
                {!!shouldShowBottomBorder && (
                    <View style={bgActiveStyles}>
                        <View style={styles.ph3}>
                            <View style={[styles.borderBottom]} />
                        </View>
                    </View>
                )}
            </>
        );
    }

    return (
        <>
            <View style={[styles.expenseWidgetRadius, styles.flex1, styles.gap2, bgActiveStyles, styles.mw100, style]}>
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    {!shouldShowRadioButton && (
                        <Checkbox
                            disabled={isDisabled}
                            onPress={() => {
                                onCheckboxPress(transactionItem.transactionID);
                            }}
                            accessibilityLabel={CONST.ROLE.CHECKBOX}
                            isChecked={isSelected}
                            containerStyle={styles.m0}
                            wrapperStyle={styles.justifyContentCenter}
                            sentryLabel={checkboxSentryLabel}
                        />
                    )}
                    {columns?.map(renderColumn)}
                    {shouldShowRadioButton && (
                        <View style={[styles.ml1, styles.justifyContentCenter]}>
                            <RadioButton
                                isChecked={isSelected}
                                disabled={isDisabled}
                                onPress={() => onRadioButtonPress?.(transactionItem.transactionID)}
                                accessibilityLabel={CONST.ROLE.RADIO}
                                shouldUseNewStyle
                            />
                        </View>
                    )}
                    {!!isLargeScreenWidth &&
                        (onArrowRightPress ? (
                            <PressableWithFeedback
                                disabled={!!isDisabled}
                                onPress={() => onArrowRightPress?.()}
                                style={[styles.pv2, styles.justifyContentCenter, styles.alignItemsEnd]}
                                accessibilityRole={CONST.ROLE.BUTTON}
                                accessibilityLabel={CONST.ROLE.BUTTON}
                                sentryLabel={CONST.SENTRY_LABEL.TRANSACTION_ITEM_ROW.ARROW_RIGHT}
                            >
                                <Icon
                                    src={expensicons.ArrowRight}
                                    fill={theme.icon}
                                    additionalStyles={!isHover && styles.opacitySemiTransparent}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </PressableWithFeedback>
                        ) : (
                            <View style={[styles.p3Half, styles.pl0half, styles.pr0half, {width: variables.iconSizeNormal}]} />
                        ))}
                </View>
                {shouldShowErrors && (
                    <TransactionItemRowRBR
                        transaction={transactionItem}
                        violations={violations}
                        report={report}
                        missingFieldError={missingFieldError}
                        transactionThreadReportID={transactionThreadReportID}
                    />
                )}
            </View>
            {!!shouldShowBottomBorder && (
                <View style={bgActiveStyles}>
                    <View style={styles.ph3}>
                        <View style={styles.borderBottom} />
                    </View>
                </View>
            )}
        </>
    );
}

export default TransactionItemRow;
export type {TransactionWithOptionalSearchFields};
