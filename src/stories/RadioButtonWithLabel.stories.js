"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checked = exports.Default = void 0;
var react_1 = require("react");
var RadioButtonWithLabel_1 = require("@components/RadioButtonWithLabel");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/RadioButtonWithLabel',
    component: RadioButtonWithLabel_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RadioButtonWithLabel_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var Checked = Template.bind({});
exports.Checked = Checked;
Default.args = {
    isChecked: false,
    label: 'This radio button is unchecked',
};
Checked.args = {
    isChecked: true,
    label: 'This radio button is checked',
};
exports.default = story;
