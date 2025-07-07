"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loading = exports.Default = void 0;
exports.PressOnEnter = PressOnEnter;
exports.PressOnEnterWithBubbling = PressOnEnterWithBubbling;
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Text_1 = require("@components/Text");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/Button',
    component: Button_1.default,
};
function Template(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button_1.default {...props}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var Loading = Template.bind({});
exports.Loading = Loading;
function PressOnEnter(props) {
    var _a = (0, react_1.useState)(''), text = _a[0], setText = _a[1];
    var onPress = (0, react_1.useCallback)(function () {
        setText('Button Pressed!');
        setTimeout(function () { return setText(''); }, 500);
    }, []);
    return (<Button_1.default {...props} 
    // eslint-disable-next-line react/prop-types
    text={text} onPress={onPress}/>);
}
function PressOnEnterWithBubbling(props) {
    return (<>
            <Text_1.default>Both buttons will trigger on press of Enter as the Enter event will bubble across all instances of button.</Text_1.default>
            <react_native_1.View style={{ flexDirection: 'row', padding: 10 }}>
                <PressOnEnter {...props} text="Button A"/>
                <PressOnEnter {...props} text="Button B"/>
            </react_native_1.View>
        </>);
}
Default.args = {
    text: 'Save & Continue',
    success: true,
};
Loading.args = {
    text: 'Save & Continue',
    isLoading: true,
    success: true,
};
PressOnEnter.args = {
    text: 'Press Enter',
    pressOnEnter: true,
    success: true,
};
PressOnEnterWithBubbling.args = {
    pressOnEnter: true,
    success: true,
    medium: true,
    allowBubble: true,
};
exports.default = story;
