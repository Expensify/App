import type {ComponentMeta, ComponentStory} from '@storybook/react';
import React from 'react';
import InlineSystemMessage from '@components/InlineSystemMessage';
import type {InlineSystemMessageProps} from '@components/InlineSystemMessage';

type InlineSystemMessageStory = ComponentStory<typeof InlineSystemMessage>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: ComponentMeta<typeof InlineSystemMessage> = {
    title: 'Components/InlineSystemMessage',
    component: InlineSystemMessage,
};

function Template(props: InlineSystemMessageProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InlineSystemMessage {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: InlineSystemMessageStory = Template.bind({});
Default.args = {
    message: 'This is an error message',
};

export default story;
export {Default};
