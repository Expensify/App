import React from 'react';
import TextInput from '../components/TextInput';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/TextInput',
    component: TextInput,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <TextInput {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const AutoFocus = Template.bind({});
AutoFocus.args = {
    label: 'Auto-focused text input',
    name: 'AutoFocus',
    autoFocus: true,
};

const Default = Template.bind({});
Default.args = {
    label: 'Default text input',
    name: 'Default',
};

const DefaultValue = Template.bind({});
DefaultValue.args = {
    label: 'Input with default value',
    name: 'DefaultValue',
    defaultValue: 'My default value',
};

const ErrorStory = Template.bind({});
ErrorStory.args = {
    label: 'Input with error',
    name: 'InputWithError',
    errorText: 'This field has an error.',
};

const ForceActiveLabel = Template.bind({});
ForceActiveLabel.args = {
    label: 'Forced active label',
    forceActiveLabel: true,
};

const Placeholder = Template.bind({});
Placeholder.args = {
    label: 'Input with placeholder',
    name: 'Placeholder',
    placeholder: 'My placeholder text',
};

export default story;
export {
    AutoFocus,
    Default,
    DefaultValue,
    ErrorStory,
    ForceActiveLabel,
    Placeholder,
};
