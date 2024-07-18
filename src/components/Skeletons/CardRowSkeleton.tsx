import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ItemListSkeletonView from './ItemListSkeletonView';

type CardRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
};

const barHeight = 8;
const longBarWidth = 120;
const shortBarWidth = 60;
const leftPaneWidth = variables.sideBarWidth;

// 12 is the gap between the element and the right button
const gapWidth = 12;

// 80 is the width of the element itself
const rightSideElementWidth = 50;

// 24 is the padding of the central pane summing two sides
const centralPanePadding = 50;

// 80 is the width of the button on the right side
const rightButtonWidth = 20;

function CardRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false}: CardRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth, isSmallScreenWidth, isLargeScreenWidth} = useWindowDimensions();

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacityEnabled={gradientOpacityEnabled}
            itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.mr3, styles.ml3]}
            renderSkeletonItem={() => (
                <>
                    <Circle
                        cx="36"
                        cy="32"
                        r="20"
                    />
                    <Rect
                        x={66}
                        y={22}
                        width={longBarWidth}
                        height={7}
                    />

                    <Rect
                        x={66}
                        y={36}
                        width={shortBarWidth}
                        height={7}
                    />

                    {!isSmallScreenWidth && (
                        <>
                            <Rect
                                // We have to calculate this value to make sure the element is aligned to the button on the right side.
                                x={windowWidth - leftPaneWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth}
                                y={28}
                                width={20}
                                height={barHeight}
                            />

                            <Rect
                                // We have to calculate this value to make sure the element is aligned to the right border.
                                x={windowWidth - leftPaneWidth - rightSideElementWidth - gapWidth - centralPanePadding}
                                y={28}
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

CardRowSkeleton.displayName = 'CardRowSkeleton';

export default CardRowSkeleton;
