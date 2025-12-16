import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import {PressableWithFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import type {SearchColumnType, TableColumnSize} from '@components/Search/types';
import ActionCell from '@components/SelectionListWithSections/Search/ActionCell';
import DateCell from '@components/SelectionListWithSections/Search/DateCell';
import StatusCell from '@components/SelectionListWithSections/Search/StatusCell';
import UserInfoCell from '@components/SelectionListWithSections/Search/UserInfoCell';
import WorkspaceCell from '@components/SelectionListWithSections/Search/WorkspaceCell';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCategoryMissing} from '@libs/CategoryUtils';
import {isSettled} from '@libs/ReportUtils';
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
import type {PersonalDetails, Report, TransactionViolation} from '@src/types/onyx';
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
};

type TransactionItemRowProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    report?: Report;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    submittedColumnSize?: TableColumnSize;
    approvedColumnSize?: TableColumnSize;
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
    areAllOptionalColumnsHidden?: boolean;
    violations?: TransactionViolation[];
    shouldShowBottomBorder?: boolean;
    onArrowRightPress?: () => void;
    shouldShowArrowRightOnNarrowLayout?: boolean;
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
    submittedColumnSize,
    approvedColumnSize,
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
    areAllOptionalColumnsHidden = false,
    violations,
    shouldShowBottomBorder,
    onArrowRightPress,
    shouldShowArrowRightOnNarrowLayout,
}: TransactionItemRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const hasCategoryOrTag = !isCategoryMissing(transactionItem?.category) || !!transactionItem.tag;
    const createdAt = getTransactionCreated(transactionItem);
    const expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isDateColumnWide = dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isSubmittedColumnWide = submittedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isApprovedColumnWide = approvedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isAmountColumnWide = amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isTaxAmountColumnWide = taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;

    const bgActiveStyles = useMemo(() => {
        if (!isSelected || !shouldHighlightItemWhenSelected) {
            return [];
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

        const isCustomUnitOutOfPolicy = isUnreportedAndHasInvalidDistanceRateTransaction(transactionItem);
        const hasFieldErrors = hasMissingSmartscanFields(transactionItem, report) || isCustomUnitOutOfPolicy;
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
            } else if (isCustomUnitOutOfPolicy) {
                error = translate('violations.customUnitOutOfPolicy');
            }
            return error;
        }
    }, [transactionItem, translate, report]);

    const columnComponent = useMemo(
        () => ({
            [CONST.SEARCH.TABLE_COLUMNS.TYPE]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.TYPE}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}
                >
                    <TypeCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.RECEIPT}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}
                >
                    <ReceiptCell
                        transactionItem={transactionItem}
                        isSelected={isSelected}
                    />
                </View>
            ),

            [CONST.SEARCH.TABLE_COLUMNS.TAG]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.TAG}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}
                >
                    <TagCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.DATE]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.DATE}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, isDateColumnWide, false, false, areAllOptionalColumnsHidden)]}
                >
                    <DateCell
                        date={createdAt}
                        showTooltip={shouldShowTooltip}
                        isLargeScreenWidth={!shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.SUBMITTED]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.SUBMITTED}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.SUBMITTED, isDateColumnWide, false, false, areAllOptionalColumnsHidden, isSubmittedColumnWide)]}
                >
                    <DateCell
                        date={report?.submitted ?? ''}
                        showTooltip={shouldShowTooltip}
                        isLargeScreenWidth={!shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.APPROVED]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.APPROVED}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.APPROVED, false, false, false, areAllOptionalColumnsHidden, false, isApprovedColumnWide)]}
                >
                    <DateCell
                        date={report?.approved ?? ''}
                        showTooltip={shouldShowTooltip}
                        isLargeScreenWidth={!shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.CATEGORY}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}
                >
                    <CategoryCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.ACTION]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.ACTION}
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
                            reportID={transactionItem.reportID}
                            policyID={report?.policyID}
                            hash={transactionItem?.hash}
                            amount={report?.total}
                        />
                    )}
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.MERCHANT}
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
            [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION)]}
                >
                    {!!description && (
                        <MerchantOrDescriptionCell
                            merchantOrDescription={description}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                            isDescription
                        />
                    )}
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.TO]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.TO}
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
            [CONST.SEARCH.TABLE_COLUMNS.FROM]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.FROM}
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
            [CONST.SEARCH.TABLE_COLUMNS.COMMENTS]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.COMMENTS}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.COMMENTS)]}
                >
                    <ChatBubbleCell
                        transaction={transactionItem}
                        isInSingleTransactionReport={isInSingleTransactionReport}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, undefined, isAmountColumnWide)]}
                >
                    <TotalCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.TAX]: (
                <View
                    key={CONST.SEARCH.TABLE_COLUMNS.TAX}
                    style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT, undefined, undefined, isTaxAmountColumnWide)]}
                >
                    <TaxCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                    />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME)]}>
                    <WorkspaceCell policyID={transactionItem.report?.policyID} />
                </View>
            ),
            [CONST.SEARCH.TABLE_COLUMNS.STATUS]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)]}>
                    <StatusCell
                        stateNum={transactionItem.report?.stateNum}
                        statusNum={transactionItem.report?.statusNum}
                    />
                </View>
            ),
        }),
        [
            StyleUtils,
            transactionItem,
            shouldShowTooltip,
            shouldUseNarrowLayout,
            isSelected,
            isDateColumnWide,
            areAllOptionalColumnsHidden,
            createdAt,
            isSubmittedColumnWide,
            report?.submitted,
            report?.approved,
            report?.policyID,
            report?.total,
            isApprovedColumnWide,
            isReportItemChild,
            onButtonPress,
            isActionLoading,
            merchant,
            description,
            isInSingleTransactionReport,
            isAmountColumnWide,
            isTaxAmountColumnWide,
        ],
    );
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
                        {!!shouldShowArrowRightOnNarrowLayout && (
                            <View style={[styles.justifyContentEnd, styles.alignItemsEnd, styles.mbHalf, styles.ml1]}>
                                <Icon
                                    src={expensicons.ArrowRight}
                                    fill={theme.icon}
                                    additionalStyles={styles.opacitySemiTransparent}
                                    small
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
                            {shouldShowErrors && (
                                <TransactionItemRowRBR
                                    transaction={transactionItem}
                                    violations={violations}
                                    report={report}
                                    containerStyles={[styles.mt2, styles.minHeight4]}
                                    missingFieldError={missingFieldError}
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
                            style={styles.mr1}
                            wrapperStyle={styles.justifyContentCenter}
                        />
                    )}
                    {columns?.map((column) => columnComponent[column as keyof typeof columnComponent]).filter(Boolean)}
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
                    {!!isLargeScreenWidth && !!onArrowRightPress && (
                        <PressableWithFeedback
                            onPress={() => onArrowRightPress?.()}
                            style={[styles.p3Half, styles.pl0half, styles.pr0half, styles.justifyContentCenter, styles.alignItemsEnd]}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={CONST.ROLE.BUTTON}
                        >
                            {({hovered}) => {
                                return (
                                    <Icon
                                        src={expensicons.ArrowRight}
                                        fill={theme.icon}
                                        additionalStyles={!hovered && styles.opacitySemiTransparent}
                                        small
                                    />
                                );
                            }}
                        </PressableWithFeedback>
                    )}
                </View>
                {shouldShowErrors && (
                    <TransactionItemRowRBR
                        transaction={transactionItem}
                        violations={violations}
                        report={report}
                        missingFieldError={missingFieldError}
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

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
export type {TransactionWithOptionalSearchFields};
