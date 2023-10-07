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
    transaction: {amount: 1000, currency: 'USD', cardID: 4, merchant: "United Airlines", mccGroup: "Airlines", created: "2023-07-24 13:46:20"},
};

export default story;
export {Default};
