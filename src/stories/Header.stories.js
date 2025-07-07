"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var react_1 = require("react");
var Header_1 = require("@components/Header");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/Header',
    component: Header_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Header_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    title: 'Chats',
    shouldShowEnvironmentBadge: true,
};
exports.default = story;
