import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import DatePicker from '@components/DatePicker';

type DatePickerStory = StoryFn<typeof DatePicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof DatePicker> = {
    title: 'Forms/DatePicker',
    component: DatePicker,
};

function Template(props: React.ComponentProps<typeof DatePicker>) {
    const [value, setValue] = useState(props.value ?? '');
    return (
        <DatePicker
            {...props}
            value={value}
            onInputChange={(newValue) => setValue(newValue)}
        />
    );
}

const Default: DatePickerStory = Template.bind({});
Default.args = {
    inputID: 'datePickerInput',
    label: 'Date',
    placeholder: 'Select a date',
};

const WithValue: DatePickerStory = Template.bind({});
WithValue.args = {
    inputID: 'datePickerWithValue',
    label: 'Date of expense',
    value: '2024-06-15',
};

export default story;
export {Default, WithValue};
