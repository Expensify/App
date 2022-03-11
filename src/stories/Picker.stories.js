import React from 'react';
import Picker from '../components/Picker';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Picker',
    component: Picker,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <Picker {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const Default = Template.bind({});
Default.args = {
    label: 'Default picker',
    name: 'Default',
    onInputChange: () => {},
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};

const PickerWithValue = Template.bind({});
PickerWithValue.args = {
    label: 'Picker with defined value',
    name: 'Picker with defined value',
    onInputChange: () => {},
    value: 'apple',
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};

const ErrorStory = Template.bind({});
ErrorStory.args = {
    label: 'Picker with error',
    name: 'PickerWithError',
    errorText: 'This field has an error.',
    onInputChange: () => {},
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};

const Disabled = Template.bind({});
Disabled.args = {
    label: 'Picker disabled',
    name: 'Disabled',
    isDisabled: true,
    onInputChange: () => {},
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};

export default story;
export {
    Default,
    PickerWithValue,
    ErrorStory,
    Disabled,
};
