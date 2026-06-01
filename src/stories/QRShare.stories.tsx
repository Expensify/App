import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import QRShare from '@components/QRShare';
import type {QRShareProps} from '@components/QRShare/types';

type QRShareStory = StoryFn<typeof QRShare>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof QRShare> = {
    title: 'Data Display/QRShare',
    component: QRShare,
};

function Template(props: QRShareProps) {
    return <QRShare {...props} />;
}

const Default: QRShareStory = Template.bind({});
Default.args = {
    url: 'https://expensify.com',
    title: 'My Expensify Profile',
    subtitle: 'user@example.com',
    shouldShowExpensifyLogo: true,
};

const WithoutLogo: QRShareStory = Template.bind({});
WithoutLogo.args = {
    url: 'https://expensify.com/workspace/example',
    title: 'My Workspace',
    subtitle: 'workspace@example.com',
    shouldShowExpensifyLogo: false,
};

export default story;
export {Default, WithoutLogo};
