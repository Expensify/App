"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var SelectCircle_1 = require("@components/SelectCircle");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var BaseListItem_1 = require("./BaseListItem");
function SelectableListItem(_a) {
    var _b, _c, _d;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, onDismissError = _a.onDismissError, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus;
    var styles = (0, useThemeStyles_1.default)();
    var handleCheckboxPress = (0, react_1.useCallback)(function () {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        }
        else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);
    return (<BaseListItem_1.default item={item} wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onSelectRow={onSelectRow} onDismissError={onDismissError} errors={item.errors} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus}>
            <>
                <react_native_1.View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={(_b = item.text) !== null && _b !== void 0 ? _b : ''} style={[
            styles.optionDisplayName,
            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
            item.isBold !== false && styles.sidebarLinkTextBold,
            styles.pre,
            item.alternateText ? styles.mb1 : null,
        ]}/>
                    </react_native_1.View>
                </react_native_1.View>
                {!!canSelectMultiple && !item.isDisabled && (<PressableWithFeedback_1.default onPress={handleCheckboxPress} disabled={isDisabled} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={(_c = item.text) !== null && _c !== void 0 ? _c : ''} style={[styles.ml2, styles.optionSelectCircle]}>
                        <SelectCircle_1.default isChecked={(_d = item.isSelected) !== null && _d !== void 0 ? _d : false} selectCircleStyles={styles.ml0}/>
                    </PressableWithFeedback_1.default>)}
            </>
        </BaseListItem_1.default>);
}
SelectableListItem.displayName = 'SelectableListItem';
exports.default = SelectableListItem;
