"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var User = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function PriorityModePage() {
    var _a;
    var translate = (0, useLocalize_1.default)().translate;
    var priorityMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIORITY_MODE, { selector: function (mode) { return mode !== null && mode !== void 0 ? mode : CONST_1.default.PRIORITY_MODE.DEFAULT; } })[0];
    var styles = (0, useThemeStyles_1.default)();
    var priorityModes = Object.values(CONST_1.default.PRIORITY_MODE).map(function (mode) { return ({
        value: mode,
        text: translate("priorityModePage.priorityModes.".concat(mode, ".label")),
        alternateText: translate("priorityModePage.priorityModes.".concat(mode, ".description")),
        keyForList: mode,
        isSelected: priorityMode === mode,
    }); });
    var updateMode = (0, react_1.useCallback)(function (mode) {
        if (mode.value === priorityMode) {
            Navigation_1.default.goBack();
            return;
        }
        User.updateChatPriorityMode(mode.value);
    }, [priorityMode]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={PriorityModePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('priorityModePage.priorityMode')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <Text_1.default style={[styles.mh5, styles.mv3]}>{translate('priorityModePage.explainerText')}</Text_1.default>
            <SelectionList_1.default sections={[{ data: priorityModes }]} ListItem={RadioListItem_1.default} onSelectRow={updateMode} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_a = priorityModes.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList}/>
        </ScreenWrapper_1.default>);
}
PriorityModePage.displayName = 'PriorityModePage';
exports.default = PriorityModePage;
