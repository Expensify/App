import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import FormHelpMessage from '@components/FormHelpMessage';

type FormHelpMessageStory = StoryFn<typeof FormHelpMessage>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof FormHelpMessage> = {
    title: 'Forms/FormHelpMessage',
    component: FormHelpMessage,
};

function Template(props: React.ComponentProps<typeof FormHelpMessage>) {
    return <FormHelpMessage {...props} />;
}

const Error: FormHelpMessageStory = Template.bind({});
Error.args = {
    message: 'This field is required.',
    isError: true,
};

const Hint: FormHelpMessageStory = Template.bind({});
Hint.args = {
    message: 'Enter your full legal name.',
    isError: false,
};

const Info: FormHelpMessageStory = Template.bind({});
Info.args = {
    message: 'Changes may take up to 24 hours to appear.',
    isError: false,
    isInfo: true,
};

export default story;
export {Error, Hint, Info};
