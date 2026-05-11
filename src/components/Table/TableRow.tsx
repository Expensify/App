import React from 'react';
import {PressableStateCallbackType, View} from 'react-native';
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
};

export default function TableRow({children, accessible, rowIndex, sentryLabel, interactive, isLoading, skeletonReasonAttributes, LoadingComponent, onPress, ...props}: TableRowProps) {
    useSkeletonSpan('TableRowSkeleton', skeletonReasonAttributes);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {processedData, columns, shouldUseNarrowTableLayout} = useTableContext();

    const columnCount = columns.length;
    const rowCount = processedData.length;
    const isLastRow = rowIndex === rowCount - 1;
    const isInteractive = interactive && !isLoading;

    const tableRowPressableStyles = [
        styles.mh5,
        styles.flexRow,
        styles.highlightBG,
        styles.overflowHidden,
        styles.alignItemsCenter,
        isInteractive && styles.userSelectNone,
        shouldUseNarrowTableLayout ? styles.ph4 : styles.ph3,
        shouldUseNarrowTableLayout && !isLoading && styles.pv4,
        !shouldUseNarrowTableLayout && !isLoading && styles.pv3,
        isLastRow ? styles.tableBottomRadius : styles.borderBottom,
        shouldUseNarrowTableLayout ? styles.tableRowHeightCompact : styles.tableRowHeight,
    ];

    const tableRowContentStyles = [
        styles.flex1,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.gap3,
        styles.dFlex,
        // Use Grid on web when available (will override flex if supported)
        !shouldUseNarrowTableLayout && [styles.dGrid, {gridTemplateColumns: `repeat(${columnCount}, 1fr)`}],
    ];

    const renderChildren = (state: PressableStateCallbackType) => {
        if (typeof children === 'function') {
            return children(state);
        }

        return children;
    };

    return (
        <PressableWithFeedback
            accessible={accessible}
            accessibilityLabel="row"
            style={tableRowPressableStyles}
            sentryLabel={sentryLabel}
            interactive={isInteractive}
            pressDimmingValue={isInteractive ? undefined : 1}
            hoverStyle={isInteractive && styles.hoveredComponentBG}
            role={isInteractive ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
            onPress={onPress}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {(state) =>
                !!isLoading && LoadingComponent ? (
                    <SkeletonViewContentLoader
                        backgroundColor={theme.skeletonLHNIn}
                        foregroundColor={theme.skeletonLHNOut}
                        height={shouldUseNarrowTableLayout ? variables.tableRowHeightCompact : variables.tableRowHeight}
                    >
                        <LoadingComponent />
                    </SkeletonViewContentLoader>
                ) : (
                    <View style={tableRowContentStyles}>{renderChildren(state)}</View>
                )
            }
        </PressableWithFeedback>
    );
}
