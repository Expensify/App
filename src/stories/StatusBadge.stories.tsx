import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import StatusBadge from '@components/StatusBadge';

type StatusBadgeStory = StoryFn<typeof StatusBadge>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof StatusBadge> = {
    title: 'Data Display/StatusBadge',
    component: StatusBadge,
};

function Template(props: React.ComponentProps<typeof StatusBadge>) {
    return <StatusBadge {...props} />;
}

const Default: StatusBadgeStory = Template.bind({});
Default.args = {
    text: 'Approved',
};

export default story;
export {Default};
