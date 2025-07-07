"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorStory = exports.Default = void 0;
var react_1 = require("react");
var AddressSearch_1 = require("@components/AddressSearch");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/AddressSearch',
    component: AddressSearch_1.default,
    args: {
        label: 'Enter street',
        errorText: '',
    },
};
function Template(props) {
    var _a = (0, react_1.useState)(''), value = _a[0], setValue = _a[1];
    return (<AddressSearch_1.default value={value} onInputChange={function (inputValue) { return setValue(inputValue); }} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var ErrorStory = Template.bind({});
exports.ErrorStory = ErrorStory;
ErrorStory.args = {
    errorText: 'The street you are looking for does not exist',
};
exports.default = story;
