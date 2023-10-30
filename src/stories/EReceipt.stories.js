/* eslint-disable rulesdir/prefer-actions-set-data */
import React from 'react';
import Onyx from 'react-native-onyx';
import EReceipt from '../components/EReceipt';
import ONYXKEYS from '../ONYXKEYS';

const transactionData = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_1`]: {
        transactionID: 'FAKE_1',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Airlines',
        mccGroup: 'Goods',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_2`]: {
        transactionID: 'FAKE_2',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Airlines',
        mccGroup: 'Airlines',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_3`]: {
        transactionID: 'FAKE_3',
        amount: 1000,
        currency: 'USD',
        cardID: 5,
        merchant: 'United Airlines',
        mccGroup: 'Commuter',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_4`]: {transactionID: 'FAKE_4', amount: 444444, currency: 'USD', cardID: 4, merchant: 'Chevron', mccGroup: 'Gas', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_5`]: {
        transactionID: 'FAKE_5',
        amount: 230440,
        currency: 'USD',
        cardID: 4,
        merchant: 'Barnes and Noble',
        mccGroup: 'Goods',
        created: '2022-03-21 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_6`]: {
        transactionID: 'FAKE_6',
        amount: 333333,
        currency: 'USD',
        cardID: 4,
        merchant: 'Trader Joes',
        mccGroup: 'Groceries',
        created: '2023-12-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_7`]: {
        transactionID: 'FAKE_7',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: "Linda's Place",
        mccGroup: 'Hotel',
        created: '2023-03-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_8`]: {
        transactionID: 'FAKE_8',
        amount: 2000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Post Office',
        mccGroup: 'Mail',
        created: '2023-09-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_9`]: {
        transactionID: 'FAKE_9',
        amount: 40884002,
        currency: 'USD',
        cardID: 4,
        merchant: 'Dishoom',
        mccGroup: 'Meals',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_10`]: {
        transactionID: 'FAKE_10',
        amount: 300000,
        currency: 'USD',
        cardID: 4,
        merchant: 'Hertz',
        mccGroup: 'Rental',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_11`]: {
        transactionID: 'FAKE_11',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'Laundromat',
        mccGroup: 'Services',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_12`]: {transactionID: 'FAKE_12', amount: 1000, currency: 'USD', cardID: 4, merchant: 'Uber', mccGroup: 'Taxi', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_13`]: {
        transactionID: 'FAKE_13',
        amount: 11230,
        currency: 'USD',
        cardID: 4,
        merchant: 'Pirate Party Store',
        mccGroup: 'Miscellaneous',
        created: '2023-10-31 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_14`]: {
        transactionID: 'FAKE_14',
        amount: 21500,
        currency: 'GBP',
        cardID: 4,
        merchant: 'Light Bulbs R-US',
        mccGroup: 'Utilities',
        created: '2023-06-24 13:46:20',
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_15`]: {
        transactionID: 'FAKE_15',
        amount: 200,
        currency: 'USD',
        cardID: 4,
        merchant: 'Invalid MCC',
        mccGroup: 'invalidMCC',
        created: '2023-01-11 13:46:20',
        hasEReceipt: true,
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}FAKE_16`]: {
        transactionID: 'FAKE_16',
        amount: 200,
        currency: 'USD',
        cardID: 4,
        merchant: 'This is a very very very very very very very very long merchant name, why would you ever shop at a store with a sign this long?',
        mccGroup: 'invalidMCC',
        created: '2023-01-11 13:46:20',
        hasEReceipt: true,
    },
};

Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, transactionData);
Onyx.merge('cardList', {
    4: {bank: 'Expensify Card', lastFourPAN: '1000'},
    5: {bank: 'Expensify Card', lastFourPAN: '4444'},
});

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
    transactionID: 'FAKE_1',
};

const Airlines = Template.bind({});
Airlines.args = {
    transactionID: 'FAKE_2',
};

const Commuter = Template.bind({});
Commuter.args = {
    transactionID: 'FAKE_3',
};

const Gas = Template.bind({});
Gas.args = {
    transactionID: 'FAKE_4',
};

const Goods = Template.bind({});
Goods.args = {
    transactionID: 'FAKE_5',
};

const Groceries = Template.bind({});
Groceries.args = {
    transactionID: 'FAKE_6',
};

const Hotel = Template.bind({});
Hotel.args = {
    transactionID: 'FAKE_7',
};

const Mail = Template.bind({});
Mail.args = {
    transactionID: 'FAKE_8',
};

const Meals = Template.bind({});
Meals.args = {
    transactionID: 'FAKE_9',
};

const Rental = Template.bind({});
Rental.args = {
    transactionID: 'FAKE_10',
};

const Services = Template.bind({});
Services.args = {
    transactionID: 'FAKE_11',
};

const Taxi = Template.bind({});
Taxi.args = {
    transactionID: 'FAKE_12',
};

const Miscellaneous = Template.bind({});
Miscellaneous.args = {
    transactionID: 'FAKE_13',
};

const Utilities = Template.bind({});
Utilities.args = {
    transactionID: 'FAKE_14',
};

const invalidMCC = Template.bind({});
invalidMCC.args = {
    transactionID: 'FAKE_15',
};

const veryLong = Template.bind({});
veryLong.args = {
    transactionID: 'FAKE_16',
};

export default story;
export {Default, Airlines, Commuter, Gas, Goods, Groceries, Hotel, Mail, Meals, Rental, Services, Taxi, Miscellaneous, Utilities, invalidMCC, veryLong};
