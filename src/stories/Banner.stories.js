"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerWithLink = exports.HTMLBanner = exports.InfoBanner = void 0;
var react_1 = require("react");
var Banner_1 = require("@components/Banner");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/Banner',
    component: Banner_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Banner_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var InfoBanner = Template.bind({});
exports.InfoBanner = InfoBanner;
InfoBanner.args = {
    text: 'This is an informational banner',
};
var HTMLBanner = Template.bind({});
exports.HTMLBanner = HTMLBanner;
HTMLBanner.args = {
    text: 'This is a informational banner containing <strong><em>HTML</em></strong>',
    shouldRenderHTML: true,
};
var BannerWithLink = Template.bind({});
exports.BannerWithLink = BannerWithLink;
BannerWithLink.args = {
    text: 'This is a informational banner containing <a href="https://new.expensify.com/settings">internal Link</a> and <a href=" https://google.com">public link</a>',
    shouldRenderHTML: true,
};
exports.default = story;
