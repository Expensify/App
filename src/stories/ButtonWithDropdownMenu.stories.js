"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var react_1 = require("react");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var Expensicons = require("@components/Icon/Expensicons");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/ButtonWithDropdownMenu',
    component: ButtonWithDropdownMenu_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ButtonWithDropdownMenu_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    customText: 'Pay with Expensify',
    onPress: function (e, item) {
        alert("Button ".concat(item, " is pressed."));
    },
    pressOnEnter: true,
    options: [
        { value: 'One', text: 'One', icon: Expensicons.Wallet },
        { value: 'Two', text: 'Two', icon: Expensicons.Wallet },
    ],
};
exports.default = story;
