"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSidePanel_1 = require("@hooks/useSidePanel");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var variables_1 = require("@styles/variables");
var useModalCardStyleInterpolator = function () {
    var _a = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _a.shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth = _a.onboardingIsMediumOrLargerScreenWidth;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var sidePanelOffset = (0, useSidePanel_1.default)().sidePanelOffset;
    var modalCardStyleInterpolator = function (_a) {
        var _b = _a.props, progress = _b.current.progress, inverted = _b.inverted, screen = _b.layouts.screen, _c = _a.isOnboardingModal, isOnboardingModal = _c === void 0 ? false : _c, _d = _a.isFullScreenModal, isFullScreenModal = _d === void 0 ? false : _d, _e = _a.shouldFadeScreen, shouldFadeScreen = _e === void 0 ? false : _e, _f = _a.shouldAnimateSidePanel, shouldAnimateSidePanel = _f === void 0 ? false : _f, _g = _a.outputRangeMultiplier, outputRangeMultiplier = _g === void 0 ? 1 : _g;
        if (isOnboardingModal ? onboardingIsMediumOrLargerScreenWidth : shouldFadeScreen) {
            return {
                cardStyle: { opacity: progress },
            };
        }
        var translateX = react_native_1.Animated.multiply(progress.interpolate({
            inputRange: [0, 1],
            outputRange: [outputRangeMultiplier * (shouldUseNarrowLayout ? screen.width : variables_1.default.sideBarWidth), 0],
            extrapolate: 'clamp',
        }), inverted);
        var cardStyle = StyleUtils.getCardStyles(screen.width);
        if (!isFullScreenModal || shouldUseNarrowLayout) {
            cardStyle.transform = [{ translateX: translateX }];
        }
        if (shouldAnimateSidePanel) {
            cardStyle.paddingRight = sidePanelOffset.current;
        }
        return {
            containerStyle: {
                overflow: 'hidden',
            },
            cardStyle: cardStyle,
        };
    };
    return modalCardStyleInterpolator;
};
exports.default = useModalCardStyleInterpolator;
