"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var react_1 = require("react");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var PopoverMenu_1 = require("@components/PopoverMenu");
// eslint-disable-next-line no-restricted-imports
var dark_1 = require("@styles/theme/themes/dark");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var story = {
    title: 'Components/PopoverMenu',
    component: PopoverMenu_1.default,
};
function Template(props) {
    var _a = react_1.default.useState(false), isVisible = _a[0], setIsVisible = _a[1];
    var toggleVisibility = function () { return setIsVisible(!isVisible); };
    return (<>
            <MenuItem_1.default title="Add payment Methods" icon={Expensicons.Plus} onPress={toggleVisibility} wrapperStyle={isVisible ? [{ backgroundColor: dark_1.default.border }] : []}/>
            <react_native_safe_area_context_1.SafeAreaProvider>
                <PopoverMenu_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} isVisible={isVisible} onClose={toggleVisibility} onItemSelected={toggleVisibility} menuItems={[
            {
                text: 'Bank account',
                icon: Expensicons.Bank,
                onSelected: toggleVisibility,
            },
            {
                text: 'Debit card',
                icon: Expensicons.CreditCard,
                onSelected: toggleVisibility,
            },
        ]}/>
            </react_native_safe_area_context_1.SafeAreaProvider>
        </>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
Default.args = {
    anchorPosition: {
        vertical: 80,
        horizontal: 20,
    },
};
exports.default = story;
