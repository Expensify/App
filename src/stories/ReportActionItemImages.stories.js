"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayMultipleEReceipts = exports.DisplayEReceipt = exports.ThreePlusTenImages = exports.ThreePlusTwoImages = exports.FourImages = exports.ThreeImages = exports.TwoImages = exports.Default = void 0;
var react_1 = require("react");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ReportActionItemImages_1 = require("@components/ReportActionItem/ReportActionItemImages");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/ReportActionItemImages',
    component: ReportActionItemImages_1.default,
};
function Template(props) {
    return (<PressableWithoutFeedback_1.default accessibilityLabel="ReportActionItemImages Story" style={{ flex: 1 }}>
            {function (_a) {
            var hovered = _a.hovered;
            return (<ReportActionItemImages_1.default 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props} isHovered={hovered}/>);
        }}
        </PressableWithoutFeedback_1.default>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    images: [{ image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg', thumbnail: '' }],
    size: 1,
    total: 1,
};
var DisplayEReceipt = Template.bind({});
exports.DisplayEReceipt = DisplayEReceipt;
DisplayEReceipt.args = {
    images: [
        {
            image: 'eReceipt/FAKE_3',
            thumbnail: '',
            transaction: {
                transactionID: 'FAKE_3',
                amount: 1000,
                currency: 'USD',
                cardID: 5,
                merchant: 'United Airlines',
                mccGroup: 'Commuter',
                created: '2023-07-24 13:46:20',
                hasEReceipt: true,
                comment: { attendees: [{ email: 'test@expensify.com', displayName: 'Test User', avatarUrl: '' }] },
                reportID: 'REPORT_1',
            },
        },
    ],
    size: 1,
    total: 1,
};
var DisplayMultipleEReceipts = Template.bind({});
exports.DisplayMultipleEReceipts = DisplayMultipleEReceipts;
DisplayMultipleEReceipts.args = {
    images: [
        {
            image: 'eReceipt/FAKE_3',
            thumbnail: '',
            transaction: {
                transactionID: 'FAKE_3',
                amount: 1000,
                currency: 'USD',
                cardID: 5,
                merchant: 'United Airlines',
                mccGroup: 'Commuter',
                created: '2023-07-24 13:46:20',
                hasEReceipt: true,
                comment: { attendees: [{ email: 'test@expensify.com', displayName: 'Test User', avatarUrl: '' }] },
                reportID: 'REPORT_1',
            },
        },
        {
            image: 'eReceipt/FAKE_5',
            thumbnail: '',
            transaction: {
                transactionID: 'FAKE_5',
                amount: 230440,
                currency: 'USD',
                cardID: 4,
                merchant: 'Barnes and Noble',
                mccGroup: 'Goods',
                created: '2022-03-21 13:46:20',
                hasEReceipt: true,
                comment: { attendees: [{ email: 'test@expensify.com', displayName: 'Test User', avatarUrl: '' }] },
                reportID: 'REPORT_2',
            },
        },
        {
            image: 'eReceipt/FAKE_2',
            thumbnail: '',
            transaction: {
                transactionID: 'FAKE_2',
                amount: 1000,
                currency: 'USD',
                cardID: 4,
                merchant: 'United Airlines',
                mccGroup: 'Airlines',
                created: '2023-07-24 13:46:20',
                hasEReceipt: true,
                comment: { attendees: [{ email: 'test@expensify.com', displayName: 'Test User', avatarUrl: '' }] },
                reportID: 'REPORT_3',
            },
        },
    ],
    size: 3,
    total: 3,
};
var TwoImages = Template.bind({});
exports.TwoImages = TwoImages;
TwoImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
    ],
    size: 2,
    total: 2,
};
var ThreeImages = Template.bind({});
exports.ThreeImages = ThreeImages;
ThreeImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
    ],
    size: 3,
    total: 3,
};
var FourImages = Template.bind({});
exports.FourImages = FourImages;
FourImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
        {
            image: 'https://www.alleycat.org/wp-content/uploads/2019/03/FELV-cat.jpg',
            thumbnail: '',
        },
    ],
    size: 4,
    total: 4,
};
var ThreePlusTwoImages = Template.bind({});
exports.ThreePlusTwoImages = ThreePlusTwoImages;
ThreePlusTwoImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
    ],
    size: 3,
    total: 5,
};
var ThreePlusTenImages = Template.bind({});
exports.ThreePlusTenImages = ThreePlusTenImages;
ThreePlusTenImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
    ],
    size: 3,
    total: 13,
};
exports.default = story;
