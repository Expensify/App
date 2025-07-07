"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Modal_1 = require("@components/Modal");
var HelpContent_1 = require("@components/SidePanel/HelpComponents/HelpContent");
var CONST_1 = require("@src/CONST");
function Help(_a) {
    var shouldHideSidePanel = _a.shouldHideSidePanel, closeSidePanel = _a.closeSidePanel;
    // SidePanel isn't a native screen, this handles the back button press on Android
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var backHandler = react_native_1.BackHandler.addEventListener('hardwareBackPress', function () {
            closeSidePanel();
            // Return true to indicate that the back button press is handled here
            return true;
        });
        return function () { return backHandler.remove(); };
    }, [closeSidePanel]));
    return (<Modal_1.default onClose={function () { return closeSidePanel(); }} isVisible={!shouldHideSidePanel} type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} shouldHandleNavigationBack>
            <HelpContent_1.default closeSidePanel={closeSidePanel}/>
        </Modal_1.default>);
}
Help.displayName = 'Help';
exports.default = Help;
