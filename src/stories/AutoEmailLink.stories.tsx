import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import AutoEmailLink from '@components/AutoEmailLink';

type AutoEmailLinkStory = StoryFn<typeof AutoEmailLink>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AutoEmailLink> = {
    title: 'Typography/AutoEmailLink',
    component: AutoEmailLink,
};

function Template(props: React.ComponentProps<typeof AutoEmailLink>) {
    return <AutoEmailLink {...props} />;
}

const PlainText: AutoEmailLinkStory = Template.bind({});
PlainText.args = {
    text: 'No email address here, just plain text.',
};

const WithEmail: AutoEmailLinkStory = Template.bind({});
WithEmail.args = {
    text: 'Contact us at support@expensify.com for help.',
};

const MultipleEmails: AutoEmailLinkStory = Template.bind({});
MultipleEmails.args = {
    text: 'Send reports to finance@company.com and cc admin@company.com.',
};

export default story;
export {PlainText, WithEmail, MultipleEmails};
