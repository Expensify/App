import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
const leftPaneWidth = variables.sideBarWidth;
const gapWidth = 12;
const rightSideElementWidth = 50;
const centralPanePadding = 50;
const rightButtonWidth = 20;

function CardRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false}: CardRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacityEnabled={gradientOpacityEnabled}
            itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.mr3, styles.ml3]}
            renderSkeletonItem={() => (
                <>
                    <Circle
                        cx={36}
                        cy={32}
                        r={20}
                    />
                    <Rect
                        x={66}
                        y={22}
                        width={longBarWidth}
                        height={barHeight}
                    />

                    <Rect
                        x={66}
                        y={36}
                        width={shortBarWidth}
                        height={barHeight}
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
