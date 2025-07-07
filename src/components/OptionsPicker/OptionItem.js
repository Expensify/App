"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Pressable_1 = require("@components/Pressable");
var SelectCircle_1 = require("@components/SelectCircle");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function OptionItem(_a) {
    var title = _a.title, icon = _a.icon, onPress = _a.onPress, _b = _a.isSelected, isSelected = _b === void 0 ? false : _b, isDisabled = _a.isDisabled, style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Pressable_1.PressableWithFeedback onPress={onPress} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate(title)} disabled={isDisabled} wrapperStyle={[styles.flex1, style]}>
            <react_native_1.View style={[styles.borderedContentCard, isSelected && styles.borderColorFocus, styles.p5]}>
                <react_native_1.View>
                    <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween]}>
                        <Icon_1.default src={icon} width={variables_1.default.iconHeader} height={variables_1.default.iconHeader}/>
                        {!isDisabled && (<react_native_1.View>
                                <SelectCircle_1.default isChecked={isSelected} selectCircleStyles={styles.sectionSelectCircle}/>
                            </react_native_1.View>)}
                    </react_native_1.View>
                    <Text_1.default style={[styles.headerText, styles.mt2]} numberOfLines={1}>
                        {translate(title)}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </Pressable_1.PressableWithFeedback>);
}
OptionItem.displayName = 'OptionItem';
exports.default = OptionItem;
