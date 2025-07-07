"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
exports.BaseInteractiveStepSubHeader = BaseInteractiveStepSubHeader;
/* eslint-disable react/jsx-props-no-spreading */
var react_1 = require("react");
var react_native_1 = require("react-native");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/InteractiveStepSubHeader',
    component: InteractiveStepSubHeader_1.default,
};
function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InteractiveStepSubHeader_1.default {...args}/>;
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
function BaseInteractiveStepSubHeader(props) {
    var ref = (0, react_1.useRef)(null);
    return (<react_native_1.View>
            <InteractiveStepSubHeader_1.default {...props} ref={ref}/>
            <react_native_1.Button onPress={function () { var _a; return (_a = ref.current) === null || _a === void 0 ? void 0 : _a.moveNext(); }} title="Next"/>
        </react_native_1.View>);
}
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    stepNames: ['Initial', 'Step 1', 'Step 2', 'Step 3'],
    startStepIndex: 1,
    onStepSelected: function () { },
};
BaseInteractiveStepSubHeader.args = {
    stepNames: ['Initial', 'Step 1', 'Step 2', 'Step 3', 'Confirmation'],
    startStepIndex: 0,
    onStepSelected: function () { },
};
exports.default = story;
