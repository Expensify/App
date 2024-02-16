import React from 'react';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/RadioButtonWithLabel',
    component: RadioButtonWithLabel,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RadioButtonWithLabel {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
const Checked = Template.bind({});
Default.args = {
    isChecked: false,
    label: 'This radio button is unchecked',
    onInputChange: () => {},
};

Checked.args = {
    isChecked: true,
    label: 'This radio button is checked',
    onInputChange: () => {},
};

export default story;
export {Default, Checked};
