"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlError = exports.Default = void 0;
var react_1 = require("react");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/FormAlertWithSubmitButton',
    component: FormAlertWithSubmitButton_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <FormAlertWithSubmitButton_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var HtmlError = Template.bind({});
exports.HtmlError = HtmlError;
var defaultArgs = {
    isAlertVisible: true,
    onSubmit: function () { },
    buttonText: 'Submit',
};
Default.args = defaultArgs;
var html = '<em>This is</em> a <strong>test</strong>. None of <h1>these strings</h1> should display <del>as</del> <div>HTML</div>.';
HtmlError.args = __assign(__assign({}, defaultArgs), { isMessageHtml: true, message: html });
exports.default = story;
