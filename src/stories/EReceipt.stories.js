/* eslint-disable rulesdir/prefer-actions-set-data */
import React from 'react';
import Onyx from 'react-native-onyx';
import EReceipt from '../components/EReceipt';
import ONYXKEYS from '../ONYXKEYS';

const transactionData = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION}1`]: {transactionID: '1', amount: 1000, currency: 'USD', cardID: 4, merchant: 'United Airlines', mccGroup: 'Goods', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}2`]: {
        transactionID: '2',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Airlines',
        mccGroup: 'Airlines',
        created: '2023-07-24 13:46:20',
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}3`]: {
        transactionID: '3',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Airlines',
        mccGroup: 'Commuter',
        created: '2023-07-24 13:46:20',
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}4`]: {transactionID: '4', amount: 444444, currency: 'USD', cardID: 4, merchant: 'Chevron', mccGroup: 'Gas', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}5`]: {
        transactionID: '5',
        amount: 230440,
        currency: 'USD',
        cardID: 4,
        merchant: 'Barnes and Noble',
        mccGroup: 'Goods',
        created: '2022-03-21 13:46:20',
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}6`]: {transactionID: '6', amount: 333333, currency: 'USD', cardID: 4, merchant: 'Trader Joes', mccGroup: 'Groceries', created: '2023-12-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}7`]: {transactionID: '7', amount: 1000, currency: 'USD', cardID: 4, merchant: "Linda's Place", mccGroup: 'Hotel', created: '2023-03-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}8`]: {transactionID: '8', amount: 2000, currency: 'USD', cardID: 4, merchant: 'United Post Office', mccGroup: 'Mail', created: '2023-09-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}9`]: {transactionID: '9', amount: 40884002, currency: 'USD', cardID: 4, merchant: 'Dishoom', mccGroup: 'Meals', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}10`]: {transactionID: '10', amount: 300000, currency: 'USD', cardID: 4, merchant: 'Hertz', mccGroup: 'Rental', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}11`]: {transactionID: '11', amount: 1000, currency: 'USD', cardID: 4, merchant: 'Laundromat', mccGroup: 'Services', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}12`]: {transactionID: '12', amount: 1000, currency: 'USD', cardID: 4, merchant: 'Uber', mccGroup: 'Taxi', created: '2023-07-24 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}13`]: {
        transactionID: '13',
        amount: 11230,
        currency: 'USD',
        cardID: 4,
        merchant: 'Pirate Party Store',
        mccGroup: 'Miscellaneous',
        created: '2023-10-31 13:46:20',
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}14`]: {
        transactionID: '14',
        amount: 21500,
        currency: 'GBP',
        cardID: 4,
        merchant: 'Light Bulbs R-US',
        mccGroup: 'Utilities',
        created: '2023-06-24 13:46:20',
    },
    [`${ONYXKEYS.COLLECTION.TRANSACTION}15`]: {transactionID: '15', amount: 200, currency: 'USD', cardID: 4, merchant: 'Invalid MCC', mccGroup: 'invalidMCC', created: '2023-01-11 13:46:20'},
    [`${ONYXKEYS.COLLECTION.TRANSACTION}16`]: {
        transactionID: '16',
        amount: 200,
        currency: 'USD',
        cardID: 4,
        merchant: 'This is a very very very very very very very very long merchant name, why would you ever shop at a store with a sign this long?',
        mccGroup: 'invalidMCC',
        created: '2023-01-11 13:46:20',
    },
};

Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, transactionData);
Onyx.merge('cardList', {
    4: {bank: 'Expensify Card', lastFourPAN: '1000'},
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
    transactionID: '1',
};

const Airlines = Template.bind({});
Airlines.args = {
    transactionID: '2',
};

const Commuter = Template.bind({});
Commuter.args = {
    transactionID: '3',
};

const Gas = Template.bind({});
Gas.args = {
    transactionID: '4',
};

const Goods = Template.bind({});
Goods.args = {
    transactionID: '5',
};

const Groceries = Template.bind({});
Groceries.args = {
    transactionID: '6',
};

const Hotel = Template.bind({});
Hotel.args = {
    transactionID: '7',
};

const Mail = Template.bind({});
Mail.args = {
    transactionID: '8',
};

const Meals = Template.bind({});
Meals.args = {
    transactionID: '9',
};

const Rental = Template.bind({});
Rental.args = {
    transactionID: '10',
};

const Services = Template.bind({});
Services.args = {
    transactionID: '11',
};

const Taxi = Template.bind({});
Taxi.args = {
    transactionID: '12',
};

const Miscellaneous = Template.bind({});
Miscellaneous.args = {
    transactionID: '13',
};

const Utilities = Template.bind({});
Utilities.args = {
    transactionID: '14',
};

const invalidMCC = Template.bind({});
invalidMCC.args = {
    transactionID: '15',
};

const veryLong = Template.bind({});
veryLong.args = {
    transactionID: '16',
};

export default story;
export {Default, Airlines, Commuter, Gas, Goods, Groceries, Hotel, Mail, Meals, Rental, Services, Taxi, Miscellaneous, Utilities, invalidMCC, veryLong};
