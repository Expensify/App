"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function CarouselButtons(_a) {
    var page = _a.page, attachments = _a.attachments, shouldShowArrows = _a.shouldShowArrows, onBack = _a.onBack, onForward = _a.onForward, cancelAutoHideArrow = _a.cancelAutoHideArrow, autoHideArrow = _a.autoHideArrow;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var isBackDisabled = page === 0;
    var isForwardDisabled = page === attachments.length - 1;
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return shouldShowArrows ? (<>
            {!isBackDisabled && (<Tooltip_1.default text={translate('common.previous')}>
                    <react_native_1.View style={[styles.attachmentArrow, shouldUseNarrowLayout ? styles.l2 : styles.l8]}>
                        <Button_1.default small innerStyles={[styles.arrowIcon]} icon={Expensicons.BackArrow} iconFill={theme.text} onPress={onBack} onPressIn={cancelAutoHideArrow} onPressOut={autoHideArrow}/>
                    </react_native_1.View>
                </Tooltip_1.default>)}
            {!isForwardDisabled && (<Tooltip_1.default text={translate('common.next')}>
                    <react_native_1.View style={[styles.attachmentArrow, shouldUseNarrowLayout ? styles.r2 : styles.r8]}>
                        <Button_1.default small innerStyles={[styles.arrowIcon]} icon={Expensicons.ArrowRight} iconFill={theme.text} onPress={onForward} onPressIn={cancelAutoHideArrow} onPressOut={autoHideArrow}/>
                    </react_native_1.View>
                </Tooltip_1.default>)}
        </>) : null;
}
CarouselButtons.displayName = 'CarouselButtons';
exports.default = CarouselButtons;
