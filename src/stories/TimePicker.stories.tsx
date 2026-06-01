import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import TimePicker from '@components/TimePicker/TimePicker';

type TimePickerStory = StoryFn<typeof TimePicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TimePicker> = {
    title: 'Forms/TimePicker',
    component: TimePicker,
};

function Template(props: React.ComponentProps<typeof TimePicker>) {
    return <TimePicker {...props} />;
}

const Default: TimePickerStory = Template.bind({});
Default.args = {
    defaultValue: '',
    onSubmit: () => {},
    shouldValidate: false,
};

const WithDefaultValue: TimePickerStory = Template.bind({});
WithDefaultValue.args = {
    defaultValue: '10:30 AM',
    onSubmit: () => {},
    shouldValidate: false,
};

export default story;
export {Default, WithDefaultValue};
