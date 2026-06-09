import React from 'react';
import type {PressableStateCallbackType} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import ErrorMessageRow from '@components/ErrorMessageRow';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import CONST from '@src/CONST';
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

    /** Whether or not the table row is loading */
    isLoading?: boolean;

    /** Whether or not the row should animate in highlighted */
    shouldAnimateInHighlight?: boolean;

    /** The loading component to render within the table row when the row is loading */
    LoadingComponent?: React.ComponentType;

    /** The reason attributes if the table row is loading */
    skeletonReasonAttributes: SkeletonSpanReasonAttributes;

    /** Attributes for when the client is offline and there is an error related to the table row */
    offlineWithFeedback?: OfflineWithFeedbackProps;
};

export default function TableRow({
    children,
    accessible,
    rowIndex,
    disabled,
    sentryLabel,
    interactive,
    isLoading,
    shouldAnimateInHighlight,
    skeletonReasonAttributes,
    LoadingComponent,
    onPress,
    offlineWithFeedback,
    ...props
}: TableRowProps) {
    useSkeletonSpan('TableRowSkeleton', skeletonReasonAttributes);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {processedData, columns, shouldUseNarrowTableLayout, tableMethods, selectionEnabled, isMobileSelectionEnabled} = useTableContext();

    const item = processedData.at(rowIndex);
    const rowCount = processedData.length;
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === rowCount - 1;
    const isDisabled = !!disabled || !!isLoading;
    const gridTemplateColumns = columns.map((column) => (column.width ? `${column.width}px` : '1fr'));
    const isSelectionCheckboxVisible = selectionEnabled && (isMobileSelectionEnabled || !shouldUseNarrowLayout);

    if (selectionEnabled && isSelectionCheckboxVisible) {
        gridTemplateColumns.unshift(`${variables.tableCheckboxColumnWidth}px`);
    }

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: !!shouldAnimateInHighlight,
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
        shouldUseNarrowTableLayout ? styles.ph4 : styles.ph3,
        shouldUseNarrowTableLayout && !isLoading && styles.pv4,
        !shouldUseNarrowTableLayout && !isLoading && styles.pv2,
        animatedHighlightStyle,
        isLastRow && styles.tableBottomRadius,
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

    const handleCheckboxPress = (event?: MouseEvent) => {
        if (event && event.shiftKey) {
            tableMethods.handleMultipleRowSelection(item.keyForList);
            return;
        }

        tableMethods.handleSingleRowSelection(item.keyForList);
    };

    const handleRowPress = (event?: MouseEvent) => {
        if (isDisabled || !interactive) {
            return;
        }

        if (shouldUseNarrowLayout && isMobileSelectionEnabled) {
            handleCheckboxPress(event);
            return;
        }

        onPress?.();
    };

    const handleRowLongPress = () => {
        if (isDisabled || !selectionEnabled || isMobileSelectionEnabled || !shouldUseNarrowLayout || !interactive) {
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
                onPress={(event) => handleRowPress(event as unknown as MouseEvent)}
                onLongPress={handleRowLongPress}
                {...props}
            >
                {(state) => (
                    <Animated.View style={tableRowContentContainerStyles}>
                        {!!isLoading && LoadingComponent ? (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                                <SkeletonViewContentLoader
                                    width="100%"
                                    backgroundColor={theme.skeletonLHNIn}
                                    foregroundColor={theme.skeletonLHNOut}
                                    height={variables.tableSkeletonHeight}
                                >
                                    <LoadingComponent />
                                </SkeletonViewContentLoader>
                            </View>
                        ) : (
                            <View style={tableRowContentStyles}>
                                {!!isSelectionCheckboxVisible && (
                                    <Checkbox
                                        shouldStopMouseDownPropagation
                                        containerStyle={styles.m0}
                                        style={styles.flex1}
                                        disabled={item.disabled}
                                        isChecked={!!item.selected}
                                        accessibilityLabel={translate('common.select')}
                                        onPress={(event) => handleCheckboxPress(event as unknown as MouseEvent)}
                                    />
                                )}
                                {renderChildren(state)}
                            </View>
                        )}

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
