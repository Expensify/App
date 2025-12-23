import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import ItemListSkeletonView from './ItemListSkeletonView';

type CardRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
};

const barHeight = 7;
const longBarWidth = 120;
const shortBarWidth = 60;
const leftPaneWidth = variables.sideBarWithLHBWidth;
const gapWidth = 12;
const rightSideElementWidth = 50;
const centralPanePadding = 50;
const rightButtonWidth = 20;

function CardRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false}: CardRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useSkeletonSpan('CardRowSkeleton');

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacityEnabled={gradientOpacityEnabled}
            itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.ml5]}
            renderSkeletonItem={() => (
                <>
                    <Circle
                        cx={36}
                        cy={32}
                        r={20}
                    />
                    <Rect
                        transform={[{translateX: 66}, {translateY: 22}]}
                        width={longBarWidth}
                        height={barHeight}
                    />

                    <Rect
                        transform={[{translateX: 66}, {translateY: 36}]}
                        width={shortBarWidth}
                        height={barHeight}
                    />

                    {!shouldUseNarrowLayout && (
                        <>
                            <Rect
                                // We have to calculate this value to make sure the element is aligned to the button on the right side.
                                transform={[
                                    {
                                        translateX: windowWidth - leftPaneWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth,
                                    },
                                    {translateY: 28},
                                ]}
                                width={20}
                                height={barHeight}
                            />

                            <Rect
                                // We have to calculate this value to make sure the element is aligned to the right border.
                                transform={[
                                    {
                                        translateX: windowWidth - leftPaneWidth - rightSideElementWidth - gapWidth - centralPanePadding,
                                    },
                                    {translateY: 28},
                                ]}
                                width={50}
                                height={barHeight}
                            />
                        </>
                    )}
                </>
            )}
        />
    );
}

export default CardRowSkeleton;
