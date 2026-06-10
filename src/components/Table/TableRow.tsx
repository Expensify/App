import React from 'react';
import type {PressableStateCallbackType} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import ErrorMessageRow from '@components/ErrorMessageRow';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
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
    const {processedData, columns, shouldUseNarrowTableLayout} = useTableContext();

    const rowCount = processedData.length;
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === rowCount - 1;
    const isInteractive = interactive && !isLoading;
    const gridTemplateColumns = columns.map((column) => (column.width ? `${column.width}px` : '1fr')).join(' ');

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: !!shouldAnimateInHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.transparent,
    });

    const tableRowPressableStyles = [
        styles.mh5,
        styles.appBG,
        isInteractive && styles.userSelectNone,
        !isFirstRow && [styles.borderTop, {borderColor: theme.borderLight}],
        isLastRow && [styles.borderBottom, {borderColor: theme.borderLight}],
        shouldUseNarrowTableLayout ? styles.tableRowHeightCompact : styles.tableRowHeight,
    ];

    const tableRowContentContainerStyles = [
        styles.flex1,
        styles.gap3,
        shouldUseNarrowTableLayout ? styles.ph4 : styles.ph3,
        shouldUseNarrowTableLayout && !isLoading && styles.pv4,
        !shouldUseNarrowTableLayout && !isLoading && styles.pv2,
        animatedHighlightStyle,
    ];

    const tableRowContentStyles = [
        styles.flex1,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.alignContentCenter,
        styles.gap3,
        styles.dFlex,
        // Use Grid on web when available (will override flex if supported)
        !shouldUseNarrowTableLayout && [styles.dGrid, {gridTemplateColumns}],
    ];

    const renderChildren = (state: PressableStateCallbackType) => {
        if (typeof children === 'function') {
            return children(state);
        }

        return children;
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
                interactive={isInteractive}
                pressDimmingValue={isInteractive ? undefined : 1}
                hoverStyle={isInteractive && styles.hoveredComponentBG}
                role={isInteractive ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
                onPress={onPress}
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
                            <View style={tableRowContentStyles}>{renderChildren(state)}</View>
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
