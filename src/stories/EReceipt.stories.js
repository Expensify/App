import React from 'react';
import EReceipt from '../components/EReceipt';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/EReceipt',
    component: EReceipt,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <EReceipt {...args} />;
}

const Default = Template.bind({});
Default.args = {
    transactionID: '1',
    transaction: {},
};

export default story;
export {Default};
