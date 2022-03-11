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

const DefaultInput = Template.bind({});
DefaultInput.args = {
    label: 'Default text input',
    name: 'Default',
};

const DefaultValueInput = Template.bind({});
DefaultValueInput.args = {
    label: 'Default value input',
    name: 'DefaultValue',
    defaultValue: 'My default value',
};

const ErrorInput = Template.bind({});
ErrorInput.args = {
    label: 'Error input',
    name: 'InputWithError',
    errorText: 'Oops! Looks like there\'s an error',
};

const ForceActiveLabel = Template.bind({});
ForceActiveLabel.args = {
    label: 'Force active label',
    placeholder: 'My placeholder text',
    forceActiveLabel: true,
};

const PlaceholderInput = Template.bind({});
PlaceholderInput.args = {
    label: 'Placeholder input',
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
    label: 'MaxLength input',
    name: 'MaxLength',
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
                    setError('Oops! Looks like there\'s an error');
                    return;
                }
                setError('');
            }}
            errorText={error}
        />
    );
};
HintAndErrorInput.args = {
    label: 'HintAndError input',
    name: 'HintAndError',
    placeholder: 'My placeholder text',
    hint: 'Type "Oops!" to see the error',
};

export default story;
export {
    AutoFocus,
    DefaultInput,
    DefaultValueInput,
    ErrorInput,
    ForceActiveLabel,
    PlaceholderInput,
    AutoGrowInput,
    PrefixedInput,
    MaxLengthInput,
    HintAndErrorInput,
};
