import React from 'react';
import type {GestureResponderEvent, KeyboardEvent, PressableStateCallbackType} from 'react-native';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
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

    /** The index of the row in the table */
    rowIndex: number;

    /** Whether or not the table row is loading */
    isLoading?: boolean;

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
    sentryLabel,
    interactive,
    isLoading,
    skeletonReasonAttributes,
    LoadingComponent,
    onPress,
    offlineWithFeedback,
    ...props
}: TableRowProps) {
    useSkeletonSpan('TableRowSkeleton', skeletonReasonAttributes);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {processedData, columns, shouldUseNarrowTableLayout, tableMethods, selectionEnabled} = useTableContext();

    const item = processedData[rowIndex];
    const rowCount = processedData.length;
    const isLastRow = rowIndex === rowCount - 1;
    const isInteractive = interactive && !isLoading;
    const gridTemplateColumns = columns.map((column) => (column.width ? `${column.width}px` : '1fr'));

    if (selectionEnabled) {
        gridTemplateColumns.unshift(`${variables.tableCheckboxColumnWidth}px`);
    }

    const tableRowPressableStyles = [
        styles.mh5,
        styles.flexRow,
        styles.highlightBG,
        styles.alignItemsCenter,
        isInteractive && styles.userSelectNone,
        shouldUseNarrowTableLayout ? styles.ph4 : styles.ph3,
        shouldUseNarrowTableLayout && !isLoading && styles.pv4,
        !shouldUseNarrowTableLayout && !isLoading && styles.pv2,
        isLastRow ? styles.tableBottomRadius : styles.borderBottom,
        item.selected && [styles.activeComponentBG, {borderColor: theme.buttonHoveredBG}],
        shouldUseNarrowTableLayout ? styles.tableRowHeightCompact : styles.tableRowHeight,
    ];

    const tableRowContentStyles = [
        styles.flex1,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.gap3,
        styles.dFlex,
        // Use Grid on web when available (will override flex if supported)
        !shouldUseNarrowTableLayout && [styles.dGrid, {gridTemplateColumns: gridTemplateColumns.join(' ')}],
    ];

    const tableRowPressableHoverStyle = (() => {
        if (!isInteractive) {
            return undefined;
        } else if (item.selected) {
            return styles.activeComponentBG;
        } else {
            return styles.hoveredComponentBG;
        }
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

    return (
        <OfflineWithFeedback {...offlineWithFeedback}>
            <PressableWithFeedback
                accessible={accessible}
                accessibilityLabel="row"
                style={tableRowPressableStyles}
                sentryLabel={sentryLabel}
                interactive={isInteractive}
                hoverStyle={tableRowPressableHoverStyle}
                pressDimmingValue={isInteractive ? undefined : 1}
                role={isInteractive ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
                onPress={onPress}
                {...props}
            >
                {(state) =>
                    !!isLoading && LoadingComponent ? (
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
                            {selectionEnabled && (
                                <View style={styles.flex1}>
                                    <Checkbox
                                        isChecked={!!item.selected}
                                        accessibilityLabel="TEST"
                                        onPress={(event) => handleCheckboxPress(event as unknown as MouseEvent)}
                                    />
                                </View>
                            )}
                            {renderChildren(state)}
                        </View>
                    )
                }
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}
