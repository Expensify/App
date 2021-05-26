import React from 'react';
import ButtonWithDropdown from '../components/ButtonWithDropdown';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/ButtonWithDropdown',
    component: ButtonWithDropdown,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <ButtonWithDropdown {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default = Template.bind({});
Default.args = {
    buttonText: 'Pay with Venmo',
};
