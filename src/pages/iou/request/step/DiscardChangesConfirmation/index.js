"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ConfirmModal_1 = require("@components/ConfirmModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
function DiscardChangesConfirmation(_a) {
    var getHasUnsavedChanges = _a.getHasUnsavedChanges;
    var navigation = (0, native_1.useNavigation)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isVisible = _b[0], setIsVisible = _b[1];
    var blockedNavigationAction = (0, react_1.useRef)(undefined);
    var shouldNavigateBack = (0, react_1.useRef)(false);
    (0, useBeforeRemove_1.default)((0, react_1.useCallback)(function (e) {
        if (!getHasUnsavedChanges() || shouldNavigateBack.current) {
            return;
        }
        e.preventDefault();
        blockedNavigationAction.current = e.data.action;
        setIsVisible(true);
    }, [getHasUnsavedChanges]));
    /**
     * We cannot programmatically stop the browser's back navigation like react-navigation's beforeRemove
     * Events like popstate and transitionStart are triggered AFTER the back navigation has already completed
     * So we need to go forward to get back to the current page
     */
    (0, react_1.useEffect)(function () {
        // transitionStart is triggered before the previous page is fully loaded so RHP sliding animation
        // could be less "glitchy" when going back and forth between the previous and current pages
        var unsubscribe = navigation.addListener('transitionStart', function () {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (!getHasUnsavedChanges() || blockedNavigationAction.current || shouldNavigateBack.current) {
                return;
            }
            // Navigation.navigate() rerenders the current page and resets its states
            window.history.go(1);
            setIsVisible(true);
            shouldNavigateBack.current = true;
        });
        return unsubscribe;
    }, [navigation, getHasUnsavedChanges]);
    return (<ConfirmModal_1.default isVisible={isVisible} title={translate('discardChangesConfirmation.title')} prompt={translate('discardChangesConfirmation.body')} danger confirmText={translate('discardChangesConfirmation.confirmText')} cancelText={translate('common.cancel')} onConfirm={function () {
            var _a, _b;
            setIsVisible(false);
            if (blockedNavigationAction.current) {
                (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(blockedNavigationAction.current);
                return;
            }
            if (!shouldNavigateBack.current) {
                return;
            }
            (_b = navigationRef_1.default.current) === null || _b === void 0 ? void 0 : _b.goBack();
        }} onCancel={function () {
            setIsVisible(false);
            blockedNavigationAction.current = undefined;
            shouldNavigateBack.current = false;
        }}/>);
}
exports.default = (0, react_1.memo)(DiscardChangesConfirmation);
