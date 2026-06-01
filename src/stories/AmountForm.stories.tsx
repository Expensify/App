import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import AmountForm from '@components/AmountForm';
import ScrollView from '@components/ScrollView';
import withNavigationFallback from '@components/withNavigationFallback';
import CONST from '@src/CONST';

type AmountFormProps = React.ComponentProps<typeof AmountForm>;
type AmountFormStory = StoryFn<typeof AmountForm>;

const AmountFormWithNavigation = withNavigationFallback(AmountForm);

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AmountForm> = {
    title: 'Forms/AmountForm',
    component: AmountFormWithNavigation,
};

function Template(props: AmountFormProps) {
    const [value, setValue] = useState(props.value ?? '');
    return (
        <ScrollView>
            <AmountFormWithNavigation
                {...props}
                value={value}
                onInputChange={setValue}
            />
        </ScrollView>
    );
}

const Default: AmountFormStory = Template.bind({});
Default.args = {
    currency: CONST.CURRENCY.USD,
    isCurrencyPressable: false,
};

const WithError: AmountFormStory = Template.bind({});
WithError.args = {
    currency: CONST.CURRENCY.USD,
    isCurrencyPressable: false,
    errorText: 'Amount is required',
};

const WithLabel: AmountFormStory = Template.bind({});
WithLabel.args = {
    currency: CONST.CURRENCY.USD,
    label: 'Enter amount',
    isCurrencyPressable: false,
    displayAsTextInput: true,
};

export default story;
export {Default, WithError, WithLabel};
