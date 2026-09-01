import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';

import React from 'react';

const BAR_HEIGHT = 12;

type SkeletonTextLineProps = {
    /** Height of the line box the real text occupies */
    lineHeight: number;

    /** Width of the bar, picked to read as the length of the text it stands in for */
    barWidth: number;
};

/** One shimmering bar sized and positioned like a single line of text. */
function SkeletonTextLine({lineHeight, barWidth}: SkeletonTextLineProps) {
    const theme = useTheme();

    return (
        <SkeletonViewContentLoader
            animate
            height={lineHeight}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <SkeletonRect
                transform={[{translateY: (lineHeight - BAR_HEIGHT) / 2}]}
                width={barWidth}
                height={BAR_HEIGHT}
            />
        </SkeletonViewContentLoader>
    );
}

export default SkeletonTextLine;
