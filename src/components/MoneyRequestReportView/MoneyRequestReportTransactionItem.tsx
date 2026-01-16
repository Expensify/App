import React, {useEffect, useRef} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchColumnType, TableColumnSize} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import canUseTouchScreen from '@libs/DeviceCapabilities/canUseTouchScreen';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Report, TransactionViolation} from '@src/types/onyx';
import type {TransactionWithOptionalHighlight} from './MoneyRequestReportTransactionList';

type MoneyRequestReportTransactionItemProps = {
    /** The transaction that is being displayed */
    transaction: TransactionWithOptionalHighlight;

    /** Transaction violations */
    violations?: TransactionViolation[];

    /** Report to which the transaction belongs */
    report: Report;

    /** Whether the mobile selection mode is enabled */
    isSelectionModeEnabled: boolean;

    /** Callback function triggered upon pressing a transaction checkbox. */
    toggleTransaction: (transactionID: string) => void;

    /** Callback function triggered upon pressing a transaction. */
    handleOnPress: (transactionID: string) => void;

    /** Callback function triggered upon long pressing a transaction. */
    handleLongPress: (transactionID: string) => void;

    /** Whether the transaction is selected */
    isSelected: boolean;

    /** The size of the date column */
    dateColumnSize: TableColumnSize;

    /** The size of the amount column */
    amountColumnSize: TableColumnSize;

    /** The size of the tax amount column */
    taxAmountColumnSize: TableColumnSize;

    /** Columns to show */
    columns: SearchColumnType[];

    /** Callback function that scrolls to this transaction in case it is newly added */
    scrollToNewTransaction?: (offset: number) => void;

    /** Callback function that navigates to the transaction thread */
    onArrowRightPress?: (transactionID: string) => void;
};

function MoneyRequestReportTransactionItem({
    transaction,
    violations,
    report,
    isSelectionModeEnabled,
    toggleTransaction,
    isSelected,
    handleOnPress,
    handleLongPress,
    columns,
    dateColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    scrollToNewTransaction,
    onArrowRightPress,
}: MoneyRequestReportTransactionItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const theme = useTheme();
    const isPendingDelete = isTransactionPendingDelete(transaction);
    const pendingAction = getTransactionPendingAction(transaction);

    const viewRef = useRef<View>(null);

    // This useEffect scrolls to this transaction when it is newly added to the report
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
                {({hovered}) => (
                    <TransactionItemRow
                        transactionItem={transaction}
                        violations={violations}
                        report={report}
                        isSelected={isSelected}
                        dateColumnSize={dateColumnSize}
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        shouldShowTooltip
                        shouldUseNarrowLayout={shouldUseNarrowLayout || isMediumScreenWidth}
                        shouldShowCheckbox={!!isSelectionModeEnabled || !isSmallScreenWidth}
                        onCheckboxPress={toggleTransaction}
                        columns={columns}
                        isDisabled={isPendingDelete}
                        style={[styles.p3]}
                        onButtonPress={() => {
                            handleOnPress(transaction.transactionID);
                        }}
                        onArrowRightPress={() => onArrowRightPress?.(transaction.transactionID)}
                        isHover={hovered}
                    />
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default MoneyRequestReportTransactionItem;
