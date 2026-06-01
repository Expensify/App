import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import TextPicker from '@components/TextPicker';

type TextPickerStory = StoryFn<typeof TextPicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TextPicker> = {
    title: 'Forms/TextPicker',
    component: TextPicker,
};

function Template(props: React.ComponentProps<typeof TextPicker>) {
    const [value, setValue] = useState(props.value);
    return (
        <TextPicker
            {...props}
            value={value}
            onInputChange={(newValue) => setValue(newValue)}
        />
    );
}

const Default: TextPickerStory = Template.bind({});
Default.args = {
    inputID: 'textPickerInput',
    description: 'Description',
    placeholder: 'Enter a description',
};

const WithValue: TextPickerStory = Template.bind({});
WithValue.args = {
    inputID: 'textPickerWithValue',
    description: 'Merchant',
    value: 'Acme Corporation',
};

export default story;
export {Default, WithValue};
