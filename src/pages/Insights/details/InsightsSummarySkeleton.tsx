import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useContainerWidth from '@hooks/useContainerWidth';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

const BAR_HEIGHT = 8;
const LABEL_WIDTH = 80;
const HEADLINE_HEIGHT = 16;
const HEADLINE_WIDTH = 160;
const TILE_VALUE_WIDTH = 96;

/** Space between the two tiles in a row, matching gap5 */
const TILE_GAP = 20;

const AVERAGE_Y = 0;
const HEADLINE_Y = AVERAGE_Y + variables.lineHeightLarge;
const FIRST_TILE_ROW_Y = HEADLINE_Y + variables.lineHeightSizeH2 + variables.lineHeightLarge;
const TILE_ROW_HEIGHT = variables.lineHeightLarge * 2 + variables.lineHeightNormal;
const HEIGHT = FIRST_TILE_ROW_Y + TILE_ROW_HEIGHT * 2;

/** Stands in for the Summary card's contents while its data loads. */
function InsightsSummarySkeleton() {
    const theme = useTheme();
    const {onLayout, containerWidth} = useContainerWidth();
    const secondTileX = (containerWidth + TILE_GAP) / 2;

    const renderTile = (x: number, y: number) => (
        <>
            <SkeletonRect
                transform={[{translateX: x}, {translateY: y}]}
                width={LABEL_WIDTH}
                height={BAR_HEIGHT}
            />
            <SkeletonRect
                transform={[{translateX: x}, {translateY: y + variables.lineHeightLarge}]}
                width={TILE_VALUE_WIDTH}
                height={BAR_HEIGHT}
            />
        </>
    );

    return (
        <View onLayout={onLayout}>
            <SkeletonViewContentLoader
                animate
                width="100%"
                height={HEIGHT}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateY: AVERAGE_Y}]}
                    width={LABEL_WIDTH}
                    height={BAR_HEIGHT}
                />
                <SkeletonRect
                    transform={[{translateY: HEADLINE_Y}]}
                    width={HEADLINE_WIDTH}
                    height={HEADLINE_HEIGHT}
                />
                {renderTile(0, FIRST_TILE_ROW_Y)}
                {renderTile(secondTileX, FIRST_TILE_ROW_Y)}
                {renderTile(0, FIRST_TILE_ROW_Y + TILE_ROW_HEIGHT)}
                {renderTile(secondTileX, FIRST_TILE_ROW_Y + TILE_ROW_HEIGHT)}
            </SkeletonViewContentLoader>
        </View>
    );
}

export default InsightsSummarySkeleton;
