import React from 'react';
import ButtonWithDropdownMenu from '../components/ButtonWithDropdownMenu';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/ButtonWithDropdownMenu',
    component: ButtonWithDropdownMenu,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = (args) => <ButtonWithDropdownMenu {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    buttonText: 'Pay with PayPal.me',
    options: [
        {value: 1, text: 'One'},
        {value: 2, text: 'Two'},
    ],
};

export default story;
export {Default};
