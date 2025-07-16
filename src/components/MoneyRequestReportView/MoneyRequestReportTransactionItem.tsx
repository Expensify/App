import React, {useEffect, useRef} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {TableColumnSize} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import canUseTouchScreen from '@libs/DeviceCapabilities/canUseTouchScreen';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TransactionWithOptionalHighlight} from './MoneyRequestReportTransactionList';

const allReportColumns = [
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT,
];

type MoneyRequestReportTransactionItemProps = {
    transaction: TransactionWithOptionalHighlight;
    isSelectionModeEnabled: boolean;
    toggleTransaction: (transactionID: string) => void;
    handleOnPress: (transactionID: string) => void;
    handleLongPress: (transactionID: string) => void;
    isSelected: boolean;
    dateColumnSize: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    scrollToNewTransaction?: (offset: number) => void;
};

function MoneyRequestReportTransactionItem({
    transaction,
    isSelectionModeEnabled,
    toggleTransaction,
    isSelected,
    handleOnPress,
    handleLongPress,
    dateColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    scrollToNewTransaction,
}: MoneyRequestReportTransactionItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const isPendingDelete = isTransactionPendingDelete(transaction);
    const pendingAction = getTransactionPendingAction(transaction);

    const viewRef = useRef<View>(null);

    useEffect(() => {
        if (!transaction.shouldBeHighlighted || !scrollToNewTransaction) {
            return;
        }
        viewRef?.current?.measure((x, y, width, height, pageX, pageY) => {
            scrollToNewTransaction?.(pageY);
        });
    }, [scrollToNewTransaction, transaction.shouldBeHighlighted]);

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: transaction.shouldBeHighlighted ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <PressableWithFeedback
                key={transaction.transactionID}
                onPress={() => {
                    handleOnPress(transaction.transactionID);
                }}
                accessibilityLabel={translate('iou.viewDetails')}
                role={getButtonRole(true)}
                isNested
                id={transaction.transactionID}
                style={[styles.transactionListItemStyle]}
                hoverStyle={[!isPendingDelete && styles.hoveredComponentBG, isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={() => {
                    handleLongPress(transaction.transactionID);
                }}
                disabled={isTransactionPendingDelete(transaction)}
                ref={viewRef}
                wrapperStyle={[animatedHighlightStyle, styles.userSelectNone]}
            >
                <TransactionItemRow
                    transactionItem={transaction}
                    isSelected={isSelected}
                    dateColumnSize={dateColumnSize}
                    amountColumnSize={amountColumnSize}
                    taxAmountColumnSize={taxAmountColumnSize}
                    shouldShowTooltip
                    shouldUseNarrowLayout={shouldUseNarrowLayout || isMediumScreenWidth}
                    shouldShowCheckbox={!!isSelectionModeEnabled || !isSmallScreenWidth}
                    onCheckboxPress={toggleTransaction}
                    columns={allReportColumns}
                    isDisabled={isPendingDelete}
                />
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default MoneyRequestReportTransactionItem;
