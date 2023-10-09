/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {View} from 'react-native';
import EReceiptThumbnail from '../components/EReceiptThumbnail';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/EReceiptThumbnail',
    component: EReceiptThumbnail,
};

function Template(args) {
    return (
        <>
            <View>
                <EReceiptThumbnail {...args} />
            </View>

            <View style={{height: 116, width: 89, borderRadius: 0, overflow: 'hidden'}}>
                <EReceiptThumbnail {...args} />
            </View>

            <View style={{height: 140, width: 143, borderRadius: 16, overflow: 'hidden'}}>
                <EReceiptThumbnail {...args} />
            </View>

            <View style={{height: 140, width: 283, borderRadius: 16, overflow: 'hidden'}}>
                <EReceiptThumbnail {...args} />
            </View>

            <View style={{height: 175, width: 335, borderRadius: 16, overflow: 'hidden'}}>
                <EReceiptThumbnail {...args} />
            </View>
        </>
    );
}

const Default = Template.bind({});
Default.args = {
    transactionID: '1',
    transaction: {transactionID: '1', amount: 1000, currency: 'USD', cardID: 4, merchant: 'United Airlines', mccGroup: 'Goods', created: '2023-07-24 13:46:20'},
};

const Airlines = Template.bind({});
Airlines.args = {
    transactionID: '1',
    transaction: {transactionID: '2', amount: 1000, currency: 'USD', cardID: 4, merchant: 'United Airlines', mccGroup: 'Airlines', created: '2023-07-24 13:46:20'},
};

const Commuter = Template.bind({});
Commuter.args = {
    transactionID: '1',
    transaction: {transactionID: '3', amount: 1000, currency: 'USD', cardID: 4, merchant: 'United Airlines', mccGroup: 'Commuter', created: '2023-07-24 13:46:20'},
};

const Gas = Template.bind({});
Gas.args = {
    transactionID: '1',
    transaction: {transactionID: '4', amount: 444444, currency: 'USD', cardID: 4, merchant: 'Chevron', mccGroup: 'Gas', created: '2023-07-24 13:46:20'},
};

const Goods = Template.bind({});
Goods.args = {
    transactionID: '1',
    transaction: {transactionID: '5', amount: 230440, currency: 'USD', cardID: 4, merchant: 'Barnes and Noble', mccGroup: 'Goods', created: '2022-03-21 13:46:20'},
};

const Groceries = Template.bind({});
Groceries.args = {
    transactionID: '1',
    transaction: {transactionID: '6', amount: 333333, currency: 'USD', cardID: 4, merchant: 'Trader Joes', mccGroup: 'Groceries', created: '2023-12-24 13:46:20'},
};

const Hotel = Template.bind({});
Hotel.args = {
    transactionID: '1',
    transaction: {transactionID: '7', amount: 1000, currency: 'USD', cardID: 4, merchant: "Linda's Place", mccGroup: 'Hotel', created: '2023-03-24 13:46:20'},
};

const Mail = Template.bind({});
Mail.args = {
    transactionID: '1',
    transaction: {transactionID: '8', amount: 2000, currency: 'USD', cardID: 4, merchant: 'United Post Office', mccGroup: 'Mail', created: '2023-09-24 13:46:20'},
};

const Meals = Template.bind({});
Meals.args = {
    transactionID: '1',
    transaction: {transactionID: '9', amount: 40884002, currency: 'USD', cardID: 4, merchant: 'Dishoom', mccGroup: 'Meals', created: '2023-07-24 13:46:20'},
};

const Rental = Template.bind({});
Rental.args = {
    transactionID: '1',
    transaction: {transactionID: '10', amount: 300000, currency: 'USD', cardID: 4, merchant: 'Hertz', mccGroup: 'Rental', created: '2023-07-24 13:46:20'},
};

const Services = Template.bind({});
Services.args = {
    transactionID: '1',
    transaction: {transactionID: '11', amount: 1000, currency: 'USD', cardID: 4, merchant: 'Laundromat', mccGroup: 'Services', created: '2023-07-24 13:46:20'},
};

const Taxi = Template.bind({});
Taxi.args = {
    transactionID: '1',
    transaction: {transactionID: '12', amount: 1000, currency: 'USD', cardID: 4, merchant: 'Uber', mccGroup: 'Taxi', created: '2023-07-24 13:46:20'},
};

const Miscellaneous = Template.bind({});
Miscellaneous.args = {
    transactionID: '1',
    transaction: {transactionID: '13', amount: 11230, currency: 'USD', cardID: 4, merchant: 'Pirate Party Store', mccGroup: 'Miscellaneous', created: '2023-10-31 13:46:20'},
};

const Utilities = Template.bind({});
Utilities.args = {
    transactionID: '1',
    transaction: {transactionID: '14', amount: 21500, currency: 'GBP', cardID: 4, merchant: 'Light Bulbs R-US', mccGroup: 'Utilities', created: '2023-06-24 13:46:20'},
};

const invalidMCC = Template.bind({});
invalidMCC.args = {
    transactionID: '1',
    transaction: {transactionID: '15', amount: 200, currency: 'USD', cardID: 4, merchant: 'Invalid MCC', mccGroup: 'invalidMCC', created: '2023-01-11 13:46:20'},
};

export default story;
export {Default, Airlines, Commuter, Gas, Goods, Groceries, Hotel, Mail, Meals, Rental, Services, Taxi, Miscellaneous, Utilities, invalidMCC};
