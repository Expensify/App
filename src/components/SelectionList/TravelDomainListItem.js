"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Badge_1 = require("@components/Badge");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var SelectCircle_1 = require("@components/SelectCircle");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var BaseListItem_1 = require("./BaseListItem");
function TravelDomainListItem(_a) {
    var _b, _c, _d, _e;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var handleCheckboxPress = (0, react_1.useCallback)(function () {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        }
        else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);
    var showRecommendedTag = (_b = item.isRecommended) !== null && _b !== void 0 ? _b : false;
    return (<BaseListItem_1.default item={item} wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, styles.justifyContentBetween]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple onSelectRow={onSelectRow} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus}>
            <>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <PressableWithFeedback_1.default onPress={handleCheckboxPress} disabled={isDisabled} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={(_c = item.text) !== null && _c !== void 0 ? _c : ''} style={[styles.mr2, styles.optionSelectCircle]}>
                        <SelectCircle_1.default isChecked={(_d = item.isSelected) !== null && _d !== void 0 ? _d : false} selectCircleStyles={styles.ml0}/>
                    </PressableWithFeedback_1.default>
                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={(_e = item.text) !== null && _e !== void 0 ? _e : ''} style={[
            styles.optionDisplayName,
            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
            item.isBold !== false && styles.sidebarLinkTextBold,
            styles.pre,
        ]}/>
                    </react_native_1.View>
                </react_native_1.View>
                {showRecommendedTag && <Badge_1.default text={translate('travel.domainSelector.recommended')}/>}
            </>
        </BaseListItem_1.default>);
}
TravelDomainListItem.displayName = 'TravelDomainListItem';
exports.default = TravelDomainListItem;
