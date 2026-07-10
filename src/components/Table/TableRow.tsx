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

import type {GestureResponderEvent, PressableStateCallbackType} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import {getRowAccessibilityProps, shouldUseTableSemantics} from './tableAccessibility';
import {useTableContext} from './TableContext';

type TableRowProps = Omit<PressableWithFeedbackProps, 'accessible'> & {
    /** When true, indicates that the view is an accessibility element.  By default, all the rows are accessible. */
    accessible?: boolean;

    /** Whether or not the table row is pressable or not */
    interactive: boolean;

    /** Whether or not the table row should be disabled */
    disabled?: boolean;

    /** The index of the row in the table */
    rowIndex: number;

    /** Attributes for when the client is offline and there is an error related to the table row */
    offlineWithFeedback?: OfflineWithFeedbackProps;

    /** Custom element to render in place of the selection checkbox (e.g. a lock icon for non-selectable rows) */
    checkboxReplacementElement?: React.ReactNode;

    /** Optional content rendered below the row grid */
    rowFooter?: React.ReactNode;
};

export default function TableRow({
    children,
    accessible,
    rowIndex,
    disabled,
    sentryLabel,
    interactive,
    onPress,
    offlineWithFeedback,
    checkboxReplacementElement,
    rowFooter,
    ...props
}: TableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {processedData, columns, shouldUseNarrowTableLayout, tableMethods, selectionEnabled, isMobileSelectionEnabled, shouldEnableSelectionInNarrowPaneModal = false} = useTableContext();

    // Tables inside a narrow pane modal (RHP) opt into keying the selection UX off the real screen size (isSmallScreenWidth),
    // because shouldUseNarrowLayout is always true in an RHP and would otherwise suppress selection entirely. All other
    // tables keep the original shouldUseNarrowLayout behavior. Visual layout still uses shouldUseNarrowTableLayout.
    const selectionUsesNarrowLayout = shouldEnableSelectionInNarrowPaneModal ? isSmallScreenWidth : shouldUseNarrowLayout;
    const shouldEnableMobileSelectionLongPress = isSmallScreenWidth && (shouldEnableSelectionInNarrowPaneModal || !isInNarrowPaneModal);

    const item = processedData.at(rowIndex);
    const rowCount = processedData.length;
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);
    const gridTemplateColumns = columns.map((column) => (column.width ? `${column.width}px` : '1fr'));
    const isSelectionCheckboxVisible = selectionEnabled && (isMobileSelectionEnabled || !selectionUsesNarrowLayout);

    const isDisabled = !!disabled;
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === rowCount - 1;

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
            shouldShowErrorMessages={false}
        >
            <PressableWithFeedback
                accessible={accessible}
                accessibilityLabel="row"
                style={tableRowPressableStyles}
                sentryLabel={sentryLabel}
                interactive={interactive}
                disabled={isDisabled}
                hoverStyle={tableRowPressableHoverStyle}
                pressDimmingValue={!interactive ? undefined : 1}
                role={interactive ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
                {...getRowAccessibilityProps(isTableSemanticsEnabled, rowIndex)}
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
                {(state) => (
                    <Animated.View style={tableRowContentContainerStyles}>
                        <View style={tableRowContentStyles}>
                            {!!isSelectionCheckboxVisible &&
                                (checkboxReplacementElement ?? (
                                    <Checkbox
                                        shouldStopMouseDownPropagation
                                        containerStyle={styles.m0}
                                        style={styles.flex1}
                                        isChecked={!!item.selected}
                                        disabled={!!item.disabled || !!item.isSelectionDisabled}
                                        accessibilityLabel={translate('common.select')}
                                        onPress={(event) => handleCheckboxPress(event)}
                                    />
                                ))}
                            {renderChildren(state)}
                        </View>

                        {rowFooter}

                        {!!offlineWithFeedback?.errors && (
                            <ErrorMessageRow
                                errors={offlineWithFeedback.errors}
                                dismissError={offlineWithFeedback.dismissError}
                                onDismiss={offlineWithFeedback.onClose}
                            />
                        )}
                    </Animated.View>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}
