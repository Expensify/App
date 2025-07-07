"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Fullstory_1 = require("@libs/Fullstory");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var Button_1 = require("./Button");
var CheckboxWithLabel_1 = require("./CheckboxWithLabel");
var FormAlertWithSubmitButton_1 = require("./FormAlertWithSubmitButton");
var ImageSVG_1 = require("./ImageSVG");
var Lottie_1 = require("./Lottie");
var LottieAnimations_1 = require("./LottieAnimations");
var Modal_1 = require("./Modal");
var OfflineIndicator_1 = require("./OfflineIndicator");
var RenderHTML_1 = require("./RenderHTML");
var ScrollView_1 = require("./ScrollView");
var Text_1 = require("./Text");
var VideoPlayer_1 = require("./VideoPlayer");
// Aspect ratio and height of the video.
// Useful before video loads to reserve space.
var VIDEO_ASPECT_RATIO = 1280 / 960;
var MODAL_PADDING = variables_1.default.spacing2;
function FeatureTrainingModal(_a) {
    var animation = _a.animation, animationStyle = _a.animationStyle, illustrationInnerContainerStyle = _a.illustrationInnerContainerStyle, illustrationOuterContainerStyle = _a.illustrationOuterContainerStyle, videoURL = _a.videoURL, illustrationAspectRatioProp = _a.illustrationAspectRatio, image = _a.image, contentFitImage = _a.contentFitImage, _b = _a.width, width = _b === void 0 ? variables_1.default.featureTrainingModalWidth : _b, _c = _a.title, title = _c === void 0 ? '' : _c, _d = _a.description, description = _d === void 0 ? '' : _d, _e = _a.secondaryDescription, secondaryDescription = _e === void 0 ? '' : _e, titleStyles = _a.titleStyles, _f = _a.shouldShowDismissModalOption, shouldShowDismissModalOption = _f === void 0 ? false : _f, _g = _a.confirmText, confirmText = _g === void 0 ? '' : _g, _h = _a.onConfirm, onConfirm = _h === void 0 ? function () { } : _h, _j = _a.onClose, onClose = _j === void 0 ? function () { } : _j, _k = _a.helpText, helpText = _k === void 0 ? '' : _k, _l = _a.onHelp, onHelp = _l === void 0 ? function () { } : _l, children = _a.children, contentInnerContainerStyles = _a.contentInnerContainerStyles, contentOuterContainerStyles = _a.contentOuterContainerStyles, modalInnerContainerStyle = _a.modalInnerContainerStyle, imageWidth = _a.imageWidth, imageHeight = _a.imageHeight, _m = _a.isModalDisabled, isModalDisabled = _m === void 0 ? true : _m, _o = _a.shouldRenderSVG, shouldRenderSVG = _o === void 0 ? true : _o, _p = _a.shouldRenderHTMLDescription, shouldRenderHTMLDescription = _p === void 0 ? false : _p, _q = _a.shouldCloseOnConfirm, shouldCloseOnConfirm = _q === void 0 ? true : _q, _r = _a.avoidKeyboard, avoidKeyboard = _r === void 0 ? false : _r, _s = _a.shouldUseScrollView, shouldUseScrollView = _s === void 0 ? false : _s, _t = _a.shouldShowConfirmationLoader, shouldShowConfirmationLoader = _t === void 0 ? false : _t, _u = _a.canConfirmWhileOffline, canConfirmWhileOffline = _u === void 0 ? true : _u, _v = _a.shouldGoBack, shouldGoBack = _v === void 0 ? true : _v, _w = _a.shouldCallOnHelpWhenModalHidden, shouldCallOnHelpWhenModalHidden = _w === void 0 ? false : _w;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var _x = (0, react_1.useState)(false), isModalVisible = _x[0], setIsModalVisible = _x[1];
    var _y = (0, react_1.useState)(true), willShowAgain = _y[0], setWillShowAgain = _y[1];
    var _z = (0, react_1.useState)('video'), videoStatus = _z[0], setVideoStatus = _z[1];
    var _0 = (0, react_1.useState)(false), isVideoStatusLocked = _0[0], setIsVideoStatusLocked = _0[1];
    var _1 = (0, react_1.useState)(illustrationAspectRatioProp !== null && illustrationAspectRatioProp !== void 0 ? illustrationAspectRatioProp : VIDEO_ASPECT_RATIO), illustrationAspectRatio = _1[0], setIllustrationAspectRatio = _1[1];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var hasHelpButtonBeenPressed = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            if (!isModalDisabled) {
                setIsModalVisible(false);
                return;
            }
            setIsModalVisible(true);
        });
    }, [isModalDisabled]);
    (0, react_1.useEffect)(function () {
        if (isVideoStatusLocked) {
            return;
        }
        if (isOffline) {
            setVideoStatus('animation');
        }
        else if (!isOffline) {
            setVideoStatus('video');
            setIsVideoStatusLocked(true);
        }
    }, [isOffline, isVideoStatusLocked]);
    var setAspectRatio = function (event) {
        if (!event) {
            return;
        }
        if ('naturalSize' in event) {
            setIllustrationAspectRatio(event.naturalSize.width / event.naturalSize.height);
        }
        else {
            setIllustrationAspectRatio(event.srcElement.videoWidth / event.srcElement.videoHeight);
        }
    };
    var renderIllustration = (0, react_1.useCallback)(function () {
        var aspectRatio = illustrationAspectRatio || VIDEO_ASPECT_RATIO;
        return (<react_native_1.View style={[
                styles.w100,
                // Prevent layout jumps by reserving height
                // for the video until it loads. Also, when
                // videoStatus === 'animation' it will
                // set the same aspect ratio as the video would.
                illustrationInnerContainerStyle,
                (!!videoURL || !!image) && { aspectRatio: aspectRatio },
            ]}>
                {!!image &&
                (shouldRenderSVG ? (<ImageSVG_1.default src={image} contentFit={contentFitImage} width={imageWidth} height={imageHeight} testID={CONST_1.default.IMAGE_SVG_TEST_ID}/>) : (<react_native_1.Image source={image} resizeMode={contentFitImage} style={styles.featureTrainingModalImage} testID={CONST_1.default.IMAGE_TEST_ID}/>))}
                {!!videoURL && videoStatus === 'video' && (<react_native_gesture_handler_1.GestureHandlerRootView>
                        <VideoPlayer_1.default url={videoURL} videoPlayerStyle={[styles.onboardingVideoPlayer, { aspectRatio: aspectRatio }]} onVideoLoaded={setAspectRatio} controlsStatus={CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.HIDE} shouldUseControlsBottomMargin={false} shouldPlay isLooping/>
                    </react_native_gesture_handler_1.GestureHandlerRootView>)}
                {((!videoURL && !image) || (!!videoURL && videoStatus === 'animation')) && (<react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, !!videoURL && { aspectRatio: aspectRatio }, animationStyle]}>
                        <Lottie_1.default source={animation !== null && animation !== void 0 ? animation : LottieAnimations_1.default.Hands} style={styles.h100} webStyle={shouldUseNarrowLayout ? styles.h100 : undefined} autoPlay loop/>
                    </react_native_1.View>)}
            </react_native_1.View>);
    }, [
        illustrationAspectRatio,
        styles.w100,
        styles.featureTrainingModalImage,
        styles.onboardingVideoPlayer,
        styles.flex1,
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.h100,
        illustrationInnerContainerStyle,
        videoURL,
        image,
        shouldRenderSVG,
        contentFitImage,
        imageWidth,
        imageHeight,
        videoStatus,
        animationStyle,
        animation,
        shouldUseNarrowLayout,
    ]);
    var toggleWillShowAgain = (0, react_1.useCallback)(function () { return setWillShowAgain(function (prevWillShowAgain) { return !prevWillShowAgain; }); }, []);
    var closeModal = (0, react_1.useCallback)(function () {
        if (!willShowAgain) {
            (0, User_1.dismissTrackTrainingModal)();
        }
        setIsModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            if (shouldGoBack) {
                Navigation_1.default.goBack();
            }
            onClose === null || onClose === void 0 ? void 0 : onClose();
        });
    }, [onClose, shouldGoBack, willShowAgain]);
    var closeAndConfirmModal = (0, react_1.useCallback)(function () {
        if (shouldCloseOnConfirm) {
            closeModal();
        }
        onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm(willShowAgain);
    }, [shouldCloseOnConfirm, onConfirm, closeModal, willShowAgain]);
    /**
     * Extracts values from the non-scraped attribute WEB_PROP_ATTR at build time
     * to ensure necessary properties are available for further processing.
     * Reevaluates "fs-class" to dynamically apply styles or behavior based on
     * updated attribute values.
     */
    (0, react_1.useLayoutEffect)(Fullstory_1.parseFSAttributes, []);
    var Wrapper = shouldUseScrollView ? ScrollView_1.default : react_native_1.View;
    return (<Modal_1.default avoidKeyboard={avoidKeyboard} isVisible={isModalVisible} type={onboardingIsMediumOrLargerScreenWidth ? CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED} onClose={closeModal} innerContainerStyle={__assign(__assign(__assign(__assign({ boxShadow: 'none' }, (shouldUseScrollView ? styles.pb0 : styles.pb5)), { paddingTop: onboardingIsMediumOrLargerScreenWidth ? undefined : MODAL_PADDING }), (onboardingIsMediumOrLargerScreenWidth
            ? // Override styles defined by MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                // To make it take as little space as possible.
                {
                    flex: undefined,
                    width: 'auto',
                }
            : {})), modalInnerContainerStyle)} onModalHide={function () {
            if (!shouldCallOnHelpWhenModalHidden || !hasHelpButtonBeenPressed.current) {
                return;
            }
            onHelp();
        }} shouldUseReanimatedModal>
            <Wrapper style={[styles.mh100, onboardingIsMediumOrLargerScreenWidth && StyleUtils.getWidthStyle(width)]} contentContainerStyle={shouldUseScrollView ? styles.pb5 : undefined} keyboardShouldPersistTaps={shouldUseScrollView ? 'handled' : undefined} fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}>
                <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? { padding: MODAL_PADDING } : { paddingHorizontal: MODAL_PADDING }, illustrationOuterContainerStyle]}>
                    {renderIllustration()}
                </react_native_1.View>
                <react_native_1.View style={[styles.mt5, styles.mh5, contentOuterContainerStyles]}>
                    {!!title && !!description && (<react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [styles.mb10], contentInnerContainerStyles]}>
                            {typeof title === 'string' ? <Text_1.default style={[styles.textHeadlineH1, titleStyles]}>{title}</Text_1.default> : title}
                            {shouldRenderHTMLDescription ? <RenderHTML_1.default html={description}/> : <Text_1.default style={styles.textSupporting}>{description}</Text_1.default>}
                            {secondaryDescription.length > 0 && <Text_1.default style={[styles.textSupporting, styles.mt4]}>{secondaryDescription}</Text_1.default>}
                            {children}
                        </react_native_1.View>)}
                    {shouldShowDismissModalOption && (<CheckboxWithLabel_1.default label={translate('featureTraining.doNotShowAgain')} accessibilityLabel={translate('featureTraining.doNotShowAgain')} style={[styles.mb5]} isChecked={!willShowAgain} onInputChange={toggleWillShowAgain}/>)}
                    {!!helpText && (<Button_1.default large style={[styles.mb3]} onPress={function () {
                if (shouldCallOnHelpWhenModalHidden) {
                    setIsModalVisible(false);
                    hasHelpButtonBeenPressed.current = true;
                    return;
                }
                onHelp();
            }} text={helpText}/>)}
                    <FormAlertWithSubmitButton_1.default onSubmit={closeAndConfirmModal} isLoading={shouldShowConfirmationLoader} buttonText={confirmText} enabledWhenOffline={canConfirmWhileOffline}/>
                    {!canConfirmWhileOffline && <OfflineIndicator_1.default />}
                </react_native_1.View>
            </Wrapper>
        </Modal_1.default>);
}
exports.default = FeatureTrainingModal;
