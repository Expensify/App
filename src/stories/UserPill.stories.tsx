import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import UserPill from '@components/UserPill';

type UserPillStory = StoryFn<typeof UserPill>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof UserPill> = {
    title: 'Data Display/UserPill',
    component: UserPill,
};

function Template(props: React.ComponentProps<typeof UserPill>) {
    return <UserPill {...props} />;
}

const Default: UserPillStory = Template.bind({});
Default.args = {
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    accountID: 12345,
};

export default story;
export {Default};
