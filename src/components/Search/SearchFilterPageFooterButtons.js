"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function SearchFilterPageFooterButtons(_a) {
    var resetChanges = _a.resetChanges, applyChanges = _a.applyChanges;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View>
            <Button_1.default large style={[styles.mt3]} text={translate('common.reset')} onPress={resetChanges}/>
            <Button_1.default large success pressOnEnter style={[styles.mt3]} text={translate('common.save')} onPress={applyChanges}/>
        </react_native_1.View>);
}
exports.default = SearchFilterPageFooterButtons;
