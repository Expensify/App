import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import Picker from '@components/Picker';
import type {BasePickerProps} from '@components/Picker/types';

type PickerStory = StoryFn<typeof Picker<string>>;

type TemplateProps = Omit<BasePickerProps<string>, 'onInputChange'>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Picker> = {
    title: 'Components/Picker',
    component: Picker,
};

function Template(props: TemplateProps) {
    const [value, setValue] = useState('');
    return (
        <Picker
            value={value}
            onInputChange={(e) => setValue(e)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const Default: PickerStory = Template.bind({});
Default.args = {
    label: 'Default picker',
    hintText: 'Default hint text',
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

const PickerWithValue: PickerStory = Template.bind({});
PickerWithValue.args = {
    label: 'Picker with defined value',
    value: 'apple',
    hintText: 'Picker with hint text',
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

const ErrorStory: PickerStory = Template.bind({});
ErrorStory.args = {
    label: 'Picker with error',
    hintText: 'Picker hint text',
    errorText: 'This field has an error.',
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

const Disabled: PickerStory = Template.bind({});
Disabled.args = {
    label: 'Picker disabled',
    value: 'orange',
    isDisabled: true,
    hintText: 'Picker hint text',
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
export {Default, PickerWithValue, ErrorStory, Disabled};
