"use strict";
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreePromotedActions = exports.TwoPromotedActions = exports.Default = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var PromotedActionsBar_1 = require("@components/PromotedActionsBar");
var variables_1 = require("@src/styles/variables");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/PromotedActionsBar',
    component: PromotedActionsBar_1.default,
};
function Template(args) {
    return (<react_native_1.View style={{ maxWidth: variables_1.default.sideBarWidth }}>
            <PromotedActionsBar_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...args}/>
        </react_native_1.View>);
}
var promotedActions = [
    {
        key: 'join',
        icon: Expensicons.CommentBubbles,
        text: 'Join',
        onSelected: function () { },
    },
    {
        key: 'pin',
        icon: Expensicons.Pin,
        text: 'Pin',
        onSelected: function () { },
    },
    {
        key: 'share',
        icon: Expensicons.QrCode,
        text: 'Share',
        onSelected: function () { },
    },
];
var defaultPromotedAction = {
    key: '',
    icon: Expensicons.ExpensifyLogoNew,
    text: '',
    onSelected: function () { },
};
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    promotedActions: [(_a = promotedActions.at(0)) !== null && _a !== void 0 ? _a : defaultPromotedAction],
};
var TwoPromotedActions = Template.bind({});
exports.TwoPromotedActions = TwoPromotedActions;
TwoPromotedActions.args = {
    promotedActions: [(_b = promotedActions.at(0)) !== null && _b !== void 0 ? _b : defaultPromotedAction, (_c = promotedActions.at(1)) !== null && _c !== void 0 ? _c : defaultPromotedAction],
};
var ThreePromotedActions = Template.bind({});
exports.ThreePromotedActions = ThreePromotedActions;
ThreePromotedActions.args = {
    promotedActions: [(_d = promotedActions.at(0)) !== null && _d !== void 0 ? _d : defaultPromotedAction, (_e = promotedActions.at(1)) !== null && _e !== void 0 ? _e : defaultPromotedAction, (_f = promotedActions.at(2)) !== null && _f !== void 0 ? _f : defaultPromotedAction],
};
exports.default = story;
