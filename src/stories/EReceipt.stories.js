"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.veryLong = exports.invalidMCC = exports.Utilities = exports.Miscellaneous = exports.Taxi = exports.Services = exports.Rental = exports.Meals = exports.Mail = exports.Hotel = exports.Groceries = exports.Goods = exports.Gas = exports.Commuter = exports.Airlines = exports.Default = void 0;
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var EReceipt_1 = require("@components/EReceipt");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var transactionData = (_a = {},
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_1")] = {
        transactionID: 'FAKE_1',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Airlines',
        mccGroup: 'Goods',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_2")] = {
        transactionID: 'FAKE_2',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Airlines',
        mccGroup: 'Airlines',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_3")] = {
        transactionID: 'FAKE_3',
        amount: 1000,
        currency: 'USD',
        cardID: 5,
        merchant: 'United Airlines',
        mccGroup: 'Commuter',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_4")] = { transactionID: 'FAKE_4', amount: 444444, currency: 'USD', cardID: 4, merchant: 'Chevron', mccGroup: 'Gas', created: '2023-07-24 13:46:20' },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_5")] = {
        transactionID: 'FAKE_5',
        amount: 230440,
        currency: 'USD',
        cardID: 4,
        merchant: 'Barnes and Noble',
        mccGroup: 'Goods',
        created: '2022-03-21 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_6")] = {
        transactionID: 'FAKE_6',
        amount: 333333,
        currency: 'USD',
        cardID: 4,
        merchant: 'Trader Joes',
        mccGroup: 'Groceries',
        created: '2023-12-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_7")] = {
        transactionID: 'FAKE_7',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: "Linda's Place",
        mccGroup: 'Hotel',
        created: '2023-03-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_8")] = {
        transactionID: 'FAKE_8',
        amount: 2000,
        currency: 'USD',
        cardID: 4,
        merchant: 'United Post Office',
        mccGroup: 'Mail',
        created: '2023-09-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_9")] = {
        transactionID: 'FAKE_9',
        amount: 40884002,
        currency: 'USD',
        cardID: 4,
        merchant: 'Dishoom',
        mccGroup: 'Meals',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_10")] = {
        transactionID: 'FAKE_10',
        amount: 300000,
        currency: 'USD',
        cardID: 4,
        merchant: 'Hertz',
        mccGroup: 'Rental',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_11")] = {
        transactionID: 'FAKE_11',
        amount: 1000,
        currency: 'USD',
        cardID: 4,
        merchant: 'Laundromat',
        mccGroup: 'Services',
        created: '2023-07-24 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_12")] = { transactionID: 'FAKE_12', amount: 1000, currency: 'USD', cardID: 4, merchant: 'Uber', mccGroup: 'Taxi', created: '2023-07-24 13:46:20' },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_13")] = {
        transactionID: 'FAKE_13',
        amount: 11230,
        currency: 'USD',
        cardID: 4,
        merchant: 'Pirate Party Store',
        mccGroup: 'Miscellaneous',
        created: '2023-10-31 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_14")] = {
        transactionID: 'FAKE_14',
        amount: 21500,
        currency: 'GBP',
        cardID: 4,
        merchant: 'Light Bulbs R-US',
        mccGroup: 'Utilities',
        created: '2023-06-24 13:46:20',
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_15")] = {
        transactionID: 'FAKE_15',
        amount: 200,
        currency: 'USD',
        cardID: 4,
        merchant: 'Invalid MCC',
        mccGroup: 'invalidMCC',
        created: '2023-01-11 13:46:20',
        hasEReceipt: true,
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "FAKE_16")] = {
        transactionID: 'FAKE_16',
        amount: 200,
        currency: 'USD',
        cardID: 4,
        merchant: 'This is a very very very very very very very very long merchant name, why would you ever shop at a store with a sign this long?',
        mccGroup: 'invalidMCC',
        created: '2023-01-11 13:46:20',
        hasEReceipt: true,
    },
    _a);
react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.TRANSACTION, transactionData);
react_native_onyx_1.default.merge('cardList', {
    4: { bank: 'Expensify Card', lastFourPAN: '1000' },
    5: { bank: 'Expensify Card', lastFourPAN: '4444' },
});
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/EReceipt',
    component: EReceipt_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <EReceipt_1.default {...props}/>;
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
var veryLong = Template.bind({});
exports.veryLong = veryLong;
veryLong.args = {
    transactionID: 'FAKE_16',
};
exports.default = story;
