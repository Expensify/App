import React from 'react';
import Header from '../components/Header';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/Header',
    component: Header,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <Header {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default = Template.bind({});
Default.args = {
    title: 'Chats',
    shouldShowEnvironmentBadge: true,
};
