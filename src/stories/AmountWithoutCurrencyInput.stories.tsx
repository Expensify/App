import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';

type AmountWithoutCurrencyInputStory = StoryFn<typeof AmountWithoutCurrencyInput>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AmountWithoutCurrencyInput> = {
    title: 'Forms/AmountWithoutCurrencyInput',
    component: AmountWithoutCurrencyInput,
};

function Template(props: React.ComponentProps<typeof AmountWithoutCurrencyInput>) {
    const [value, setValue] = useState(props.value ?? '');
    return (
        <AmountWithoutCurrencyInput
            {...props}
            value={value}
            onInputChange={setValue}
        />
    );
}

const Default: AmountWithoutCurrencyInputStory = Template.bind({});
Default.args = {
    label: 'Amount',
    value: '',
};

const AllowNegative: AmountWithoutCurrencyInputStory = Template.bind({});
AllowNegative.args = {
    label: 'Amount (allow negative)',
    value: '',
    shouldAllowNegative: true,
};

export default story;
export {Default, AllowNegative};
