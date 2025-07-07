"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var mapChildrenFlat_1 = require("@libs/mapChildrenFlat");
var shouldRenderOffscreen_1 = require("@libs/shouldRenderOffscreen");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var CustomStylesForChildrenProvider_1 = require("./CustomStylesForChildrenProvider");
var ErrorMessageRow_1 = require("./ErrorMessageRow");
function OfflineWithFeedback(_a) {
    var pendingAction = _a.pendingAction, _b = _a.canDismissError, canDismissError = _b === void 0 ? true : _b, contentContainerStyle = _a.contentContainerStyle, errorRowStyles = _a.errorRowStyles, errors = _a.errors, _c = _a.needsOffscreenAlphaCompositing, needsOffscreenAlphaCompositing = _c === void 0 ? false : _c, _d = _a.onClose, onClose = _d === void 0 ? function () { } : _d, _e = _a.shouldDisableOpacity, shouldDisableOpacity = _e === void 0 ? false : _e, _f = _a.shouldDisableStrikeThrough, shouldDisableStrikeThrough = _f === void 0 ? false : _f, _g = _a.shouldHideOnDelete, shouldHideOnDelete = _g === void 0 ? true : _g, _h = _a.shouldShowErrorMessages, shouldShowErrorMessages = _h === void 0 ? true : _h, style = _a.style, _j = _a.shouldDisplayErrorAbove, shouldDisplayErrorAbove = _j === void 0 ? false : _j, _k = _a.shouldForceOpacity, shouldForceOpacity = _k === void 0 ? false : _k, _l = _a.dismissError, dismissError = _l === void 0 ? function () { } : _l, rest = __rest(_a, ["pendingAction", "canDismissError", "contentContainerStyle", "errorRowStyles", "errors", "needsOffscreenAlphaCompositing", "onClose", "shouldDisableOpacity", "shouldDisableStrikeThrough", "shouldHideOnDelete", "shouldShowErrorMessages", "style", "shouldDisplayErrorAbove", "shouldForceOpacity", "dismissError"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var hasErrors = !(0, EmptyObject_1.isEmptyObject)(errors !== null && errors !== void 0 ? errors : {});
    var isOfflinePendingAction = !!isOffline && !!pendingAction;
    var isUpdateOrDeleteError = hasErrors && (pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
    var isAddError = hasErrors && pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    var needsOpacity = (!shouldDisableOpacity && ((isOfflinePendingAction && !isUpdateOrDeleteError) || isAddError)) || shouldForceOpacity;
    var needsStrikeThrough = !shouldDisableStrikeThrough && isOffline && pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    var hideChildren = shouldHideOnDelete && !isOffline && pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !hasErrors;
    var children = rest.children;
    /**
     * This method applies the strikethrough to all the children passed recursively
     */
    var applyStrikeThrough = (0, react_1.useCallback)(function (childrenProp) {
        var strikeThroughChildren = (0, mapChildrenFlat_1.default)(childrenProp, function (child) {
            var _a;
            if (!react_1.default.isValidElement(child)) {
                return child;
            }
            var childProps = child.props;
            var props = {
                style: StyleUtils.combineStyles((_a = childProps.style) !== null && _a !== void 0 ? _a : [], styles.offlineFeedback.deleted, styles.userSelectNone),
            };
            if (childProps.children) {
                props.children = applyStrikeThrough(childProps.children);
            }
            return react_1.default.cloneElement(child, props);
        });
        return strikeThroughChildren;
    }, [StyleUtils, styles]);
    // Apply strikethrough to children if needed, but skip it if we are not going to render them
    if (needsStrikeThrough && !hideChildren) {
        children = applyStrikeThrough(children);
    }
    return (<react_native_1.View style={style}>
            {shouldShowErrorMessages && shouldDisplayErrorAbove && (<ErrorMessageRow_1.default errors={errors} errorRowStyles={errorRowStyles} onClose={onClose} canDismissError={canDismissError} dismissError={dismissError}/>)}
            {!hideChildren && (<react_native_1.View style={[needsOpacity ? styles.offlineFeedback.pending : styles.offlineFeedback.default, contentContainerStyle]} needsOffscreenAlphaCompositing={shouldRenderOffscreen_1.default ? needsOpacity && needsOffscreenAlphaCompositing : undefined}>
                    <CustomStylesForChildrenProvider_1.default style={needsStrikeThrough ? [styles.offlineFeedback.deleted, styles.userSelectNone] : null}>{children}</CustomStylesForChildrenProvider_1.default>
                </react_native_1.View>)}
            {shouldShowErrorMessages && !shouldDisplayErrorAbove && (<ErrorMessageRow_1.default errors={errors} errorRowStyles={errorRowStyles} onClose={onClose} canDismissError={canDismissError} dismissError={dismissError}/>)}
        </react_native_1.View>);
}
OfflineWithFeedback.displayName = 'OfflineWithFeedback';
exports.default = OfflineWithFeedback;
