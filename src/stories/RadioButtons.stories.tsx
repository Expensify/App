import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import RadioButtons from '@components/RadioButtons';
import type {Choice} from '@components/RadioButtons';

type RadioButtonsStory = StoryFn<typeof RadioButtons>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof RadioButtons> = {
    title: 'Forms/RadioButtons',
    component: RadioButtons,
};

const sampleItems: Choice[] = [
    {label: 'Option A', value: 'optionA'},
    {label: 'Option B', value: 'optionB'},
    {label: 'Option C', value: 'optionC'},
];

function Template(props: React.ComponentProps<typeof RadioButtons>) {
    const [selected, setSelected] = useState(props.defaultCheckedValue ?? '');
    return (
        <RadioButtons
            {...props}
            value={selected}
            onSelect={setSelected}
        />
    );
}

const Default: RadioButtonsStory = Template.bind({});
Default.args = {
    items: sampleItems,
    defaultCheckedValue: 'optionA',
    onSelect: () => {},
};

const WithError: RadioButtonsStory = Template.bind({});
WithError.args = {
    items: sampleItems,
    defaultCheckedValue: '',
    onSelect: () => {},
    errorText: 'Please select an option.',
};

export default story;
export {Default, WithError};
