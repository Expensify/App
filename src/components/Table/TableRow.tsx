import React from 'react';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
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
    const {processedData} = useTableContext();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const rowCount = processedData.length;
    const isLastRow = rowIndex === rowCount - 1;
    const isInteractive = interactive && !isLoading;
    const isSmallView = isMediumScreenWidth || shouldUseNarrowLayout;

    const tableRowStyles = [
        styles.mh5,
        styles.flexRow,
        styles.highlightBG,
        styles.overflowHidden,
        styles.alignItemsCenter,
        isInteractive && styles.userSelectNone,
        isSmallView ? styles.ph4 : styles.ph3,
        isSmallView && !isLoading && styles.pv4,
        !isSmallView && !isLoading && styles.pv3,
        isLastRow ? styles.tableBottomRadius : styles.borderBottom,
        isSmallView ? styles.tableRowHeightCompact : styles.tableRowHeight,
    ];

    return (
        <PressableWithFeedback
            accessible={accessible}
            accessibilityLabel="row"
            style={tableRowStyles}
            sentryLabel={sentryLabel}
            interactive={isInteractive}
            pressDimmingValue={isInteractive ? undefined : 1}
            hoverStyle={isInteractive && styles.hoveredComponentBG}
            role={isInteractive ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
            onPress={onPress}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {!!isLoading && LoadingComponent ? (
                <SkeletonViewContentLoader
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                    height={isSmallView ? variables.tableRowHeightCompact : variables.tableRowHeight}
                >
                    <LoadingComponent />
                </SkeletonViewContentLoader>
            ) : (
                children
            )}
        </PressableWithFeedback>
    );
}
