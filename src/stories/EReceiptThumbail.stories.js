"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidMCC = exports.Utilities = exports.Miscellaneous = exports.Taxi = exports.Services = exports.Rental = exports.Meals = exports.Mail = exports.Hotel = exports.Groceries = exports.Goods = exports.Gas = exports.Commuter = exports.Airlines = exports.Default = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var EReceiptThumbnail_1 = require("@components/EReceiptThumbnail");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/EReceiptThumbnail',
    component: EReceiptThumbnail_1.default,
};
function Template(props) {
    return (<react_native_1.View style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <react_native_1.View>
                <EReceiptThumbnail_1.default {...props} iconSize="large"/>
            </react_native_1.View>

            <react_native_1.View style={{ height: 116, width: 89, borderRadius: 0, overflow: 'hidden' }}>
                <EReceiptThumbnail_1.default {...props} iconSize="small"/>
            </react_native_1.View>

            <react_native_1.View style={{ height: 140, width: 143, borderRadius: 16, overflow: 'hidden' }}>
                <EReceiptThumbnail_1.default {...props} iconSize="medium"/>
            </react_native_1.View>

            <react_native_1.View style={{ height: 140, width: 283, borderRadius: 16, overflow: 'hidden' }}>
                <EReceiptThumbnail_1.default {...props} iconSize="medium"/>
            </react_native_1.View>

            <react_native_1.View style={{ height: 175, width: 335, borderRadius: 16, overflow: 'hidden' }}>
                <EReceiptThumbnail_1.default {...props} iconSize="large"/>
            </react_native_1.View>
        </react_native_1.View>);
}
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    transactionID: 'FAKE_1',
};
var Airlines = Template.bind({});
exports.Airlines = Airlines;
Airlines.args = {
    transactionID: 'FAKE_2',
};
var Commuter = Template.bind({});
exports.Commuter = Commuter;
Commuter.args = {
    transactionID: 'FAKE_3',
};
var Gas = Template.bind({});
exports.Gas = Gas;
Gas.args = {
    transactionID: 'FAKE_4',
};
var Goods = Template.bind({});
exports.Goods = Goods;
Goods.args = {
    transactionID: 'FAKE_5',
};
var Groceries = Template.bind({});
exports.Groceries = Groceries;
Groceries.args = {
    transactionID: 'FAKE_6',
};
var Hotel = Template.bind({});
exports.Hotel = Hotel;
Hotel.args = {
    transactionID: 'FAKE_7',
};
var Mail = Template.bind({});
exports.Mail = Mail;
Mail.args = {
    transactionID: 'FAKE_8',
};
var Meals = Template.bind({});
exports.Meals = Meals;
Meals.args = {
    transactionID: 'FAKE_9',
};
var Rental = Template.bind({});
exports.Rental = Rental;
Rental.args = {
    transactionID: 'FAKE_10',
};
var Services = Template.bind({});
exports.Services = Services;
Services.args = {
    transactionID: 'FAKE_11',
};
var Taxi = Template.bind({});
exports.Taxi = Taxi;
Taxi.args = {
    transactionID: 'FAKE_12',
};
var Miscellaneous = Template.bind({});
exports.Miscellaneous = Miscellaneous;
Miscellaneous.args = {
    transactionID: 'FAKE_13',
};
var Utilities = Template.bind({});
exports.Utilities = Utilities;
Utilities.args = {
    transactionID: 'FAKE_14',
};
var invalidMCC = Template.bind({});
exports.invalidMCC = invalidMCC;
invalidMCC.args = {
    transactionID: 'FAKE_15',
};
exports.default = story;
