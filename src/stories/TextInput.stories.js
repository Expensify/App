import React, {useState} from 'react';
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
    placeholder: 'My placeholder text',
    forceActiveLabel: true,
};

const Placeholder = Template.bind({});
Placeholder.args = {
    label: 'Input with placeholder',
    name: 'Placeholder',
    placeholder: 'My placeholder text',
};

const AutoGrowInput = Template.bind({});
AutoGrowInput.args = {
    label: 'Autogrow input',
    name: 'AutoGrow',
    placeholder: 'My placeholder text',
    autoGrow: true,
    textInputContainerStyles: [{
        minWidth: 150,
    }],
};

const PrefixedInput = Template.bind({});
PrefixedInput.args = {
    label: 'Prefixed input',
    name: 'Prefixed',
    placeholder: 'My placeholder text',
    prefixCharacter: '@',
};

const MaxLengthInput = Template.bind({});
MaxLengthInput.args = {
    label: 'MaxLength Input',
    name: 'MaxLengthInput',
    placeholder: 'My placeholder text',
    maxLength: 50,
};

const HintAndErrorInput = (args) => {
    const [error, setError] = useState('');
    return (
        <TextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            onChangeText={(value) => {
                if (value && value.toLowerCase() === 'oops!') {
                    setError('Oops! Looks like there\'s an error.');
                    return;
                }
                setError('');
            }}
            errorText={error}
        />
    );
};
HintAndErrorInput.args = {
    label: 'Input with hint & error',
    name: 'HintAndErrorInput',
    placeholder: 'My placeholder text',
    hint: 'Type "Oops!" to see the error.',
};

export default story;
export {
    AutoFocus,
    Default,
    DefaultValue,
    ErrorStory,
    ForceActiveLabel,
    Placeholder,
    AutoGrowInput,
    PrefixedInput,
    MaxLengthInput,
    HintAndErrorInput,
};
