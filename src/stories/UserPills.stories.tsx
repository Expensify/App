import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import UserPills from '@components/UserPills';

type UserPillsStory = StoryFn<typeof UserPills>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof UserPills> = {
    title: 'Data Display/UserPills',
    component: UserPills,
};

function Template(props: React.ComponentProps<typeof UserPills>) {
    return <UserPills {...props} />;
}

const Default: UserPillsStory = Template.bind({});
Default.args = {
    users: [
        {displayName: 'Jane Doe', email: 'jane@example.com', accountID: 1},
        {displayName: 'John Smith', email: 'john@example.com', accountID: 2},
        {displayName: 'Alice Green', email: 'alice@example.com', accountID: 3},
    ],
};

const ManyUsers: UserPillsStory = Template.bind({});
ManyUsers.args = {
    maxVisible: 3,
    users: [
        {displayName: 'Jane Doe', email: 'jane@example.com', accountID: 1},
        {displayName: 'John Smith', email: 'john@example.com', accountID: 2},
        {displayName: 'Alice Green', email: 'alice@example.com', accountID: 3},
        {displayName: 'Bob White', email: 'bob@example.com', accountID: 4},
        {displayName: 'Carol Brown', email: 'carol@example.com', accountID: 5},
        {displayName: 'David Black', email: 'david@example.com', accountID: 6},
    ],
};

export default story;
export {Default, ManyUsers};
