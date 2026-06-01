import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import PlanTypeSelector from '@components/PlanTypeSelector';

type PlanTypeSelectorStory = StoryFn<typeof PlanTypeSelector>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PlanTypeSelector> = {
    title: 'Forms/PlanTypeSelector',
    component: PlanTypeSelector,
};

function Template(props: React.ComponentProps<typeof PlanTypeSelector>) {
    const [value, setValue] = useState(props.value);
    return (
        <PlanTypeSelector
            {...props}
            value={value}
            onInputChange={(newValue) => setValue(newValue)}
        />
    );
}

const Default: PlanTypeSelectorStory = Template.bind({});
Default.args = {
    inputID: 'planTypeSelectorInput',
    label: 'Plan type',
};

const WithValue: PlanTypeSelectorStory = Template.bind({});
WithValue.args = {
    inputID: 'planTypeSelectorWithValue',
    label: 'Plan type',
    value: 'team',
};

export default story;
export {Default, WithValue};
