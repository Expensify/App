import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ItemListSkeletonView from './ItemListSkeletonView';

type SearchRowSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacity?: boolean;
};

const barHeight = '10';
const shortBarWidth = '40';
const longBarWidth = '120';

function SearchRowSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacity = false}: SearchRowSkeletonProps) {
    const styles = useThemeStyles();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    if (isSmallScreenWidth) {
        return (
            <ItemListSkeletonView
                itemViewHeight={CONST.SEARCH_SKELETON_VIEW_ITEM_HEIGHT}
                itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.mr3, styles.ml3]}
                gradientOpacity={gradientOpacity}
                shouldAnimate={shouldAnimate}
                fixedNumItems={fixedNumItems}
                renderSkeletonItem={() => (
                    <>
                        <Circle
                            cx={24}
                            cy={26}
                            r={8}
                        />

                        <Rect
                            x={40}
                            y={24}
                            width={40}
                            height={4}
                        />
                        <Circle
                            cx={96}
                            cy={26}
                            r={8}
                        />

                        <Rect
                            x={112}
                            y={24}
                            width={40}
                            height={4}
                        />
                        <Rect
                            x={windowWidth - 120}
                            y={12}
                            width={80}
                            height={28}
                            rx={14}
                            ry={14}
                        />

                        <Rect
                            x={16}
                            y={56}
                            width={36}
                            height={40}
                            rx={4}
                            ry={4}
                        />
                        <Rect
                            x={64}
                            y={65}
                            width={124}
                            height={8}
                        />
                        <Rect
                            x={64}
                            y={79}
                            width={60}
                            height={8}
                        />
                        <Rect
                            x={windowWidth - 120}
                            y={65}
                            width={80}
                            height={8}
                        />
                        <Rect
                            x={windowWidth - 100}
                            y={79}
                            width={60}
                            height={8}
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
            gradientOpacity={gradientOpacity}
            itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.mr3, styles.ml3]}
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

SearchRowSkeleton.displayName = 'SearchRowSkeleton';

export default SearchRowSkeleton;
