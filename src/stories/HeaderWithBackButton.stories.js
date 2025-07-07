"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = exports.Profile = exports.Attachment = exports.Default = void 0;
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/HeaderWithBackButton',
    component: HeaderWithBackButton_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <HeaderWithBackButton_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var Attachment = Template.bind({});
exports.Attachment = Attachment;
var Profile = Template.bind({});
exports.Profile = Profile;
var ProgressBar = Template.bind({});
exports.ProgressBar = ProgressBar;
Default.args = {
    title: 'Settings',
};
Attachment.args = {
    title: 'Attachment',
    shouldShowDownloadButton: true,
};
Profile.args = {
    title: 'Profile',
};
ProgressBar.args = {
    title: 'ProgressBar',
    progressBarPercentage: 33,
    shouldShowBackButton: false,
};
exports.default = story;
