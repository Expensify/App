import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import StatePicker from '@components/StatePicker';

type StatePickerStory = StoryFn<typeof StatePicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof StatePicker> = {
    title: 'Forms/StatePicker',
    component: StatePicker,
};

function Template(props: React.ComponentProps<typeof StatePicker>) {
    const [value, setValue] = useState(props.value);
    return (
        <StatePicker
            {...props}
            value={value}
            onInputChange={(newValue) => setValue(newValue)}
        />
    );
}

const Default: StatePickerStory = Template.bind({});
Default.args = {};

const WithValue: StatePickerStory = Template.bind({});
WithValue.args = {
    value: 'CA',
};

export default story;
export {Default, WithValue};
