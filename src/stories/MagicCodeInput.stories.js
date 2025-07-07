"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitOnComplete = exports.AutoFocus = void 0;
var react_1 = require("react");
var MagicCodeInput_1 = require("@components/MagicCodeInput");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/MagicCodeInput',
    component: MagicCodeInput_1.default,
};
function Template(props) {
    var _a = (0, react_1.useState)(''), value = _a[0], setValue = _a[1];
    return (<MagicCodeInput_1.default value={value} onChangeText={setValue} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var AutoFocus = Template.bind({});
exports.AutoFocus = AutoFocus;
AutoFocus.args = {
    name: 'AutoFocus',
    autoFocus: true,
    autoComplete: 'one-time-code',
};
var SubmitOnComplete = Template.bind({});
exports.SubmitOnComplete = SubmitOnComplete;
SubmitOnComplete.args = {
    name: 'SubmitOnComplete',
    autoComplete: 'one-time-code',
    shouldSubmitOnComplete: true,
    onFulfill: function () { return console.debug('Submitted!'); },
};
exports.default = story;
