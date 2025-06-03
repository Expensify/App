import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import Checkbox from '@components/Checkbox';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {TableColumnSize} from '@components/Search/types';
import ActionCell from '@components/SelectionList/Search/ActionCell';
import DateCell from '@components/SelectionList/Search/DateCell';
import UserInfoCell from '@components/SelectionList/Search/UserInfoCell';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useHover from '@hooks/useHover';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCreated as getTransactionCreated, getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchPersonalDetails, SearchTransactionAction} from '@src/types/onyx/SearchResults';
import CategoryCell from './DataCells/CategoryCell';
import ChatBubbleCell from './DataCells/ChatBubbleCell';
import MerchantOrDescriptionCell, {getMerchantNameWithFallback} from './DataCells/MerchantCell';
import ReceiptCell from './DataCells/ReceiptCell';
import TagCell from './DataCells/TagCell';
import TaxCell from './DataCells/TaxCell';
import TotalCell from './DataCells/TotalCell';
import TypeCell from './DataCells/TypeCell';
import TransactionItemRowRBR from './TransactionItemRowRBR';

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

    /** Type of transaction */
    transactionType?: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>;
};

type TransactionItemRowProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    onCheckboxPress: (transactionID: string) => void;
    shouldShowCheckbox: boolean;
    columns?: Array<ValueOf<typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS>>;
    onButtonPress?: () => void;
    isParentHovered?: boolean;
    columnWrapperStyles?: ViewStyle[];
    scrollToNewTransaction?: ((offset: number) => void) | undefined;
    isChildListItem?: boolean;
    isActionLoading?: boolean;
    shouldUseAnimatedHighlight?: boolean;
};

function TransactionItemRow({
    transactionItem,
    shouldUseNarrowLayout,
    isSelected,
    shouldShowTooltip,
    dateColumnSize,
    onCheckboxPress,
    shouldShowCheckbox = false,
    columns,
    onButtonPress = () => {},
    isParentHovered,
    columnWrapperStyles,
    scrollToNewTransaction,
    isChildListItem = true,
    isActionLoading,
    shouldUseAnimatedHighlight = false,
}: TransactionItemRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const pendingAction = getTransactionPendingAction(transactionItem);
    const isPendingDelete = isTransactionPendingDelete(transactionItem);
    const viewRef = useRef<View>(null);

    const hasCategoryOrTag = !!transactionItem.category || !!transactionItem.tag;
    const createdAt = getTransactionCreated(transactionItem);

    const isDateColumnWide = dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: transactionItem.shouldBeHighlighted ?? false,
        borderRadius: variables.componentBorderRadius,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const {hovered, bind: bindHover} = useHover();
    const bgActiveStyles = useMemo(() => {
        if (isSelected) {
            return styles.activeComponentBG;
        }

        if (hovered || isParentHovered) {
            return styles.hoveredComponentBG;
        }
    }, [hovered, isParentHovered, isSelected, styles.activeComponentBG, styles.hoveredComponentBG]);

    const merchantOrDescriptionName = getMerchantNameWithFallback(transactionItem, translate, shouldUseNarrowLayout);

    useEffect(() => {
        if (!transactionItem.shouldBeHighlighted || !scrollToNewTransaction) {
            return;
        }
        viewRef?.current?.measure((x, y, width, height, pageX, pageY) => {
            scrollToNewTransaction?.(pageY);
        });
    }, [scrollToNewTransaction, transactionItem.shouldBeHighlighted]);

    const columnComponent: ColumnComponents = useMemo(
        () => ({
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}>
                    <TypeCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}>
                    <ReceiptCell
                        transactionItem={transactionItem}
                        isSelected={isSelected}
                    />
                </View>
            ),

            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}>
                    <TagCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, isDateColumnWide)]}>
                    <DateCell
                        created={createdAt}
                        showTooltip={shouldShowTooltip}
                        isLargeScreenWidth={!shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}>
                    <CategoryCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.ACTION]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    {!!transactionItem.action && (
                        <ActionCell
                            action={transactionItem.action}
                            isSelected={false}
                            isChildListItem={isChildListItem}
                            parentAction={transactionItem.parentTransactionID}
                            goToItem={onButtonPress}
                            isLoading={isActionLoading}
                        />
                    )}
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}>
                    {!!merchantOrDescriptionName && (
                        <MerchantOrDescriptionCell
                            merchantOrDescription={merchantOrDescriptionName}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                        />
                    )}
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
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
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
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
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS)]}>
                    <ChatBubbleCell transaction={transactionItem} />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)]}>
                    <TotalCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                    />
                </View>
            ),
            [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAX]: (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT)]}>
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
            isChildListItem,
            isDateColumnWide,
            isSelected,
            merchantOrDescriptionName,
            onButtonPress,
            shouldShowTooltip,
            shouldUseNarrowLayout,
            transactionItem,
        ],
    );
    const safeColumnWrapperStyle = columnWrapperStyles ?? [styles.p3, styles.expenseWidgetRadius];
    return (
        <View
            style={[styles.flex1]}
            onMouseLeave={bindHover.onMouseLeave}
            onMouseEnter={bindHover.onMouseEnter}
            ref={viewRef}
        >
            <OfflineWithFeedback pendingAction={pendingAction}>
                {shouldUseNarrowLayout ? (
                    <Animated.View style={[shouldUseAnimatedHighlight ? animatedHighlightStyle : {}]}>
                        <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.p3, styles.pt2, bgActiveStyles]}>
                            <View style={[styles.flexRow]}>
                                {shouldShowCheckbox && (
                                    <View style={[styles.mr3, styles.justifyContentCenter]}>
                                        <Checkbox
                                            disabled={isPendingDelete}
                                            onPress={() => {
                                                onCheckboxPress(transactionItem.transactionID);
                                            }}
                                            accessibilityLabel={CONST.ROLE.CHECKBOX}
                                            isChecked={isSelected}
                                        />
                                    </View>
                                )}
                                <View style={[styles.mr3]}>
                                    <ReceiptCell
                                        transactionItem={transactionItem}
                                        isSelected={isSelected}
                                    />
                                </View>
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
                                        {!merchantOrDescriptionName && (
                                            <View style={[styles.mlAuto]}>
                                                <TotalCell
                                                    transactionItem={transactionItem}
                                                    shouldShowTooltip={shouldShowTooltip}
                                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                                />
                                            </View>
                                        )}
                                    </View>
                                    {!!merchantOrDescriptionName && (
                                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                            <MerchantOrDescriptionCell
                                                merchantOrDescription={merchantOrDescriptionName}
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
                                    <TransactionItemRowRBR
                                        transaction={transactionItem}
                                        containerStyles={[styles.mt2, styles.minHeight4]}
                                    />
                                </View>
                                <ChatBubbleCell
                                    transaction={transactionItem}
                                    containerStyles={[styles.mt2]}
                                />
                            </View>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View style={[shouldUseAnimatedHighlight ? animatedHighlightStyle : {}]}>
                        <View style={[...safeColumnWrapperStyle, styles.gap2, bgActiveStyles, styles.mw100]}>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                <View style={[styles.mr1]}>
                                    <Checkbox
                                        disabled={isPendingDelete}
                                        onPress={() => {
                                            onCheckboxPress(transactionItem.transactionID);
                                        }}
                                        accessibilityLabel={CONST.ROLE.CHECKBOX}
                                        isChecked={isSelected}
                                    />
                                </View>
                                {columns?.map((column) => columnComponent[column])}
                            </View>
                            <TransactionItemRowRBR transaction={transactionItem} />
                        </View>
                    </Animated.View>
                )}
            </OfflineWithFeedback>
        </View>
    );
}

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
export type {TransactionWithOptionalSearchFields};
