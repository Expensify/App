"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ImageSVG_1 = require("@components/ImageSVG");
var Lottie_1 = require("@components/Lottie");
var Text_1 = require("@components/Text");
var VideoPlayer_1 = require("@components/VideoPlayer");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var VIDEO_ASPECT_RATIO = 400 / 225;
function EmptyStateComponent(_a) {
    var SkeletonComponent = _a.SkeletonComponent, headerMediaType = _a.headerMediaType, headerMedia = _a.headerMedia, buttons = _a.buttons, containerStyles = _a.containerStyles, title = _a.title, titleStyles = _a.titleStyles, subtitle = _a.subtitle, children = _a.children, headerStyles = _a.headerStyles, cardStyles = _a.cardStyles, cardContentStyles = _a.cardContentStyles, headerContentStyles = _a.headerContentStyles, lottieWebViewStyles = _a.lottieWebViewStyles, _b = _a.minModalHeight, minModalHeight = _b === void 0 ? 400 : _b, subtitleText = _a.subtitleText;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(VIDEO_ASPECT_RATIO), videoAspectRatio = _c[0], setVideoAspectRatio = _c[1];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var setAspectRatio = function (event) {
        if (!event) {
            return;
        }
        if ('naturalSize' in event) {
            setVideoAspectRatio(event.naturalSize.width / event.naturalSize.height);
        }
        else {
            setVideoAspectRatio(event.srcElement.videoWidth / event.srcElement.videoHeight);
        }
    };
    var HeaderComponent = (0, react_1.useMemo)(function () {
        switch (headerMediaType) {
            case CONST_1.default.EMPTY_STATE_MEDIA.VIDEO:
                return (<VideoPlayer_1.default url={headerMedia} videoPlayerStyle={[headerContentStyles, { aspectRatio: videoAspectRatio }]} videoStyle={styles.emptyStateVideo} onVideoLoaded={setAspectRatio} controlsStatus={CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW} shouldUseControlsBottomMargin={false} shouldPlay isLooping/>);
            case CONST_1.default.EMPTY_STATE_MEDIA.ANIMATION:
                return (<Lottie_1.default source={headerMedia} autoPlay loop style={headerContentStyles} webStyle={lottieWebViewStyles}/>);
            case CONST_1.default.EMPTY_STATE_MEDIA.ILLUSTRATION:
                return (<ImageSVG_1.default style={headerContentStyles} src={headerMedia}/>);
            default:
                return null;
        }
    }, [headerMedia, headerMediaType, headerContentStyles, videoAspectRatio, styles.emptyStateVideo, lottieWebViewStyles]);
    return (<react_native_1.View style={[{ minHeight: minModalHeight }, styles.flexGrow1, styles.flexShrink0, containerStyles]}>
            {!!SkeletonComponent && (<react_native_1.View style={[styles.skeletonBackground, styles.overflowHidden]}>
                    <SkeletonComponent gradientOpacityEnabled shouldAnimate={false}/>
                </react_native_1.View>)}
            <react_native_1.View style={styles.emptyStateForeground}>
                <react_native_1.View style={[styles.emptyStateContent, cardStyles]}>
                    <react_native_1.View style={[styles.emptyStateHeader(headerMediaType === CONST_1.default.EMPTY_STATE_MEDIA.ILLUSTRATION), headerStyles]}>{HeaderComponent}</react_native_1.View>
                    <react_native_1.View style={[shouldUseNarrowLayout ? styles.p5 : styles.p8, cardContentStyles]}>
                        <Text_1.default style={[styles.textAlignCenter, styles.textHeadlineH1, styles.mb2, titleStyles]}>{title}</Text_1.default>
                        {subtitleText !== null && subtitleText !== void 0 ? subtitleText : <Text_1.default style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>{subtitle}</Text_1.default>}
                        {children}
                        {!(0, isEmpty_1.default)(buttons) && (<react_native_1.View style={[styles.gap2, styles.mt5, !shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn]}>
                                {buttons === null || buttons === void 0 ? void 0 : buttons.map(function (_a) {
                var buttonText = _a.buttonText, buttonAction = _a.buttonAction, success = _a.success, icon = _a.icon, isDisabled = _a.isDisabled, style = _a.style;
                return (<Button_1.default key={buttonText} success={success} onPress={buttonAction} text={buttonText} icon={icon} large isDisabled={isDisabled} style={[styles.flex1, style]}/>);
            })}
                            </react_native_1.View>)}
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
EmptyStateComponent.displayName = 'EmptyStateComponent';
exports.default = EmptyStateComponent;
