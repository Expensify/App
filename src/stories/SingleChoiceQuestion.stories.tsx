import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import type {Choice} from '@components/RadioButtons';
import SingleChoiceQuestion from '@components/SingleChoiceQuestion';

type SingleChoiceQuestionStory = StoryFn<typeof SingleChoiceQuestion>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof SingleChoiceQuestion> = {
    title: 'Forms/SingleChoiceQuestion',
    component: SingleChoiceQuestion,
};

const sampleAnswers: Choice[] = [
    {label: 'Yes', value: 'yes'},
    {label: 'No', value: 'no'},
    {label: 'Not sure', value: 'notSure'},
];

function Template(props: React.ComponentProps<typeof SingleChoiceQuestion>) {
    return <SingleChoiceQuestion {...props} />;
}

const Default: SingleChoiceQuestionStory = Template.bind({});
Default.args = {
    prompt: 'Do you want to enable automatic categorization?',
    possibleAnswers: sampleAnswers,
    currentQuestionIndex: 0,
    onInputChange: () => {},
};

export default story;
export {Default};
