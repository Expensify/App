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
    forceActiveLabel: true,
};

const Placeholder = Template.bind({});
Placeholder.args = {
    label: 'Input with placeholder',
    name: 'Placeholder',
    placeholder: 'My placeholder text',
};

const AutoGrow = Template.bind({});
AutoGrow.storyName = 'Autogrow input';
AutoGrow.args = {
    label: 'Autogrow input',
    name: 'AutoGrow',
    placeholder: 'My placeholder text',
};

const Prefixed = Template.bind({});
Prefixed.storyName = 'Prefixed input';
Prefixed.args = {
    label: 'Prefixed input',
    name: 'Prefixed',
    placeholder: 'My placeholder text',
    prefixCharacter: '@',
};

const WithFixedLabel = Template.bind({});
WithFixedLabel.storyName = 'Always active label';
WithFixedLabel.args = {
    label: 'Active label input',
    name: 'activelabel',
    placeholder: 'My placeholder text',
    forceActiveLabel: 'true',
};

const MaxLength = Template.bind({});
MaxLength.storyName = 'Input with maxLength';
MaxLength.args = {
    label: 'Label',
    name: 'inputmaxlength',
    placeholder: 'My placeholder text',
    maxLength: 50,
};

const HintErrorInput = (args) => {
    const [error, setError] = useState('');
    return (
        <TextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            onChangeText={(value) => {
                if (value && value.toLowerCase() === 'damn!') {
                    setError('Damn! there is an error.');
                    return;
                }
                setError('');
            }}
            errorText={error}
        />
    );
};
HintErrorInput.storyName = 'Input with hint & error';
HintErrorInput.args = {
    label: 'Label',
    name: 'inputhint&error',
    placeholder: 'My placeholder text',
    hint: 'Type "Damn!" to see the error.',
};

export default story;
export {
    AutoFocus,
    Default,
    DefaultValue,
    ErrorStory,
    ForceActiveLabel,
    Placeholder,
    AutoGrow,
    Prefixed,
    WithFixedLabel,
    MaxLength,
    HintErrorInput,
};
