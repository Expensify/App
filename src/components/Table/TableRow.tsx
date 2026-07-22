import Checkbox from '@components/Checkbox';
import ErrorMessageRow from '@components/ErrorMessageRow';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

import type {GestureResponderEvent, PressableStateCallbackType} from 'react-native';

import React, {useContext} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import {isDataColumn, useTableContext} from './TableContext';
import {HEADER_ROW_INDEX, hasErrorRow, TableRowActionContext, TableSemanticsContext, useIsInTableGrid} from './TableSemantics';

type TableRowProps = Omit<PressableWithFeedbackProps, 'accessible'> & {
    /** The row's accessible name, used when the row is a button rather than part of a table */
    accessibilityLabel: string;

    /** Short name identifying the row, used to say what the selection checkbox selects. Defaults to the row's name. */
    selectionLabel?: string;

    /** Whether or not the table row is pressable or not */
    interactive: boolean;

    /** Whether or not the table row should be disabled */
    disabled?: boolean;

    /** The index of the row in the table */
    rowIndex: number;

    /** Where the row leads. Supplying it turns the row's affordance into a real link, openable in a new tab. */
    route?: Route;

    /** Offline attributes a row may set. Errors are absent because the table reads them from the row's data to count them. */
    offlineWithFeedback?: Pick<OfflineWithFeedbackProps, 'pendingAction' | 'onClose' | 'dismissError' | 'shouldHideOnDelete'>;

    /** Custom element to render in place of the selection checkbox (e.g. a lock icon for non-selectable rows) */
    checkboxReplacementElement?: React.ReactNode;
};

export default function TableRow({
    children,
    accessibilityLabel,
    selectionLabel,
    rowIndex,
    route,
    disabled,
    sentryLabel,
    interactive,
    onPress,
    offlineWithFeedback,
    checkboxReplacementElement,
    ...props
}: TableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {
        processedData,
        columns,
        shouldUseNarrowTableLayout,
        tableMethods,
        selectionEnabled,
        isMobileSelectionEnabled,
        renderRowFooter,
        shouldEnableSelectionInNarrowPaneModal = false,
    } = useTableContext();
    const {isInTableGrid, dataRowIndexes} = useContext(TableSemanticsContext);

    // Tables inside a narrow pane modal (RHP) opt into keying the selection UX off the real screen size (isSmallScreenWidth),
    // because shouldUseNarrowLayout is always true in an RHP and would otherwise suppress selection entirely. All other
    // tables keep the original shouldUseNarrowLayout behavior. Visual layout still uses shouldUseNarrowTableLayout.
    const selectionUsesNarrowLayout = shouldEnableSelectionInNarrowPaneModal ? isSmallScreenWidth : shouldUseNarrowLayout;
    const shouldEnableMobileSelectionLongPress = isSmallScreenWidth && (shouldEnableSelectionInNarrowPaneModal || !isInNarrowPaneModal);

    const item = processedData.at(rowIndex);
    const rowCount = processedData.length;
    const gridTemplateColumns = columns.map((column) => (column.width ? `${column.width}px` : '1fr'));
    const isSelectionCheckboxVisible = selectionEnabled && (isMobileSelectionEnabled || !selectionUsesNarrowLayout);

    const isDisabled = !!disabled;
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === rowCount - 1;

    const cellRole = isInTableGrid ? CONST.ROLE.CELL : undefined;
    const hasErrors = hasErrorRow(item);
    const dataRowIndex = dataRowIndexes.at(rowIndex) ?? HEADER_ROW_INDEX;
    const exposedColumnCount = columns.filter(isDataColumn).length + (isSelectionCheckboxVisible ? 1 : 0);
    const rowAction = {onPress, isDisabled: !!disabled || !interactive, route};
    const selectLabel = isInTableGrid ? `${translate('common.select')} ${selectionLabel ?? accessibilityLabel}` : translate('common.select');

    if (selectionEnabled && isSelectionCheckboxVisible) {
        gridTemplateColumns.unshift(`${variables.tableCheckboxColumnWidth}px`);
    }

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: !!item?.shouldAnimateInHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.transparent,
    });

    if (!item) {
        return null;
    }

    const tableRowPressableStyles = [
        styles.mh5,
        styles.highlightBG,
        styles.userSelectNone,
        !isFirstRow && styles.borderTop,
        isLastRow && styles.tableBottomRadius,
        item.selected && [styles.activeComponentBG, {borderColor: theme.buttonHoveredBG}],
        shouldUseNarrowTableLayout ? styles.tableRowHeightCompact : styles.tableRowHeight,
    ];

    const tableRowContentContainerStyles = [
        styles.flex1,
        styles.gap3,
        animatedHighlightStyle,
        isLastRow && styles.tableBottomRadius,
        shouldUseNarrowTableLayout ? styles.ph4 : styles.ph3,
        shouldUseNarrowTableLayout ? styles.pv4 : styles.pv2,
    ];

    const tableRowContentStyles = [
        styles.flex1,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.alignContentCenter,
        styles.gap3,
        styles.dFlex,
        // Use Grid on web when available (will override flex if supported)
        !shouldUseNarrowTableLayout && [styles.dGrid, {gridTemplateColumns: gridTemplateColumns.join(' ')}],
    ];

    const tableRowPressableHoverStyle = (() => {
        if (isDisabled || !interactive) {
            return undefined;
        }
        if (item.selected) {
            return styles.activeComponentBG;
        }
        return styles.hoveredComponentBG;
    })();

    const renderChildren = (state: PressableStateCallbackType) => {
        if (typeof children === 'function') {
            return children(state);
        }

        return children;
    };

    const handleCheckboxPress = (event?: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (event && 'shiftKey' in event && event.shiftKey) {
            tableMethods.handleMultipleRowSelection(item.keyForList);
            return;
        }

        tableMethods.handleSingleRowSelection(item.keyForList);
    };

    const handleRowPress = (event?: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (isDisabled || !interactive) {
            return;
        }

        if (!selectionUsesNarrowLayout || !isMobileSelectionEnabled || !selectionEnabled) {
            onPress?.();
            return;
        }

        if (item.disabled) {
            return;
        }

        if (!item.isSelectionDisabled) {
            handleCheckboxPress(event);
        }
    };

    const handleRowLongPress = () => {
        if (isDisabled || item.disabled || !selectionEnabled || isMobileSelectionEnabled || !shouldEnableMobileSelectionLongPress || !interactive || item.isSelectionDisabled) {
            return;
        }

        tableMethods.setMobileSelectionModalRowKey(item.keyForList);
    };

    return (
        <OfflineWithFeedback
            {...offlineWithFeedback}
            errors={item.errors}
            shouldShowErrorMessages={false}
        >
            <TableRowPressable
                rowIndex={rowIndex}
                accessibilityLabel={accessibilityLabel}
                id={`table-row-${item.keyForList}`}
                style={tableRowPressableStyles}
                sentryLabel={sentryLabel}
                interactive={interactive}
                disabled={isDisabled}
                hoverStyle={tableRowPressableHoverStyle}
                pressDimmingValue={!interactive ? undefined : 1}
                onMouseDown={(e) => {
                    const target = e?.target;

                    if (!(target instanceof HTMLElement)) {
                        e.preventDefault();
                        return;
                    }

                    if (target.tagName === CONST.ELEMENT_NAME.INPUT) {
                        return;
                    }

                    if (target.closest('[role="switch"]') || target.closest('[role="checkbox"]')) {
                        e.preventDefault();
                        return;
                    }

                    e.preventDefault();
                }}
                onPress={(event) => handleRowPress(event)}
                onLongPress={handleRowLongPress}
                {...props}
            >
                {(state) => {
                    // Each of these renders below the row, and inside a table each is a row of its own.
                    const extraRows = [
                        {key: 'footer', content: renderRowFooter?.(item)},
                        {
                            key: 'errors',
                            content: hasErrors && (
                                <ErrorMessageRow
                                    errors={item.errors}
                                    dismissError={offlineWithFeedback?.dismissError}
                                    onDismiss={offlineWithFeedback?.onClose}
                                />
                            ),
                        },
                    ].filter((extraRow) => !!extraRow.content);

                    const selectionControl = checkboxReplacementElement ?? (
                        <Checkbox
                            shouldStopMouseDownPropagation
                            containerStyle={styles.m0}
                            style={styles.flex1}
                            isChecked={!!item.selected}
                            disabled={!!item.disabled || !!item.isSelectionDisabled}
                            accessibilityLabel={selectLabel}
                            onPress={(event) => handleCheckboxPress(event)}
                        />
                    );

                    return (
                        // Chrome keeps this layout wrapper in the accessibility tree, so without `presentation` it would own the rows.
                        <Animated.View
                            style={tableRowContentContainerStyles}
                            role={isInTableGrid ? CONST.ROLE.PRESENTATION : undefined}
                        >
                            <View
                                style={tableRowContentStyles}
                                role={isInTableGrid ? CONST.ROLE.ROW : undefined}
                                aria-rowindex={isInTableGrid ? dataRowIndex : undefined}
                            >
                                {!!isSelectionCheckboxVisible && (isInTableGrid ? <View role={cellRole}>{selectionControl}</View> : selectionControl)}
                                <TableRowActionContext.Provider value={rowAction}>{renderChildren(state)}</TableRowActionContext.Provider>
                            </View>

                            {extraRows.map((extraRow, extraRowIndex) =>
                                isInTableGrid ? (
                                    <View
                                        key={extraRow.key}
                                        role={CONST.ROLE.ROW}
                                        aria-rowindex={dataRowIndex + extraRowIndex + 1}
                                    >
                                        <View
                                            role={cellRole}
                                            aria-colspan={exposedColumnCount}
                                        >
                                            {extraRow.content}
                                        </View>
                                    </View>
                                ) : (
                                    <React.Fragment key={extraRow.key}>{extraRow.content}</React.Fragment>
                                ),
                            )}
                        </Animated.View>
                    );
                }}
            </TableRowPressable>
        </OfflineWithFeedback>
    );
}

type TableRowPressableProps = Omit<PressableWithFeedbackProps, 'accessible' | 'accessibilityLabel'> & {
    /** The row's accessible name, used when the row is a button rather than part of a table */
    accessibilityLabel: string;

    /** The index of the row in the table */
    rowIndex: number;

    /** Whether the row is pressable */
    interactive: boolean;
};

/** Inside a table this is only the pressable shell that the rows render within; elsewhere it is the named button. */
function TableRowPressable({accessibilityLabel, rowIndex, interactive, sentryLabel, ...props}: TableRowPressableProps) {
    const isInTableGrid = useIsInTableGrid();

    if (isInTableGrid) {
        return (
            <PressableWithFeedback
                accessible={false}
                focusable={false}
                role={CONST.ROLE.PRESENTATION}
                interactive={interactive}
                sentryLabel={sentryLabel}
                {...props}
            />
        );
    }

    return (
        <PressableWithFeedback
            accessibilityLabel={accessibilityLabel}
            role={interactive ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
            interactive={interactive}
            sentryLabel={sentryLabel}
            {...props}
        />
    );
}
