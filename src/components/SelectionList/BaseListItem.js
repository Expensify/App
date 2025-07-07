"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var utils_1 = require("@components/Button/utils");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var useHover_1 = require("@hooks/useHover");
var useMouseContext_1 = require("@hooks/useMouseContext");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useSyncFocus_1 = require("@hooks/useSyncFocus");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function BaseListItem(_a) {
    var _b;
    var _c;
    var item = _a.item, pressableStyle = _a.pressableStyle, wrapperStyle = _a.wrapperStyle, pressableWrapperStyle = _a.pressableWrapperStyle, containerStyle = _a.containerStyle, _d = _a.isDisabled, isDisabled = _d === void 0 ? false : _d, _e = _a.shouldPreventEnterKeySubmit, shouldPreventEnterKeySubmit = _e === void 0 ? false : _e, _f = _a.canSelectMultiple, canSelectMultiple = _f === void 0 ? false : _f, onSelectRow = _a.onSelectRow, _g = _a.onDismissError, onDismissError = _g === void 0 ? function () { } : _g, rightHandSideComponent = _a.rightHandSideComponent, keyForList = _a.keyForList, errors = _a.errors, pendingAction = _a.pendingAction, FooterComponent = _a.FooterComponent, children = _a.children, isFocused = _a.isFocused, _h = _a.shouldSyncFocus, shouldSyncFocus = _h === void 0 ? true : _h, _j = _a.shouldDisplayRBR, shouldDisplayRBR = _j === void 0 ? true : _j, _k = _a.shouldShowBlueBorderOnFocus, shouldShowBlueBorderOnFocus = _k === void 0 ? false : _k, _l = _a.onFocus, onFocus = _l === void 0 ? function () { } : _l, hoverStyle = _a.hoverStyle, onLongPressRow = _a.onLongPressRow, testID = _a.testID, _m = _a.shouldUseDefaultRightHandSideCheckmark, shouldUseDefaultRightHandSideCheckmark = _m === void 0 ? true : _m;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _o = (0, useHover_1.default)(), hovered = _o.hovered, bind = _o.bind;
    var _p = (0, useMouseContext_1.useMouseContext)(), isMouseDownOnInput = _p.isMouseDownOnInput, setMouseUp = _p.setMouseUp;
    var pressableRef = (0, react_1.useRef)(null);
    // Sync focus on an item
    (0, useSyncFocus_1.default)(pressableRef, !!isFocused, shouldSyncFocus);
    var handleMouseLeave = function (e) {
        bind.onMouseLeave();
        e.stopPropagation();
        setMouseUp();
    };
    var rightHandSideComponentRender = function () {
        if (canSelectMultiple || !rightHandSideComponent) {
            return null;
        }
        if (typeof rightHandSideComponent === 'function') {
            return rightHandSideComponent(item, isFocused);
        }
        return rightHandSideComponent;
    };
    return (<OfflineWithFeedback_1.default onClose={function () { return onDismissError(item); }} pendingAction={pendingAction} errors={errors} errorRowStyles={styles.ph5} contentContainerStyle={containerStyle}>
            <PressableWithFeedback_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...bind} ref={pressableRef} onLongPress={function () {
            onLongPressRow === null || onLongPressRow === void 0 ? void 0 : onLongPressRow(item);
        }} onPress={function (e) {
            if (isMouseDownOnInput) {
                e === null || e === void 0 ? void 0 : e.stopPropagation(); // Preventing the click action
                return;
            }
            if (shouldPreventEnterKeySubmit && e && 'key' in e && e.key === CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
                return;
            }
            onSelectRow(item);
        }} disabled={isDisabled && !item.isSelected} interactive={item.isInteractive} accessibilityLabel={(_c = item.text) !== null && _c !== void 0 ? _c : ''} role={(0, utils_1.getButtonRole)(true)} isNested hoverDimmingValue={1} pressDimmingValue={item.isInteractive === false ? 1 : variables_1.default.pressDimValue} hoverStyle={[!item.isDisabled && item.isInteractive !== false && styles.hoveredComponentBG, hoverStyle]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b[CONST_1.default.INNER_BOX_SHADOW_ELEMENT] = shouldShowBlueBorderOnFocus, _b} onMouseDown={function (e) { return e.preventDefault(); }} id={keyForList !== null && keyForList !== void 0 ? keyForList : ''} style={[
            pressableStyle,
            isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
        ]} onFocus={onFocus} onMouseLeave={handleMouseLeave} tabIndex={item.tabIndex} wrapperStyle={pressableWrapperStyle} testID={testID}>
                <react_native_1.View testID={"".concat(CONST_1.default.BASE_LIST_ITEM_TEST_ID).concat(item.keyForList)} accessibilityState={{ selected: !!isFocused }} style={[
            wrapperStyle,
            isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
        ]}>
                    {typeof children === 'function' ? children(hovered) : children}

                    {!canSelectMultiple && !!item.isSelected && !rightHandSideComponent && shouldUseDefaultRightHandSideCheckmark && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.ml3]} accessible={false}>
                            <react_native_1.View>
                                <Icon_1.default src={Expensicons.Checkmark} fill={theme.success}/>
                            </react_native_1.View>
                        </react_native_1.View>)}
                    {(!item.isSelected || !!item.canShowSeveralIndicators) && !!item.brickRoadIndicator && shouldDisplayRBR && (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <Icon_1.default src={Expensicons.DotIndicator} fill={item.brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger}/>
                        </react_native_1.View>)}

                    {rightHandSideComponentRender()}
                </react_native_1.View>
                {FooterComponent}
            </PressableWithFeedback_1.default>
        </OfflineWithFeedback_1.default>);
}
BaseListItem.displayName = 'BaseListItem';
exports.default = BaseListItem;
