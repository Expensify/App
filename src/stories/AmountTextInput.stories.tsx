import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import AmountTextInput from '@components/AmountTextInput';
import withNavigationFallback from '@components/withNavigationFallback';

type AmountTextInputStory = StoryFn<typeof AmountTextInput>;

const AmountTextInputWithNavigation = withNavigationFallback(AmountTextInput);

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AmountTextInput> = {
    title: 'Forms/AmountTextInput',
    component: AmountTextInputWithNavigation,
};

function Template(props: React.ComponentProps<typeof AmountTextInput>) {
    const [amount, setAmount] = useState(props.formattedAmount);
    return (
        <AmountTextInputWithNavigation
            {...props}
            formattedAmount={amount}
            onChangeAmount={setAmount}
        />
    );
}

const Default: AmountTextInputStory = Template.bind({});
Default.args = {
    formattedAmount: '',
    placeholder: '0.00',
    disableKeyboard: false,
};

const WithValue: AmountTextInputStory = Template.bind({});
WithValue.args = {
    formattedAmount: '42.00',
    placeholder: '0.00',
    disableKeyboard: false,
};

export default story;
export {Default, WithValue};
