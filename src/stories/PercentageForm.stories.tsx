import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import PercentageForm from '@components/PercentageForm';

type PercentageFormStory = StoryFn<typeof PercentageForm>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PercentageForm> = {
    title: 'Forms/PercentageForm',
    component: PercentageForm,
};

function Template(props: React.ComponentProps<typeof PercentageForm>) {
    const [value, setValue] = useState(props.value ?? '');
    return (
        <PercentageForm
            {...props}
            value={value}
            onInputChange={setValue}
        />
    );
}

const Default: PercentageFormStory = Template.bind({});
Default.args = {
    label: 'Percentage',
    value: '',
};

const AllowDecimal: PercentageFormStory = Template.bind({});
AllowDecimal.args = {
    label: 'Percentage (with decimal)',
    value: '',
    allowDecimal: true,
};

const AllowExceedingHundred: PercentageFormStory = Template.bind({});
AllowExceedingHundred.args = {
    label: 'Percentage (allow > 100%)',
    value: '',
    allowExceedingHundred: true,
};

export default story;
export {Default, AllowDecimal, AllowExceedingHundred};
