import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import AvatarSkeleton from '@components/AvatarSkeleton';
import CONST from '@src/CONST';

type AvatarSkeletonStory = StoryFn<typeof AvatarSkeleton>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AvatarSkeleton> = {
    title: 'Feedback/AvatarSkeleton',
    component: AvatarSkeleton,
};

function Template(props: React.ComponentProps<typeof AvatarSkeleton>) {
    return <AvatarSkeleton {...props} />;
}

const Default: AvatarSkeletonStory = Template.bind({});
Default.args = {
    size: CONST.AVATAR_SIZE.SMALL,
    reasonAttributes: {context: 'Storybook'},
};

const Large: AvatarSkeletonStory = Template.bind({});
Large.args = {
    size: CONST.AVATAR_SIZE.LARGE,
    reasonAttributes: {context: 'Storybook'},
};

export default story;
export {Default, Large};
