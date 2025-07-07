"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionRow_1 = require("@components/OptionRow");
/* eslint-disable react/jsx-props-no-spreading */
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
exports.default = {
    title: 'Components/OptionRow',
    component: OptionRow_1.default,
    argTypes: {
        mode: {
            options: ['default', 'compact'],
            control: { type: 'radio' },
        },
    },
    args: {
        mode: 'default',
        optionIsFocused: false,
        showSelectedState: false,
        isSelected: false,
        boldStyle: false,
        showTitleTooltip: false,
        isDisabled: false,
        backgroundColor: 'white',
        option: {
            text: 'Test Option',
            alternateText: 'Alternate text',
            icons: [{ source: Expensicons.ActiveRoomAvatar, name: 'Test Option', type: 'avatar' }],
            login: 'test@expensify.com',
            reportID: null,
            isChatRoom: false,
            participantsList: [],
            descriptiveText: '',
            tooltipText: 'Tooltip text',
        },
    },
};
function Template(props) {
    return (<OnyxProvider_1.default>
            <OptionRow_1.default {...props}/>
        </OnyxProvider_1.default>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
