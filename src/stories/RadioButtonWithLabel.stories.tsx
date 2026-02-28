import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import type {RadioButtonWithLabelProps} from '@components/RadioButtonWithLabel';

type RadioButtonWithLabelStory = StoryFn<typeof RadioButtonWithLabel>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof RadioButtonWithLabel> = {
    title: 'Components/RadioButtonWithLabel',
    component: RadioButtonWithLabel,
};

function Template(props: RadioButtonWithLabelProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RadioButtonWithLabel {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: RadioButtonWithLabelStory = Template.bind({});
const Checked: RadioButtonWithLabelStory = Template.bind({});
Default.args = {
    isChecked: false,
    label: 'This radio button is unchecked',
};

Checked.args = {
    isChecked: true,
    label: 'This radio button is checked',
};

export default story;
export {Default, Checked};
