/* eslint-disable react/jsx-props-no-spreading */
import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import type {EReceiptThumbnailProps} from '@components/EReceiptThumbnail';
import EReceiptThumbnail from '@components/EReceiptThumbnail';

type EReceiptThumbnailStory = StoryFn<typeof EReceiptThumbnail>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof EReceiptThumbnail> = {
    title: 'Components/EReceiptThumbnail',
    component: EReceiptThumbnail,
};

function Template(props: EReceiptThumbnailProps) {
    return (
        <View style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <View>
                <EReceiptThumbnail
                    {...props}
                    iconSize="large"
                />
            </View>

            <View style={{height: 116, width: 89, borderRadius: 0, overflow: 'hidden'}}>
                <EReceiptThumbnail
                    {...props}
                    iconSize="small"
                />
            </View>

            <View style={{height: 140, width: 143, borderRadius: 16, overflow: 'hidden'}}>
                <EReceiptThumbnail
                    {...props}
                    iconSize="medium"
                />
            </View>

            <View style={{height: 140, width: 283, borderRadius: 16, overflow: 'hidden'}}>
                <EReceiptThumbnail
                    {...props}
                    iconSize="medium"
                />
            </View>

            <View style={{height: 175, width: 335, borderRadius: 16, overflow: 'hidden'}}>
                <EReceiptThumbnail
                    {...props}
                    iconSize="large"
                />
            </View>
        </View>
    );
}

const Default: EReceiptThumbnailStory = Template.bind({});
Default.args = {
    transactionID: 'FAKE_1',
};

const Airlines: EReceiptThumbnailStory = Template.bind({});
Airlines.args = {
    transactionID: 'FAKE_2',
};

const Commuter: EReceiptThumbnailStory = Template.bind({});
Commuter.args = {
    transactionID: 'FAKE_3',
};

const Gas: EReceiptThumbnailStory = Template.bind({});
Gas.args = {
    transactionID: 'FAKE_4',
};

const Goods: EReceiptThumbnailStory = Template.bind({});
Goods.args = {
    transactionID: 'FAKE_5',
};

const Groceries: EReceiptThumbnailStory = Template.bind({});
Groceries.args = {
    transactionID: 'FAKE_6',
};

const Hotel: EReceiptThumbnailStory = Template.bind({});
Hotel.args = {
    transactionID: 'FAKE_7',
};

const Mail: EReceiptThumbnailStory = Template.bind({});
Mail.args = {
    transactionID: 'FAKE_8',
};

const Meals: EReceiptThumbnailStory = Template.bind({});
Meals.args = {
    transactionID: 'FAKE_9',
};

const Rental: EReceiptThumbnailStory = Template.bind({});
Rental.args = {
    transactionID: 'FAKE_10',
};

const Services: EReceiptThumbnailStory = Template.bind({});
Services.args = {
    transactionID: 'FAKE_11',
};

const Taxi: EReceiptThumbnailStory = Template.bind({});
Taxi.args = {
    transactionID: 'FAKE_12',
};

const Miscellaneous: EReceiptThumbnailStory = Template.bind({});
Miscellaneous.args = {
    transactionID: 'FAKE_13',
};

const Utilities: EReceiptThumbnailStory = Template.bind({});
Utilities.args = {
    transactionID: 'FAKE_14',
};

const invalidMCC: EReceiptThumbnailStory = Template.bind({});
invalidMCC.args = {
    transactionID: 'FAKE_15',
};

export default story;
export {Default, Airlines, Commuter, Gas, Goods, Groceries, Hotel, Mail, Meals, Rental, Services, Taxi, Miscellaneous, Utilities, invalidMCC};
