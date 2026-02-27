import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';
import variables from '@styles/variables';

type TextInputStory = StoryFn<typeof TextInput>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TextInput> = {
    title: 'Components/TextInput',
    component: TextInput,
};

function Template(props: BaseTextInputProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TextInput {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const AutoFocus: TextInputStory = Template.bind({});
AutoFocus.args = {
    label: 'Auto-focused text input',
    name: 'AutoFocus',
    autoFocus: true,
};

const DefaultInput: TextInputStory = Template.bind({});
DefaultInput.args = {
    label: 'Default text input',
    name: 'Default',
};

const DefaultValueInput: TextInputStory = Template.bind({});
DefaultValueInput.args = {
    label: 'Default value input',
    name: 'DefaultValue',
    defaultValue: 'My default value',
};

const ErrorInput: TextInputStory = Template.bind({});
ErrorInput.args = {
    label: 'Error input',
    name: 'InputWithError',
    errorText: "Oops! Looks like there's an error",
};

const ForceActiveLabel: TextInputStory = Template.bind({});
ForceActiveLabel.args = {
    label: 'Force active label',
    placeholder: 'My placeholder text',
    forceActiveLabel: true,
};

const PlaceholderInput: TextInputStory = Template.bind({});
PlaceholderInput.args = {
    label: 'Placeholder input',
    name: 'Placeholder',
    placeholder: 'My placeholder text',
};

const PrefixedInput: TextInputStory = Template.bind({});
PrefixedInput.args = {
    label: 'Prefixed input',
    name: 'Prefixed',
    placeholder: 'My placeholder text',
    prefixCharacter: '@',
};

const MaxLengthInput: TextInputStory = Template.bind({});
MaxLengthInput.args = {
    label: 'MaxLength input',
    name: 'MaxLength',
    placeholder: 'My placeholder text',
    maxLength: 50,
};

function HintAndErrorInput(props: BaseTextInputProps) {
    const [error, setError] = useState('');
    return (
        <TextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onChangeText={(value) => {
                if (value && value.toLowerCase() === 'oops!') {
                    setError("Oops! Looks like there's an error");
                    return;
                }
                setError('');
            }}
            errorText={error}
        />
    );
}
HintAndErrorInput.args = {
    label: 'HintAndError input',
    name: 'HintAndError',
    placeholder: 'My placeholder text',
    hint: 'Type "Oops!" to see the error',
};

// To use autoGrow we need to control the TextInput's value
function AutoGrowSupportInput(props: BaseTextInputProps) {
    const [value, setValue] = useState(props.value ?? '');
    React.useEffect(() => {
        setValue(props.value ?? '');
    }, [props.value]);

    return (
        <TextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onChangeText={setValue}
            value={value}
        />
    );
}

const AutoGrowInput: TextInputStory = AutoGrowSupportInput.bind({});
AutoGrowInput.args = {
    label: 'Auto grow input',
    name: 'AutoGrow',
    placeholder: 'My placeholder text',
    autoGrow: true,
    textInputContainerStyles: [
        {
            minWidth: 150,
            maxWidth: 500,
        },
    ],
    value: '',
};

const AutoGrowHeightInput: TextInputStory = AutoGrowSupportInput.bind({});
AutoGrowHeightInput.args = {
    label: 'Auto grow height input',
    name: 'AutoGrowHeight',
    placeholder: 'My placeholder text',
    autoGrowHeight: true,
    maxAutoGrowHeight: variables.textInputAutoGrowMaxHeight,
};

export default story;
export {AutoFocus, DefaultInput, DefaultValueInput, ErrorInput, ForceActiveLabel, PlaceholderInput, AutoGrowInput, AutoGrowHeightInput, PrefixedInput, MaxLengthInput, HintAndErrorInput};
