import React from 'react';
import {Rect} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import ItemListSkeletonView from './ItemListSkeletonView';

const barHeight = 7;
const longBarWidth = 120;
const shortBarWidth = 60;
const leftPaneWidth = variables.navigationTabBarSize;
const gapWidth = 12;

type WorkspaceRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
};

function WorkspaceRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false}: WorkspaceRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useSkeletonSpan('WorkspaceRowSkeleton');
    // We calculate the width of the sections on the skeleton by first calculating the skeleton view width
    // Then we subtract the width by 66, which is the x position of the first part.
    const partWidth = Math.floor((windowWidth - leftPaneWidth - gapWidth * 2 - 66) / 3);
    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacityEnabled={gradientOpacityEnabled}
            itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.ml5]}
            renderSkeletonItem={() => (
                <>
                    <Rect
                        transform={[{translateX: 12}, {translateY: 12}]}
                        rx={5}
                        ry={5}
                        width={36}
                        height={40}
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
                                transform={[{translateX: 66 + partWidth}, {translateY: 22}]}
                                width={longBarWidth}
                                height={barHeight}
                            />
                            <Rect
                                transform={[{translateX: 66 + partWidth}, {translateY: 36}]}
                                width={shortBarWidth}
                                height={barHeight}
                            />
                            <Rect
                                transform={[{translateX: 66 + partWidth * 2}, {translateY: 22}]}
                                width={longBarWidth}
                                height={barHeight}
                            />
                            <Rect
                                transform={[{translateX: 66 + partWidth * 2}, {translateY: 36}]}
                                width={shortBarWidth}
                                height={barHeight}
                            />
                        </>
                    )}
                </>
            )}
        />
    );
}

export default WorkspaceRowSkeleton;
