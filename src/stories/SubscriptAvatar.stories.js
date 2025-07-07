"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceSubscriptIcon = exports.SubscriptIcon = exports.AvatarURLStory = exports.Default = void 0;
var react_1 = require("react");
var defaultAvatars = require("@components/Icon/DefaultAvatars");
var Expensicons = require("@components/Icon/Expensicons");
var SubscriptAvatar_1 = require("@components/SubscriptAvatar");
var CONST_1 = require("@src/CONST");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
exports.default = {
    title: 'Components/SubscriptAvatar',
    component: SubscriptAvatar_1.default,
    args: {
        mainAvatar: { source: defaultAvatars.Avatar5, name: '', type: CONST_1.default.ICON_TYPE_AVATAR },
        size: CONST_1.default.AVATAR_SIZE.DEFAULT,
    },
    argTypes: {
        size: {
            options: [CONST_1.default.AVATAR_SIZE.SMALL, CONST_1.default.AVATAR_SIZE.DEFAULT], // SubscriptAvatar only supports these two sizes
        },
    },
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <SubscriptAvatar_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var AvatarURLStory = Template.bind({});
exports.AvatarURLStory = AvatarURLStory;
AvatarURLStory.args = {
    mainAvatar: { source: defaultAvatars.Avatar1, name: '', type: CONST_1.default.ICON_TYPE_AVATAR },
    secondaryAvatar: { source: defaultAvatars.Avatar3, name: '', type: CONST_1.default.ICON_TYPE_AVATAR },
};
var SubscriptIcon = Template.bind({});
exports.SubscriptIcon = SubscriptIcon;
SubscriptIcon.args = {
    subscriptIcon: { source: Expensicons.DownArrow, width: 8, height: 8 },
};
var WorkspaceSubscriptIcon = Template.bind({});
exports.WorkspaceSubscriptIcon = WorkspaceSubscriptIcon;
WorkspaceSubscriptIcon.args = {
    mainAvatar: { source: defaultAvatars.Avatar1, name: '', type: CONST_1.default.ICON_TYPE_WORKSPACE },
    subscriptIcon: { source: Expensicons.DownArrow, width: 8, height: 8 },
};
