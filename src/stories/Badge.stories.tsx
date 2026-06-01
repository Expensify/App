import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Badge from '@components/Badge';

type BadgeStory = StoryFn<typeof Badge>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Badge> = {
    title: 'Data Display/Badge',
    component: Badge,
};

function Template(props: React.ComponentProps<typeof Badge>) {
    return <Badge {...props} />;
}

const Default: BadgeStory = Template.bind({});
Default.args = {
    text: 'Badge',
};

const Success: BadgeStory = Template.bind({});
Success.args = {
    text: 'Paid',
    success: true,
};

const Error: BadgeStory = Template.bind({});
Error.args = {
    text: 'Failed',
    error: true,
};

export default story;
export {Default, Success, Error};
