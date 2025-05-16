import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import Checkbox from '@components/Checkbox';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import type {TableColumnSize} from '@components/Search/types';
import DateCell from '@components/SelectionList/Search/DateCell';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useHover from '@hooks/useHover';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMerchant, getCreated as getTransactionCreated, isPartialMerchant} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import CategoryCell from './DataCells/CategoryCell';
import ChatBubbleCell from './DataCells/ChatBubbleCell';
import MerchantCell from './DataCells/MerchantCell';
import ReceiptCell from './DataCells/ReceiptCell';
import TagCell from './DataCells/TagCell';
import TotalCell from './DataCells/TotalCell';
import TypeCell from './DataCells/TypeCell';
import TransactionItemRowRBR from './TransactionItemRowRBR';

type ColumnComponents = {
    [key in ValueOf<typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS>]: React.ReactElement;
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
}: {
    transactionItem: TransactionWithOptionalHighlight;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    onCheckboxPress: (transactionID: string) => void;
    shouldShowCheckbox: boolean;
    columns: Array<ValueOf<typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS>>;
}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

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

        if (hovered) {
            return styles.hoveredComponentBG;
        }
    }, [hovered, isSelected, styles.activeComponentBG, styles.hoveredComponentBG]);

    const merchantName = getMerchant(transactionItem);
    const isMerchantEmpty = isPartialMerchant(merchantName);

    const columnComponent: ColumnComponents = {
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
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.ACTION]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.ASSIGNEE]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.CREATED_BY]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.DESCRIPTION]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.FROM]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.IN]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}>
                <MerchantCell
                    transactionItem={transactionItem}
                    shouldShowTooltip={shouldShowTooltip}
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                />
            </View>
        ),
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAX_AMOUNT]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TITLE]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO]: <View />,
        [CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS)]}>
                <ChatBubbleCell transaction={transactionItem} />
            </View>
        ),
        amount: undefined,
    };

    return (
        <View
            style={[styles.flex1]}
            onMouseLeave={bindHover.onMouseLeave}
            onMouseEnter={bindHover.onMouseEnter}
        >
            {shouldUseNarrowLayout ? (
                <Animated.View style={[animatedHighlightStyle]}>
                    <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.p3, bgActiveStyles]}>
                        <View style={[styles.flexRow]}>
                            {shouldShowCheckbox && (
                                <View style={[styles.mr3, styles.justifyContentCenter]}>
                                    <Checkbox
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
                                    {isMerchantEmpty && (
                                        <View style={[styles.mlAuto]}>
                                            <TotalCell
                                                transactionItem={transactionItem}
                                                shouldShowTooltip={shouldShowTooltip}
                                                shouldUseNarrowLayout={shouldUseNarrowLayout}
                                            />
                                        </View>
                                    )}
                                </View>
                                {!isMerchantEmpty && (
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                        <MerchantCell
                                            transactionItem={transactionItem}
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
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                            <View style={[styles.flexColumn]}>
                                {hasCategoryOrTag && (
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt3]}>
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
                                    containerStyles={[styles.mt3]}
                                />
                            </View>
                            <ChatBubbleCell
                                transaction={transactionItem}
                                containerStyles={[styles.mt3]}
                            />
                        </View>
                    </View>
                </Animated.View>
            ) : (
                <Animated.View style={[animatedHighlightStyle]}>
                    <View style={[styles.p3, styles.gap2, styles.expenseWidgetRadius, bgActiveStyles]}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                            <View style={[styles.mr1]}>
                                <Checkbox
                                    onPress={() => {
                                        onCheckboxPress(transactionItem.transactionID);
                                    }}
                                    accessibilityLabel={CONST.ROLE.CHECKBOX}
                                    isChecked={isSelected}
                                />
                            </View>
                            {columns.map((column) => columnComponent[column])}
                        </View>
                        <TransactionItemRowRBR transaction={transactionItem} />
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
