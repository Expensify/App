import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import AmountPicker from '@components/AmountPicker';

type AmountPickerStory = StoryFn<typeof AmountPicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AmountPicker> = {
    title: 'Forms/AmountPicker',
    component: AmountPicker,
};

function Template(props: React.ComponentProps<typeof AmountPicker>) {
    const [value, setValue] = useState(props.value);
    return (
        <AmountPicker
            {...props}
            value={value}
            onInputChange={(newValue) => setValue(newValue)}
        />
    );
}

const Default: AmountPickerStory = Template.bind({});
Default.args = {
    description: 'Maximum amount',
    title: 'Amount',
};

const WithValue: AmountPickerStory = Template.bind({});
WithValue.args = {
    description: 'Maximum amount',
    title: 'Amount',
    value: '1000',
};

export default story;
export {Default, WithValue};
