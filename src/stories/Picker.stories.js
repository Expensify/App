"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disabled = exports.ErrorStory = exports.PickerWithValue = exports.Default = void 0;
var react_1 = require("react");
var Picker_1 = require("@components/Picker");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/Picker',
    component: Picker_1.default,
};
function Template(props) {
    var _a = (0, react_1.useState)(''), value = _a[0], setValue = _a[1];
    return (<Picker_1.default value={value} onInputChange={function (e) { return setValue(e); }} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    label: 'Default picker',
    hintText: 'Default hint text',
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};
var PickerWithValue = Template.bind({});
exports.PickerWithValue = PickerWithValue;
PickerWithValue.args = {
    label: 'Picker with defined value',
    value: 'apple',
    hintText: 'Picker with hint text',
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};
var ErrorStory = Template.bind({});
exports.ErrorStory = ErrorStory;
ErrorStory.args = {
    label: 'Picker with error',
    hintText: 'Picker hint text',
    errorText: 'This field has an error.',
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};
var Disabled = Template.bind({});
exports.Disabled = Disabled;
Disabled.args = {
    label: 'Picker disabled',
    value: 'orange',
    isDisabled: true,
    hintText: 'Picker hint text',
    items: [
        {
            label: 'Orange',
            value: 'orange',
        },
        {
            label: 'Apple',
            value: 'apple',
        },
    ],
};
exports.default = story;
