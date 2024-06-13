import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ItemListSkeletonView from './ItemListSkeletonView';

type TableListItemSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
};

const circleRadius = 8;
const padding = 12;
const barHeight = '10';
const shortBarWidth = '40';
const longBarWidth = '120';

function TableListItemSkeleton({shouldAnimate = true, fixedNumItems}: TableListItemSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    if (isSmallScreenWidth) {
        return (
            <ItemListSkeletonView
                itemViewHeight={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT}
                itemViewStyle={[styles.highlightBG, styles.mv2, styles.br3, styles.mr3, styles.ml3]}
                shouldAnimate={shouldAnimate}
                fixedNumItems={fixedNumItems}
                renderSkeletonItem={() => (
                    <>
                        <Circle
                            cx={padding + circleRadius}
                            cy={padding + circleRadius}
                            r={circleRadius}
                        />

                        <Rect
                            x={padding + circleRadius * 2 + 4}
                            y={padding + circleRadius - 2}
                            width={windowWidth * 0.2}
                            height={4}
                        />
                        <Circle
                            cx={padding + circleRadius * 2 + 4 + windowWidth * 0.2 + circleRadius * 2 + circleRadius}
                            cy={padding + circleRadius}
                            r={circleRadius}
                        />

                        <Rect
                            x={padding + circleRadius * 2 + 4 + windowWidth * 0.2 + circleRadius * 2 + circleRadius * 2 + 4}
                            y={padding + circleRadius - 2}
                            width={windowWidth * 0.2}
                            height={4}
                        />
                        <Rect
                            x={windowWidth - padding * 3 - windowWidth * 0.2}
                            y={padding + circleRadius - 12}
                            width={windowWidth * 0.2}
                            height={24}
                            rx={12}
                            ry={12}
                        />

                        <Rect
                            x={padding}
                            y={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT - padding - 36}
                            width={36}
                            height={36}
                            rx={6}
                            ry={6}
                        />
                        <Rect
                            x={padding + 36 + circleRadius}
                            y={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT - padding - 36 + 18 - circleRadius - 2}
                            width={windowWidth * 0.4}
                            height={circleRadius}
                        />
                        <Rect
                            x={padding + 36 + circleRadius}
                            y={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT - padding - 36 + 18 + 2}
                            width={windowWidth * 0.2}
                            height={circleRadius}
                        />
                        <Rect
                            x={windowWidth - padding * 3 - windowWidth * 0.3}
                            y={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT - padding - 36 + 18 - circleRadius - 2}
                            width={windowWidth * 0.3}
                            height={circleRadius}
                        />
                        <Rect
                            x={windowWidth - padding * 3 - windowWidth * 0.2}
                            y={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT - padding - 36 + 18 + 2}
                            width={windowWidth * 0.2}
                            height={circleRadius}
                        />
                    </>
                )}
            />
        );
    }
    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            renderSkeletonItem={() => (
                <>
                    <Rect
                        x="20"
                        y="10"
                        rx="5"
                        ry="5"
                        width="40"
                        height="40"
                    />
                    <Rect
                        x="80"
                        y="25"
                        width={shortBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="150"
                        y="25"
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="320"
                        y="25"
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="480"
                        y="25"
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        x="660"
                        y="25"
                        width="100%"
                        height={barHeight}
                    />
                </>
            )}
        />
    );
}

TableListItemSkeleton.displayName = 'TableListItemSkeleton';

export default TableListItemSkeleton;
