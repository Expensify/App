import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import CurrencyPicker from '@components/CurrencyPicker';

type CurrencyPickerStory = StoryFn<typeof CurrencyPicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof CurrencyPicker> = {
    title: 'Forms/CurrencyPicker',
    component: CurrencyPicker,
};

function Template(props: React.ComponentProps<typeof CurrencyPicker>) {
    const [value, setValue] = useState(props.value);
    return (
        <CurrencyPicker
            {...props}
            value={value}
            onInputChange={(newValue) => setValue(newValue)}
        />
    );
}

const Default: CurrencyPickerStory = Template.bind({});
Default.args = {
    label: 'Currency',
};

const WithValue: CurrencyPickerStory = Template.bind({});
WithValue.args = {
    label: 'Currency',
    value: 'USD',
};

export default story;
export {Default, WithValue};
