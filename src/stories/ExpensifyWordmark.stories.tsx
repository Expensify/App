import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import ExpensifyWordmark from '@components/ExpensifyWordmark';

type ExpensifyWordmarkStory = StoryFn<typeof ExpensifyWordmark>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ExpensifyWordmark> = {
    title: 'Data Display/ExpensifyWordmark',
    component: ExpensifyWordmark,
};

function Template(props: React.ComponentProps<typeof ExpensifyWordmark>) {
    return <ExpensifyWordmark {...props} />;
}

const Default: ExpensifyWordmarkStory = Template.bind({});
Default.args = {};

export default story;
export {Default};
