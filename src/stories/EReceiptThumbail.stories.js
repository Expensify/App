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
        <View style={{display: 'flex', flexDirection: 'column', gap: 12}}>
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
        </View>
    );
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

export default story;
export {Default, Airlines, Commuter, Gas, Goods, Groceries, Hotel, Mail, Meals, Rental, Services, Taxi, Miscellaneous, Utilities, invalidMCC};
