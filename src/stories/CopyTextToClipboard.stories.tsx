import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import CopyTextToClipboard from '@components/CopyTextToClipboard';

type CopyTextToClipboardStory = StoryFn<typeof CopyTextToClipboard>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof CopyTextToClipboard> = {
    title: 'Buttons & Actions/CopyTextToClipboard',
    component: CopyTextToClipboard,
};

function Template(props: React.ComponentProps<typeof CopyTextToClipboard>) {
    return <CopyTextToClipboard {...props} />;
}

const Default: CopyTextToClipboardStory = Template.bind({});
Default.args = {
    text: 'user@example.com',
};

const WithURL: CopyTextToClipboardStory = Template.bind({});
WithURL.args = {
    text: 'Copy link',
    urlToCopy: 'https://expensify.com/r/12345',
};

export default story;
export {Default, WithURL};
