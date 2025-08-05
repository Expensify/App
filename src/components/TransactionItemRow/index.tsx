import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import Checkbox from '@components/Checkbox';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import type {TableColumnSize} from '@components/Search/types';
import ActionCell from '@components/SelectionList/Search/ActionCell';
import DateCell from '@components/SelectionList/Search/DateCell';
import UserInfoCell from '@components/SelectionList/Search/UserInfoCell';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCategoryMissing} from '@libs/CategoryUtils';
import StringUtils from '@libs/StringUtils';
import {
    getDescription,
    getMerchant,
    getCreated as getTransactionCreated,
    hasMissingSmartscanFields,
    isAmountMissing,
    isMerchantMissing,
    isScanning,
    isUnreportedAndHasInvalidDistanceRateTransaction,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Report, TransactionViolation} from '@src/types/onyx';
import type {SearchPersonalDetails, SearchTransactionAction} from '@src/types/onyx/SearchResults';
import CategoryCell from './DataCells/CategoryCell';
import ChatBubbleCell from './DataCells/ChatBubbleCell';
import MerchantOrDescriptionCell from './DataCells/MerchantCell';
import ReceiptCell from './DataCells/ReceiptCell';
import TagCell from './DataCells/TagCell';
import TaxCell from './DataCells/TaxCell';
import TotalCell from './DataCells/TotalCell';
import TypeCell from './DataCells/TypeCell';
import TransactionItemRowRBRWithOnyx from './TransactionItemRowRBRWithOnyx';

type ColumnComponents = {
    [key in ValueOf<typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS>]: React.ReactElement;
};

type TransactionWithOptionalSearchFields = TransactionWithOptionalHighlight & {
    /** The action that can be performed for the transaction */
    action?: SearchTransactionAction;

    /** Function passed to the action button, triggered when the button is pressed */
    onButtonPress?: () => void;

    /** The personal details of the user requesting money */
    from?: SearchPersonalDetails;

    /** The personal details of the user paying the request */
    to?: SearchPersonalDetails;

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

    /** whether all optional columns are hidden */
    isAllOptionalColumnsHidden?: boolean;

    /** Type of transaction */
    transactionType?: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>;

    /** Precomputed violations */
    violations?: TransactionViolation[];
};

type TransactionItemRowProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    report?: Report;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    onCheckboxPress: (transactionID: string) => void;
    shouldShowCheckbox: boolean;
    columns?: Array<ValueOf<typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS>>;
    onButtonPress?: () => void;
    columnWrapperStyles?: ViewStyle[];
    isReportItemChild?: boolean;
    isActionLoading?: boolean;
    isInSingleTransactionReport?: boolean;
    isDisabled?: boolean;
};

function getMerchantName(transactionItem: TransactionWithOptionalSearchFields, translate: (key: TranslationPaths) => string) {
    const shouldShowMerchant = transactionItem.shouldShowMerchant ?? true;

    let merchant = transactionItem?.formattedMerchant ?? getMerchant(transactionItem);

    if (isScanning(transactionItem) && shouldShowMerchant) {
        merchant = translate('iou.receiptStatusTitle');
    }

    const merchantName = StringUtils.getFirstLine(merchant);
    return merchantName !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? merchantName : '';
}

function TransactionItemRow({
    transactionItem,
    report,
    shouldUseNarrowLayout,
    isSelected,
    shouldShowTooltip,
    dateColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    onCheckboxPress,
    shouldShowCheckbox = false,
    columns,
    onButtonPress = () => {},
    columnWrapperStyles,
    isReportItemChild = false,
    isActionLoading,
    isInSingleTransactionReport = false,
    isDisabled = false,
}: TransactionItemRowProps) {
    const styles = useThemeStyles();
    console.log('TransactionItemRow rendered', transactionItem, transactionItem.isAllOptionalColumnsHidden, columns);
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    const hasCategoryOrTag = !isCategoryMissing(transactionItem?.category) || !!transactionItem.tag;
    const createdAt = getTransactionCreated(transactionItem);

    const isDateColumnWide = dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isAmountColumnWide = amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isTaxAmountColumnWide = taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;

    const bgActiveStyles = useMemo(() => {
        if (!isSelected) {
            return [];
        }
        return styles.activeComponentBG;
    }, [isSelected, styles.activeComponentBG]);

    const merchant = useMemo(() => getMerchantName(transactionItem, translate), [transactionItem, translate]);
    const description = getDescription(transactionItem);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const merchantOrDescription = merchant || description;

    const missingFieldError = useMemo(() => {
        const isCustomUnitOutOfPolicy = isUnreportedAndHasInvalidDistanceRateTransaction(transactionItem);
        const hasFieldErrors = hasMissingSmartscanFields(transactionItem) || isCustomUnitOutOfPolicy;
        if (hasFieldErrors) {
            const amountMissing = isAmountMissing(transactionItem);
            const merchantMissing = isMerchantMissing(transactionItem);
            let error = '';

            if (amountMissing && merchantMissing) {
                error = translate('violations.reviewRequired');
            } else if (amountMissing) {
                error = translate('iou.missingAmount');
            } else if (merchantMissing) {
                error = translate('iou.missingMerchant');
            } else if (isCustomUnitOutOfPolicy) {
                error = translate('violations.customUnitOutOfPolicy');
            }
            return error;
        }
    }, [transactionItem, translate]);

    const columnComponent: ColumnComponents = useMemo(
        () => ({
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}
                >
                    <TypeCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}
                >
                    <ReceiptCell
                        transactionItem={transactionItem}
                        isSelected={isSelected}
                    />
                </View>
            ),

            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}
                >
                    <TagCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, isDateColumnWide, undefined, undefined, transactionItem.isAllOptionalColumnsHidden)]}
                >
                    <DateCell
                        created={createdAt}
                        showTooltip={shouldShowTooltip}
                        isLargeScreenWidth={!shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}
                >
                    <CategoryCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.ACTION]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.ACTION}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}
                >
                    {!!transactionItem.action && (
                        <ActionCell
                            action={transactionItem.action}
                            isSelected={isSelected}
                            isChildListItem={isReportItemChild}
                            parentAction={transactionItem.parentTransactionID}
                            goToItem={onButtonPress}
                            isLoading={isActionLoading}
                        />
                    )}
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}
                >
                    {!!merchant && (
                        <MerchantOrDescriptionCell
                            merchantOrDescription={merchant}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                        />
                    )}
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.DESCRIPTION]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.DESCRIPTION}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION)]}
                >
                    {!!description && (
                        <MerchantOrDescriptionCell
                            merchantOrDescription={description}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                        />
                    )}
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}
                >
                    {!!transactionItem.to && (
                        <UserInfoCell
                            accountID={transactionItem.to.accountID}
                            avatar={transactionItem.to.avatar}
                            displayName={transactionItem.formattedTo ?? transactionItem.to.displayName ?? ''}
                        />
                    )}
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.FROM]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.FROM}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}
                >
                    {!!transactionItem.from && (
                        <UserInfoCell
                            accountID={transactionItem.from.accountID}
                            avatar={transactionItem.from.avatar}
                            displayName={transactionItem.formattedFrom ?? transactionItem.from.displayName ?? ''}
                        />
                    )}
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS)]}
                >
                    <ChatBubbleCell
                        transaction={transactionItem}
                        isInSingleTransactionReport={isInSingleTransactionReport}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, undefined, isAmountColumnWide)]}
                >
                    <TotalCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAX]: (
                <View
                    key={CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAX}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT, undefined, undefined, isTaxAmountColumnWide)]}
                >
                    <TaxCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                    />
                </View>
            ),
        }),
        [
            StyleUtils,
            createdAt,
            isActionLoading,
            isReportItemChild,
            isDateColumnWide,
            isAmountColumnWide,
            isTaxAmountColumnWide,
            isInSingleTransactionReport,
            isSelected,
            merchant,
            description,
            onButtonPress,
            shouldShowTooltip,
            shouldUseNarrowLayout,
            transactionItem,
        ],
    );
    const safeColumnWrapperStyle = columnWrapperStyles ?? [styles.p3, styles.expenseWidgetRadius];
    const shouldRenderChatBubbleCell = useMemo(() => {
        return columns?.includes(CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS) ?? false;
    }, [columns]);

    if (shouldUseNarrowLayout) {
        return (
            <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.p3, styles.pt2, bgActiveStyles]}>
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
                            wrapperStyle={styles.justifyContentCenter}
                        />
                    )}
                    <ReceiptCell
                        transactionItem={transactionItem}
                        isSelected={isSelected}
                        style={styles.mr3}
                    />
                    <View style={[styles.flex2, styles.flexColumn, styles.justifyContentEvenly]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.minHeight5, styles.maxHeight5]}>
                            <DateCell
                                created={createdAt}
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
                                />
                                <TotalCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart]}>
                    <View style={[styles.flexColumn, styles.flex1]}>
                        {hasCategoryOrTag && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt2, styles.minHeight4]}>
                                <CategoryCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                                <TagCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                        )}
                        <TransactionItemRowRBRWithOnyx
                            transaction={transactionItem}
                            report={report}
                            containerStyles={[styles.mt2, styles.minHeight4]}
                            missingFieldError={missingFieldError}
                        />
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
        );
    }

    return (
        <View style={[...safeColumnWrapperStyle, styles.flex1, styles.gap2, bgActiveStyles, styles.mw100]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <Checkbox
                    disabled={isDisabled}
                    onPress={() => {
                        onCheckboxPress(transactionItem.transactionID);
                    }}
                    accessibilityLabel={CONST.ROLE.CHECKBOX}
                    isChecked={isSelected}
                    style={styles.mr1}
                    wrapperStyle={styles.justifyContentCenter}
                />
                {columns?.map((column) => columnComponent[column])}
            </View>
            <TransactionItemRowRBRWithOnyx
                transaction={transactionItem}
                report={report}
                missingFieldError={missingFieldError}
            />
        </View>
    );
}

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
export type {TransactionWithOptionalSearchFields};
