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
    transaction: {transactionID: '6', amount: 333333, currency: 'USD', cardID: 4, merchant: 'Trader Joes', mccGroup: 'Groceries', created: '2023-12-24 13:46:20'},
};

const veryLongMerchant = Template.bind({});
veryLongMerchant.args = {
    transactionID: '1',
    transaction: {
        transactionID: '15',
        amount: 200,
        currency: 'USD',
        cardID: 4,
        merchant: 'This is a very very very very very very very very long merchant name, why would you ever shop at a store with a sign this long?',
        mccGroup: 'invalidMCC',
        created: '2023-01-11 13:46:20',
    },
};

export default story;
export {Default, veryLongMerchant};
