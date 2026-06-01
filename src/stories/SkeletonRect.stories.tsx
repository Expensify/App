import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {Svg} from 'react-native-svg';
import SkeletonRect from '@components/SkeletonRect';

type SkeletonRectStory = StoryFn<typeof SkeletonRect>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 *
 * SkeletonRect renders an SVG <Rect>, so it must be wrapped in an <Svg> element to be visible.
 */
const story: Meta<typeof SkeletonRect> = {
    title: 'Feedback/SkeletonRect',
    component: SkeletonRect,
};

function Template(props: React.ComponentProps<typeof SkeletonRect>) {
    return (
        <Svg
            width={200}
            height={40}
        >
            <SkeletonRect {...props} />
        </Svg>
    );
}

const Default: SkeletonRectStory = Template.bind({});
Default.args = {
    width: 200,
    height: 24,
    fill: '#7D8B8A',
};

export default story;
export {Default};
