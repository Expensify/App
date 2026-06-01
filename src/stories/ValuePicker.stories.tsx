import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import ValuePicker from '@components/ValuePicker';

type ValuePickerStory = StoryFn<typeof ValuePicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ValuePicker> = {
    title: 'Forms/ValuePicker',
    component: ValuePicker,
};

function Template(props: React.ComponentProps<typeof ValuePicker>) {
    const [value, setValue] = useState(props.value);
    return (
        <ValuePicker
            {...props}
            value={value}
            onInputChange={(newValue) => setValue(newValue)}
        />
    );
}

const Default: ValuePickerStory = Template.bind({});
Default.args = {
    label: 'Category',
    items: [
        {label: 'Food', value: 'food'},
        {label: 'Travel', value: 'travel'},
        {label: 'Accommodation', value: 'accommodation'},
    ],
    placeholder: 'Select a category',
};

const WithSelectedValue: ValuePickerStory = Template.bind({});
WithSelectedValue.args = {
    label: 'Category',
    value: 'travel',
    items: [
        {label: 'Food', value: 'food'},
        {label: 'Travel', value: 'travel'},
        {label: 'Accommodation', value: 'accommodation'},
    ],
};

export default story;
export {Default, WithSelectedValue};
