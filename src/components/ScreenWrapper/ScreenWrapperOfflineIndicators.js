"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ImportedStateIndicator_1 = require("@components/ImportedStateIndicator");
var OfflineIndicator_1 = require("@components/OfflineIndicator");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useNetwork_1 = require("@hooks/useNetwork");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ScreenWrapperOfflineIndicators(_a) {
    var offlineIndicatorStyle = _a.offlineIndicatorStyle, _b = _a.shouldShowOfflineIndicator, shouldShowSmallScreenOfflineIndicator = _b === void 0 ? true : _b, _c = _a.shouldShowOfflineIndicatorInWideScreen, shouldShowWideScreenOfflineIndicator = _c === void 0 ? false : _c, _d = _a.shouldMobileOfflineIndicatorStickToBottom, shouldSmallScreenOfflineIndicatorStickToBottom = _d === void 0 ? true : _d, _e = _a.isOfflineIndicatorTranslucent, isOfflineIndicatorTranslucent = _e === void 0 ? false : _e, extraContent = _a.extraContent, _f = _a.addBottomSafeAreaPadding, addBottomSafeAreaPadding = _f === void 0 ? true : _f, _g = _a.addWideScreenBottomSafeAreaPadding, addWideScreenBottomSafeAreaPadding = _g === void 0 ? !!extraContent : _g;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var insets = (0, useSafeAreaPaddings_1.default)(true).insets;
    var navigationBarType = (0, react_1.useMemo)(function () { return StyleUtils.getNavigationBarType(insets); }, [StyleUtils, insets]);
    var isSoftKeyNavigation = navigationBarType === CONST_1.default.NAVIGATION_BAR_TYPE.SOFT_KEYS;
    /**
     * This style applies the background color of the small screen offline indicator.
     * When there is not bottom content, and the device either has soft keys or is offline,
     * the background style is applied.
     * By default, the background color of the small screen offline indicator is translucent.
     * If `isOfflineIndicatorTranslucent` is set to true, an opaque background color is applied.
     */
    var smallScreenOfflineIndicatorBackgroundStyle = (0, react_1.useMemo)(function () {
        var showOfflineIndicatorBackground = !extraContent && (isSoftKeyNavigation || isOffline);
        if (!showOfflineIndicatorBackground) {
            return undefined;
        }
        return isOfflineIndicatorTranslucent ? styles.translucentNavigationBarBG : styles.appBG;
    }, [extraContent, isOffline, isOfflineIndicatorTranslucent, isSoftKeyNavigation, styles.appBG, styles.translucentNavigationBarBG]);
    /**
     * This style includes the bottom safe area padding for the small screen offline indicator.
     * If the device has soft keys, the small screen offline indicator will stick to the navigation bar (bottom of the screen)
     * The small screen offline indicator container will have a translucent background. Therefore, we want to offset it
     * by the bottom safe area padding rather than adding padding to the container, so that there are not
     * two overlapping layers of translucent background.
     * If the device does not have soft keys, the bottom safe area padding is applied as `paddingBottom`.
     */
    var smallScreenOfflineIndicatorBottomSafeAreaStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({
        addBottomSafeAreaPadding: addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        styleProperty: isSoftKeyNavigation ? 'bottom' : 'paddingBottom',
    });
    /**
     * This style includes all styles applied to the container of the small screen offline indicator.
     * It always applies the bottom safe area padding as well as the background style, if the device has soft keys.
     * In this case, we want the whole container (including the bottom safe area padding) to have translucent/opaque background.
     */
    var smallScreenOfflineIndicatorContainerStyle = (0, react_1.useMemo)(function () { return [
        smallScreenOfflineIndicatorBottomSafeAreaStyle,
        shouldSmallScreenOfflineIndicatorStickToBottom && styles.stickToBottom,
        !isSoftKeyNavigation && smallScreenOfflineIndicatorBackgroundStyle,
    ]; }, [
        smallScreenOfflineIndicatorBottomSafeAreaStyle,
        shouldSmallScreenOfflineIndicatorStickToBottom,
        styles.stickToBottom,
        isSoftKeyNavigation,
        smallScreenOfflineIndicatorBackgroundStyle,
    ]);
    /**
     * This style includes the styles applied to the small screen offline indicator component.
     * If the device has soft keys, we only want to apply the background style to the small screen offline indicator component,
     * rather than the whole container, because otherwise the navigation bar would be extra opaque, since it already has a translucent background.
     */
    var smallScreenOfflineIndicatorStyle = (0, react_1.useMemo)(function () { return [styles.pl5, isSoftKeyNavigation && smallScreenOfflineIndicatorBackgroundStyle, offlineIndicatorStyle]; }, [isSoftKeyNavigation, smallScreenOfflineIndicatorBackgroundStyle, offlineIndicatorStyle, styles.pl5]);
    return (<>
            {shouldShowSmallScreenOfflineIndicator && (<>
                    {isOffline && (<react_native_1.View style={[smallScreenOfflineIndicatorContainerStyle]}>
                            <OfflineIndicator_1.default style={smallScreenOfflineIndicatorStyle}/>
                            {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                        </react_native_1.View>)}
                    <ImportedStateIndicator_1.default />
                </>)}
            {shouldShowWideScreenOfflineIndicator && (<>
                    <OfflineIndicator_1.default style={[styles.pl5, offlineIndicatorStyle]} addBottomSafeAreaPadding={addWideScreenBottomSafeAreaPadding}/>
                    {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                    <ImportedStateIndicator_1.default />
                </>)}
        </>);
}
ScreenWrapperOfflineIndicators.displayName = 'ScreenWrapperOfflineIndicators';
exports.default = ScreenWrapperOfflineIndicators;
