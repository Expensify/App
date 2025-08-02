import React from 'react';
import {Rect} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
                        x={12}
                        y={12}
                        rx={5}
                        ry={5}
                        width={36}
                        height={40}
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
                    {!shouldUseNarrowLayout && (
                        <>
                            <Rect
                                x={66 + partWidth}
                                y={22}
                                width={longBarWidth}
                                height={barHeight}
                            />
                            <Rect
                                x={66 + partWidth}
                                y={36}
                                width={shortBarWidth}
                                height={barHeight}
                            />
                            <Rect
                                x={66 + partWidth * 2}
                                y={22}
                                width={longBarWidth}
                                height={barHeight}
                            />
                            <Rect
                                x={66 + partWidth * 2}
                                y={36}
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
WorkspaceRowSkeleton.displayName = 'WorkspaceRowSkeleton';
export default WorkspaceRowSkeleton;
