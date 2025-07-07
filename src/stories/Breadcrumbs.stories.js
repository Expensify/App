"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstBreadcrumbStrong = exports.Default = void 0;
var react_1 = require("react");
var Breadcrumbs_1 = require("@components/Breadcrumbs");
var CONST_1 = require("@src/CONST");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/Breadcrumbs',
    component: Breadcrumbs_1.default,
};
function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Breadcrumbs_1.default {...args}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    breadcrumbs: [
        {
            type: CONST_1.default.BREADCRUMB_TYPE.ROOT,
        },
        {
            text: 'Chats',
        },
    ],
};
var FirstBreadcrumbStrong = Template.bind({});
exports.FirstBreadcrumbStrong = FirstBreadcrumbStrong;
FirstBreadcrumbStrong.args = {
    breadcrumbs: [
        {
            text: "Cathy's Croissants",
            type: CONST_1.default.BREADCRUMB_TYPE.STRONG,
        },
        {
            text: 'Chats',
        },
    ],
};
exports.default = story;
