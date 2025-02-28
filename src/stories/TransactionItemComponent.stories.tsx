import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import TransactionItemComponent from '@components/TransactionItemComponent';

type TransactionItemComponentStory = StoryFn<typeof TransactionItemComponent>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TransactionItemComponent> = {
    title: 'Components/TransactionItemComponent',
    component: TransactionItemComponent,
    args: {
    },
};

function Template() {
    return (
        <TransactionItemComponent/>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: TransactionItemComponentStory = Template.bind({});

const ErrorStory: TransactionItemComponentStory = Template.bind({});
ErrorStory.args = {
    errorText: 'The street you are looking for does not exist',
};

export default story;
export {Default, ErrorStory};
