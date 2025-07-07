"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_image_size_1 = require("react-native-image-size");
var react_native_reanimated_1 = require("react-native-reanimated");
var Button_1 = require("@components/Button");
var HeaderGap_1 = require("@components/HeaderGap");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Modal_1 = require("@components/Modal");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var cropOrRotateImage_1 = require("@libs/cropOrRotateImage");
var CONST_1 = require("@src/CONST");
var ImageCropView_1 = require("./ImageCropView");
var Slider_1 = require("./Slider");
// This component can't be written using class since reanimated API uses hooks.
function AvatarCropModal(_a) {
    var _b = _a.imageUri, imageUri = _b === void 0 ? '' : _b, _c = _a.imageName, imageName = _c === void 0 ? '' : _c, _d = _a.imageType, imageType = _d === void 0 ? '' : _d, onClose = _a.onClose, onSave = _a.onSave, isVisible = _a.isVisible, maskImage = _a.maskImage;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var originalImageWidth = (0, react_native_reanimated_1.useSharedValue)(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE);
    var originalImageHeight = (0, react_native_reanimated_1.useSharedValue)(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE);
    var translateY = (0, react_native_reanimated_1.useSharedValue)(0);
    var translateX = (0, react_native_reanimated_1.useSharedValue)(0);
    var scale = (0, react_native_reanimated_1.useSharedValue)(CONST_1.default.AVATAR_CROP_MODAL.MIN_SCALE);
    var rotation = (0, react_native_reanimated_1.useSharedValue)(0);
    var translateSlider = (0, react_native_reanimated_1.useSharedValue)(0);
    var isPressableEnabled = (0, react_native_reanimated_1.useSharedValue)(true);
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    // Check if image cropping, saving or uploading is in progress
    var isLoading = (0, react_native_reanimated_1.useSharedValue)(false);
    // The previous offset values are maintained to recalculate the offset value in proportion
    // to the container size, especially when the window size is first decreased and then increased
    var prevMaxOffsetX = (0, react_native_reanimated_1.useSharedValue)(0);
    var prevMaxOffsetY = (0, react_native_reanimated_1.useSharedValue)(0);
    var _e = (0, react_1.useState)(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE), imageContainerSize = _e[0], setImageContainerSize = _e[1];
    var _f = (0, react_1.useState)(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE), sliderContainerSize = _f[0], setSliderContainerSize = _f[1];
    var _g = (0, react_1.useState)(false), isImageContainerInitialized = _g[0], setIsImageContainerInitialized = _g[1];
    var _h = (0, react_1.useState)(false), isImageInitialized = _h[0], setIsImageInitialized = _h[1];
    // An onLayout callback, that initializes the image container, for proper render of an image
    var initializeImageContainer = (0, react_1.useCallback)(function (event) {
        setIsImageContainerInitialized(true);
        var _a = event.nativeEvent.layout, height = _a.height, width = _a.width;
        // Even if the browser height is reduced too much, the relative height should not be negative
        var relativeHeight = Math.max(height - CONST_1.default.AVATAR_CROP_MODAL.CONTAINER_VERTICAL_MARGIN, CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setImageContainerSize(Math.floor(Math.min(relativeHeight, width)));
    }, []);
    // An onLayout callback, that initializes the slider container size, for proper render of a slider
    var initializeSliderContainer = (0, react_1.useCallback)(function (event) {
        setSliderContainerSize(event.nativeEvent.layout.width);
    }, []);
    // Changes the modal state values to initial
    var resetState = (0, react_1.useCallback)(function () {
        originalImageWidth.set(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE);
        originalImageHeight.set(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE);
        translateY.set(0);
        translateX.set(0);
        scale.set(CONST_1.default.AVATAR_CROP_MODAL.MIN_SCALE);
        rotation.set(0);
        translateSlider.set(0);
        prevMaxOffsetX.set(0);
        prevMaxOffsetY.set(0);
        isLoading.set(false);
        setImageContainerSize(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setSliderContainerSize(CONST_1.default.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setIsImageContainerInitialized(false);
        setIsImageInitialized(false);
    }, [originalImageHeight, originalImageWidth, prevMaxOffsetX, prevMaxOffsetY, rotation, scale, translateSlider, translateX, translateY, isLoading]);
    // In order to calculate proper image position/size/animation, we have to know its size.
    // And we have to update image size if image url changes.
    (0, react_1.useEffect)(function () {
        if (!imageUri) {
            return;
        }
        // We need to have image sizes in shared values to properly calculate position/size/animation
        react_native_image_size_1.default.getSize(imageUri).then(function (_a) {
            var width = _a.width, height = _a.height, originalRotation = _a.rotation;
            // On Android devices ImageSize library returns also rotation parameter.
            if (originalRotation === 90 || originalRotation === 270) {
                originalImageHeight.set(width);
                originalImageWidth.set(height);
            }
            else {
                originalImageHeight.set(height);
                originalImageWidth.set(width);
            }
            setIsImageInitialized(true);
            // Because the reanimated library has some internal optimizations,
            // sometimes when the modal is hidden styles of the image and slider might not be updated.
            // To trigger the update we need to slightly change the following values:
            translateSlider.set(function (value) { return value + 0.01; });
            rotation.set(function (value) { return value + 360; });
        });
    }, [imageUri, originalImageHeight, originalImageWidth, rotation, translateSlider]);
    /**
     * Validates that value is within the provided mix/max range.
     */
    var clamp = (0, react_1.useCallback)(function (value, _a) {
        'worklet';
        var min = _a[0], max = _a[1];
        return (0, react_native_reanimated_1.interpolate)(value, [min, max], [min, max], 'clamp');
    }, []);
    /**
     * Returns current image size taking into account scale and rotation.
     */
    var getDisplayedImageSize = (0, react_1.useCallback)(function () {
        'worklet';
        var height = imageContainerSize * scale.get();
        var width = imageContainerSize * scale.get();
        // Since the smaller side will be always equal to the imageContainerSize multiplied by scale,
        // another side can be calculated with aspect ratio.
        if (originalImageWidth.get() > originalImageHeight.get()) {
            width *= originalImageWidth.get() / originalImageHeight.get();
        }
        else {
            height *= originalImageHeight.get() / originalImageWidth.get();
        }
        return { height: height, width: width };
    }, [imageContainerSize, originalImageHeight, originalImageWidth, scale]);
    /**
     * Validates the offset to prevent overflow, and updates the image offset.
     */
    var updateImageOffset = (0, react_1.useCallback)(function (offsetX, offsetY) {
        'worklet';
        var _a = getDisplayedImageSize(), height = _a.height, width = _a.width;
        var maxOffsetX = (width - imageContainerSize) / 2;
        var maxOffsetY = (height - imageContainerSize) / 2;
        translateX.set(clamp(offsetX, [maxOffsetX * -1, maxOffsetX]));
        translateY.set(clamp(offsetY, [maxOffsetY * -1, maxOffsetY]));
        prevMaxOffsetX.set(maxOffsetX);
        prevMaxOffsetY.set(maxOffsetY);
    }, [getDisplayedImageSize, imageContainerSize, translateX, clamp, translateY, prevMaxOffsetX, prevMaxOffsetY]);
    var newScaleValue = (0, react_1.useCallback)(function (newSliderValue, containerSize) {
        'worklet';
        var _a = CONST_1.default.AVATAR_CROP_MODAL, MAX_SCALE = _a.MAX_SCALE, MIN_SCALE = _a.MIN_SCALE;
        return (newSliderValue / containerSize) * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
    }, []);
    /**
     * Calculates new x & y image translate value on image panning
     * and updates image's offset.
     */
    var panGesture = react_native_gesture_handler_1.Gesture.Pan().onChange(function (event) {
        var newX = translateX.get() + event.changeX;
        var newY = translateY.get() + event.changeY;
        updateImageOffset(newX, newY);
    });
    // This effect is needed to recalculate the maximum offset values
    // when the browser window is resized.
    (0, react_1.useEffect)(function () {
        // If no panning has happened and the value is 0, do an early return.
        if (!prevMaxOffsetX.get() && !prevMaxOffsetY.get()) {
            return;
        }
        var _a = getDisplayedImageSize(), height = _a.height, width = _a.width;
        var maxOffsetX = (width - imageContainerSize) / 2;
        var maxOffsetY = (height - imageContainerSize) / 2;
        // Since interpolation is expensive, we only want to do it if
        // image has been panned across X or Y axis by the user.
        if (prevMaxOffsetX) {
            translateX.set((0, react_native_reanimated_1.interpolate)(translateX.get(), [prevMaxOffsetX.get() * -1, prevMaxOffsetX.get()], [maxOffsetX * -1, maxOffsetX]));
        }
        if (prevMaxOffsetY) {
            translateY.set((0, react_native_reanimated_1.interpolate)(translateY.get(), [prevMaxOffsetY.get() * -1, prevMaxOffsetY.get()], [maxOffsetY * -1, maxOffsetY]));
        }
        prevMaxOffsetX.set(maxOffsetX);
        prevMaxOffsetY.set(maxOffsetY);
    }, [getDisplayedImageSize, imageContainerSize, prevMaxOffsetX, prevMaxOffsetY, translateX, translateY]);
    /**
     * Calculates new scale value and updates images offset to ensure
     * that image stays in the center of the container after changing scale.
     */
    var sliderPanGestureCallbacks = {
        onBegin: function () {
            'worklet';
            isPressableEnabled.set(false);
        },
        onChange: function (event) {
            'worklet';
            var newSliderValue = clamp(translateSlider.get() + event.changeX, [0, sliderContainerSize]);
            var newScale = newScaleValue(newSliderValue, sliderContainerSize);
            var differential = newScale / scale.get();
            scale.set(newScale);
            translateSlider.set(newSliderValue);
            var newX = translateX.get() * differential;
            var newY = translateY.get() * differential;
            updateImageOffset(newX, newY);
        },
        onFinalize: function () {
            'worklet';
            isPressableEnabled.set(true);
        },
    };
    // This effect is needed to prevent the incorrect position of
    // the slider's knob when the window's layout changes
    (0, react_1.useEffect)(function () {
        translateSlider.set((0, react_native_reanimated_1.interpolate)(scale.get(), [CONST_1.default.AVATAR_CROP_MODAL.MIN_SCALE, CONST_1.default.AVATAR_CROP_MODAL.MAX_SCALE], [0, sliderContainerSize]));
    }, [scale, sliderContainerSize, translateSlider]);
    // Rotates the image by changing the rotation value by 90 degrees
    // and updating the position so the image remains in the same place after rotation
    var rotateImage = (0, react_1.useCallback)(function () {
        (0, react_native_reanimated_1.runOnUI)(function () {
            rotation.set(function (value) { return value - 90; });
            var oldTranslateX = translateX.get();
            translateX.set(translateY.get());
            translateY.set(oldTranslateX * -1);
            var oldOriginalImageHeight = originalImageHeight.get();
            originalImageHeight.set(originalImageWidth.get());
            originalImageWidth.set(oldOriginalImageHeight);
        })();
    }, [originalImageHeight, originalImageWidth, rotation, translateX, translateY]);
    // Crops an image that was provided in the imageUri prop, using the current position/scale
    // then calls onSave and onClose callbacks
    var cropAndSaveImage = (0, react_1.useCallback)(function () {
        if (isLoading.get()) {
            return;
        }
        isLoading.set(true);
        var smallerSize = Math.min(originalImageHeight.get(), originalImageWidth.get());
        var size = smallerSize / scale.get();
        var imageCenterX = originalImageWidth.get() / 2;
        var imageCenterY = originalImageHeight.get() / 2;
        var apothem = size / 2; // apothem for squares is equals to half of it size
        // Since the translate value is only a distance from the image center, we are able to calculate
        // the originX and the originY - start coordinates of cropping view.
        var originX = imageCenterX - apothem - (translateX.get() / imageContainerSize / scale.get()) * smallerSize;
        var originY = imageCenterY - apothem - (translateY.get() / imageContainerSize / scale.get()) * smallerSize;
        var crop = {
            height: size,
            width: size,
            originX: originX,
            originY: originY,
        };
        // Svg images are converted to a png blob to preserve transparency, so we need to update the
        // image name and type accordingly.
        var isSvg = imageType.includes('image/svg');
        var name = isSvg ? 'fileName.png' : imageName;
        var type = isSvg ? 'image/png' : imageType;
        (0, cropOrRotateImage_1.default)(imageUri, [{ rotate: rotation.get() % 360 }, { crop: crop }], { compress: 1, name: name, type: type })
            .then(function (newImage) {
            onClose === null || onClose === void 0 ? void 0 : onClose();
            onSave === null || onSave === void 0 ? void 0 : onSave(newImage);
        })
            .catch(function () {
            isLoading.set(false);
        });
    }, [isLoading, originalImageHeight, originalImageWidth, scale, translateX, imageContainerSize, translateY, imageType, imageName, imageUri, rotation, onClose, onSave]);
    var sliderOnPress = function (locationX) {
        // We are using the worklet directive here and running on the UI thread to ensure the Reanimated
        // shared values are updated synchronously, as they update asynchronously on the JS thread.
        'worklet';
        if (!locationX || !isPressableEnabled.get()) {
            return;
        }
        var newSliderValue = clamp(locationX, [0, sliderContainerSize]);
        var newScale = newScaleValue(newSliderValue, sliderContainerSize);
        translateSlider.set(newSliderValue);
        var differential = newScale / scale.get();
        scale.set(newScale);
        var newX = translateX.get() * differential;
        var newY = translateY.get() * differential;
        updateImageOffset(newX, newY);
    };
    return (<Modal_1.default onClose={function () { return onClose === null || onClose === void 0 ? void 0 : onClose(); }} isVisible={isVisible} type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} onModalHide={resetState} shouldUseCustomBackdrop shouldHandleNavigationBack enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} includeSafeAreaPaddingBottom shouldEnableKeyboardAvoidingView={false} testID={AvatarCropModal.displayName}>
                {shouldUseNarrowLayout && <HeaderGap_1.default />}
                <HeaderWithBackButton_1.default title={translate('avatarCropModal.title')} onBackButtonPress={onClose}/>
                <Text_1.default style={[styles.mh5]}>{translate('avatarCropModal.description')}</Text_1.default>
                <react_native_gesture_handler_1.GestureHandlerRootView onLayout={initializeImageContainer} style={[styles.alignSelfStretch, styles.m5, styles.flex1, styles.alignItemsCenter]}>
                    {/* To avoid layout shift we should hide this component until the image container & image is initialized */}
                    {!isImageInitialized || !isImageContainerInitialized ? (<react_native_1.ActivityIndicator color={theme.spinner} style={[styles.flex1]} size="large"/>) : (<>
                            <ImageCropView_1.default imageUri={imageUri} containerSize={imageContainerSize} panGesture={panGesture} originalImageHeight={originalImageHeight} originalImageWidth={originalImageWidth} scale={scale} translateY={translateY} translateX={translateX} rotation={rotation} maskImage={maskImage}/>
                            <react_native_1.View style={[styles.mt5, styles.justifyContentBetween, styles.alignItemsCenter, styles.flexRow, StyleUtils.getWidthStyle(imageContainerSize)]}>
                                <Icon_1.default src={Expensicons.Zoom} fill={theme.icon}/>

                                <PressableWithoutFeedback_1.default style={[styles.mh5, styles.flex1]} onLayout={initializeSliderContainer} onPressIn={function (e) { return (0, react_native_reanimated_1.runOnUI)(sliderOnPress)(e.nativeEvent.locationX); }} accessibilityLabel="slider" role={CONST_1.default.ROLE.SLIDER}>
                                    <Slider_1.default sliderValue={translateSlider} gestureCallbacks={sliderPanGestureCallbacks}/>
                                </PressableWithoutFeedback_1.default>
                                <Tooltip_1.default text={translate('common.rotate')} shiftVertical={-2}>
                                    <react_native_1.View>
                                        <Button_1.default icon={Expensicons.Rotate} iconFill={theme.icon} onPress={rotateImage}/>
                                    </react_native_1.View>
                                </Tooltip_1.default>
                            </react_native_1.View>
                        </>)}
                </react_native_gesture_handler_1.GestureHandlerRootView>
                <Button_1.default success style={[styles.m5]} onPress={cropAndSaveImage} pressOnEnter large text={translate('common.save')}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
AvatarCropModal.displayName = 'AvatarCropModal';
exports.default = AvatarCropModal;
