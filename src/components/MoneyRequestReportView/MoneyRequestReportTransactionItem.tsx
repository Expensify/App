import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchColumnType, TableColumnSize} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import {useEditingCellState} from '@components/TransactionItemRow/EditableCell';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCopyableTextRowPress from '@hooks/useCopyableTextRowPress';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionInlineEdit from '@hooks/useTransactionInlineEdit';

import ControlSelection from '@libs/ControlSelection';
import canUseTouchScreen from '@libs/DeviceCapabilities/canUseTouchScreen';
import {hasFlexColumn} from '@libs/SearchUIUtils';
import {COPYABLE_ROW_DATA_SET} from '@libs/SelectionScraper';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {CardList, Policy, PolicyCategories, PolicyTagLists, Report, TransactionViolations} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef, useState} from 'react';

import type {TransactionWithOptionalHighlight} from './MoneyRequestReportTransactionList';

type MoneyRequestReportTransactionItemProps = {
    /** The transaction that is being displayed */
    transaction: TransactionWithOptionalHighlight;

    /** Pre-filtered violations for this transaction. Computed once at the parent so each row doesn't subscribe to Onyx individually. */
    violations: TransactionViolations;

    /** Report to which the transaction belongs */
    report: Report;

    /** Policy to which the transaction belongs */
    policy: OnyxEntry<Policy>;

    /** Categories for the policy to which the transaction belongs */
    policyCategories?: PolicyCategories;

    /** Tag lists for the policy to which the transaction belongs */
    policyTagLists?: PolicyTagLists;

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

    /** The size of the posted column */
    postedColumnSize: TableColumnSize;

    /** The size of the amount column */
    amountColumnSize: TableColumnSize;

    /** The size of the tax amount column */
    taxAmountColumnSize: TableColumnSize;

    /** Columns to show */
    columns: SearchColumnType[];

    /** Callback function that navigates to the transaction thread */
    onArrowRightPress?: (transactionID: string) => void;

    /** Whether this transaction should be highlighted as newly added */
    shouldBeHighlighted: boolean;

    /** List of cards for the user */
    nonPersonalAndWorkspaceCards: CardList;

    /** Whether this is the last item in the list */
    isLastItem?: boolean;

    /** Whether the list is horizontally scrollable */
    shouldScrollHorizontally?: boolean;

    /** Precomputed transaction-thread report ID for this transaction. Lets the RBR row early-return for clean rows
     * instead of mounting the heavy RBR inner; the parent computes it once so rows don't scan report actions individually. */
    transactionThreadReportID?: string;
};

// `shouldBeHighlighted` is omitted: the highlight animation is computed by the outer component (so its timeline
// survives the narrow↔wide swap) and reaches the body as `animatedHighlightStyle`.
type MoneyRequestReportTransactionItemBodyProps = Omit<MoneyRequestReportTransactionItemProps, 'shouldBeHighlighted'> & {
    /** Inline-edit values from `useTransactionInlineEdit`. Undefined on narrow layouts where the hook is skipped. */
    inlineEdit?: InlineEditValues;

    /** Highlight animation style, computed by the parent so its state survives the narrow↔wide swap on resize. */
    animatedHighlightStyle: ReturnType<typeof useAnimatedHighlightStyle>;

    /** Whether to skip deferring the RBR content. */
    shouldSkipDeferRBR?: boolean;
};

function getPressEventTarget(target: unknown): EventTarget | null {
    if (typeof EventTarget === 'undefined' || !(target instanceof EventTarget)) {
        return null;
    }

    return target;
}

function MoneyRequestReportTransactionItemBody({
    transaction,
    violations,
    report,
    policy,
    policyCategories,
    policyTagLists,
    isSelectionModeEnabled,
    toggleTransaction,
    isSelected,
    handleOnPress,
    handleLongPress,
    columns,
    dateColumnSize,
    postedColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    onArrowRightPress,
    nonPersonalAndWorkspaceCards,
    isLastItem = false,
    shouldScrollHorizontally = false,
    transactionThreadReportID,
    inlineEdit,
    animatedHighlightStyle,
    shouldSkipDeferRBR = false,
}: MoneyRequestReportTransactionItemBodyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isEditingCell, wasRecentlyEditingCell} = useEditingCellState();
    const [shouldDisableHoverStyle, setShouldDisableHoverStyle] = useState(false);

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const shouldUseMediumNarrowLayout = isMediumScreenWidth && !shouldScrollHorizontally;
    const shouldUseNarrowTransactionRow = shouldUseNarrowLayout || shouldUseMediumNarrowLayout;
    let transactionRowStyle: StyleProp<ViewStyle> = [styles.ph3, styles.noBorderRadius];
    if (shouldUseNarrowLayout) {
        transactionRowStyle = [styles.p4, styles.noBorderRadius];
    } else if (shouldUseMediumNarrowLayout) {
        transactionRowStyle = [styles.p3, styles.pv2, styles.noBorderRadius];
    }
    const isPendingDelete = isTransactionPendingDelete(transaction);
    const pendingAction = getTransactionPendingAction(transaction);

    // Keep this ref local so React Compiler can prove the after-render event mutations are safe.
    const wasEditingOnMouseDownRef = useRef(false);
    const wasPressInOnCopyableTextRef = useRef(false);
    const {markMouseDownOnCopyableText, shouldSuppressCopyableTextRowPress} = useCopyableTextRowPress();

    useEffect(() => {
        if (!wasRecentlyEditingCell) {
            return;
        }
        queueMicrotask(() => setShouldDisableHoverStyle(true));
    }, [wasRecentlyEditingCell]);

    const handleMouseDown = (e?: React.MouseEvent) => {
        wasEditingOnMouseDownRef.current = isEditingCell;
        const isCopyableTarget = markMouseDownOnCopyableText(e?.target);

        if (!isEditingCell && !isCopyableTarget) {
            e?.preventDefault();
        }
    };

    const handleHoverIn = () => setShouldDisableHoverStyle(false);

    const handlePress: React.ComponentProps<typeof PressableWithFeedback>['onPress'] = () => {
        if (shouldSuppressCopyableTextRowPress()) {
            return;
        }

        // Prevent row press from firing while a cell is being inline-edited (e.g. pressing Space would otherwise open the expense)
        // See https://github.com/Expensify/App/issues/88646 for more details
        if (isEditingCell) {
            return;
        }
        // If a cell was being edited when the user tapped the row, suppress navigation
        // so the second tap doesn't immediately open the transaction detail.
        if (wasEditingOnMouseDownRef.current) {
            wasEditingOnMouseDownRef.current = false;
            return;
        }
        handleOnPress(transaction.transactionID);
    };

    const handlePressIn: React.ComponentProps<typeof PressableWithFeedback>['onPressIn'] = (event) => {
        wasEditingOnMouseDownRef.current = wasEditingOnMouseDownRef.current || isEditingCell;
        wasPressInOnCopyableTextRef.current = false;
        // Selection only needs to be blocked for touch interactions; desktop mouse selection is handled by onMouseDown.
        if (!canUseTouchScreen()) {
            return;
        }

        // Let copyable values use native long-press/drag selection instead of applying the global selection blocker.
        const isCopyableTarget = markMouseDownOnCopyableText(getPressEventTarget(event?.target));
        wasPressInOnCopyableTextRef.current = isCopyableTarget;
        if (isCopyableTarget) {
            return;
        }

        // Preserve the existing row behavior for non-copyable touch targets.
        ControlSelection.block();
    };

    const handlePressableLongPress = () => {
        // Let touch-web long presses on copyable values complete native text selection without opening row actions.
        if (wasPressInOnCopyableTextRef.current) {
            return;
        }
        handleLongPress(transaction.transactionID);
    };

    const handlePressOut = () => {
        wasPressInOnCopyableTextRef.current = false;
        ControlSelection.unblock();
    };

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            style={!shouldUseNarrowLayout && isLastItem && [styles.tableBottomRadius, styles.overflowHidden]}
        >
            <PressableWithFeedback
                key={transaction.transactionID}
                onPress={handlePress}
                accessibilityLabel={translate('iou.viewDetails')}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.MONEY_REQUEST_REPORT_TRANSACTION_ITEM}
                role={getButtonRole(true)}
                isNested
                shouldAllowTextSelection
                id={transaction.transactionID}
                style={[styles.transactionListItemStyle, !shouldUseNarrowLayout ? StyleUtils.getSearchTableRowPressableStyle(isLastItem, isSelected) : styles.noBorderRadius]}
                hoverStyle={[!isPendingDelete && !shouldDisableHoverStyle && styles.hoveredComponentBG, isSelected && styles.activeComponentBG]}
                dataSet={COPYABLE_ROW_DATA_SET}
                onMouseDown={handleMouseDown}
                onHoverIn={handleHoverIn}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onLongPress={handlePressableLongPress}
                disabled={isTransactionPendingDelete(transaction)}
                wrapperStyle={[animatedHighlightStyle, shouldUseNarrowLayout && !isLastItem && StyleUtils.getSelectedBorderBottomStyle(isSelected)]}
            >
                {({hovered}) => (
                    <TransactionItemRow
                        transactionItem={transaction}
                        violations={violations}
                        report={report}
                        policy={policy}
                        policyCategories={policyCategories}
                        policyTagLists={policyTagLists}
                        isSelected={isSelected}
                        dateColumnSize={dateColumnSize}
                        postedColumnSize={postedColumnSize}
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        shouldShowTooltip
                        shouldUseNarrowLayout={shouldUseNarrowTransactionRow}
                        shouldUseFullHeightEditableCellHoverTarget={!shouldUseNarrowTransactionRow}
                        shouldShowCheckbox={!!isSelectionModeEnabled || !isSmallScreenWidth}
                        onCheckboxPress={toggleTransaction}
                        columns={columns}
                        isDisabled={isPendingDelete}
                        style={transactionRowStyle}
                        onButtonPress={() => {
                            handleOnPress(transaction.transactionID);
                        }}
                        onArrowRightPress={() => onArrowRightPress?.(transaction.transactionID)}
                        isHover={hovered}
                        nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                        shouldRemoveTotalColumnFlex={hasFlexColumn(columns)}
                        canEditDate={inlineEdit?.canEditDate}
                        canEditMerchant={inlineEdit?.canEditMerchant}
                        canEditDescription={inlineEdit?.canEditDescription}
                        canEditCategory={inlineEdit?.canEditCategory}
                        canEditAmount={inlineEdit?.canEditAmount}
                        canEditTag={inlineEdit?.canEditTag}
                        onEditDate={inlineEdit?.onEditDate}
                        onEditMerchant={inlineEdit?.onEditMerchant}
                        onEditDescription={inlineEdit?.onEditDescription}
                        onEditCategory={inlineEdit?.onEditCategory}
                        onEditAmount={inlineEdit?.onEditAmount}
                        onEditTag={inlineEdit?.onEditTag}
                        shouldSkipDeferRBR={shouldSkipDeferRBR}
                        transactionThreadReportID={transactionThreadReportID}
                    />
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

type InlineEditValues = ReturnType<typeof useTransactionInlineEdit>;

function MoneyRequestReportTransactionItemWithInlineEdit(props: Omit<MoneyRequestReportTransactionItemBodyProps, 'inlineEdit'>) {
    const inlineEdit = useTransactionInlineEdit({
        transactionID: props.transaction.transactionID,
    });

    return (
        <MoneyRequestReportTransactionItemBody
            {...props}
            inlineEdit={inlineEdit}
        />
    );
}

function MoneyRequestReportTransactionItem(props: MoneyRequestReportTransactionItemProps) {
    const {shouldBeHighlighted} = props;
    const {isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const theme = useTheme();
    // Mirrors the layout check inside TransactionItemRow so the narrow body never pays for useTransactionInlineEdit.
    const isNarrowLayout = shouldUseNarrowLayout || (isMediumScreenWidth && !props.shouldScrollHorizontally);

    // Hoisted out of the body so the highlight animation timeline survives the narrow↔wide
    // component-type swap caused by browser resize.
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: shouldUseNarrowLayout ? variables.componentBorderRadius : 0,
        shouldHighlight: shouldBeHighlighted,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
        shouldApplyOtherStyles: !shouldUseNarrowLayout,
    });

    if (isNarrowLayout) {
        return (
            <MoneyRequestReportTransactionItemBody
                {...props}
                animatedHighlightStyle={animatedHighlightStyle}
                shouldSkipDeferRBR
            />
        );
    }

    return (
        <MoneyRequestReportTransactionItemWithInlineEdit
            {...props}
            animatedHighlightStyle={animatedHighlightStyle}
            shouldSkipDeferRBR
        />
    );
}

export default MoneyRequestReportTransactionItem;
