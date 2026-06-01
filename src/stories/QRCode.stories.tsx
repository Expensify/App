import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import QRCode from '@components/QRCode';

type QRCodeStory = StoryFn<typeof QRCode>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof QRCode> = {
    title: 'Data Display/QRCode',
    component: QRCode,
};

function Template(props: React.ComponentProps<typeof QRCode>) {
    return <QRCode {...props} />;
}

const Default: QRCodeStory = Template.bind({});
Default.args = {
    url: 'https://expensify.com',
    size: 200,
    accessibilityLabel: 'QR code for Expensify',
};

export default story;
export {Default};
