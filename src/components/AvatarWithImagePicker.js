"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser_1 = require("@libs/Browser");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var getImageResolution_1 = require("@libs/fileDownload/getImageResolution");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var AttachmentModal_1 = require("./AttachmentModal");
var AttachmentPicker_1 = require("./AttachmentPicker");
var Avatar_1 = require("./Avatar");
var AvatarCropModal_1 = require("./AvatarCropModal/AvatarCropModal");
var DotIndicatorMessage_1 = require("./DotIndicatorMessage");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var OfflineWithFeedback_1 = require("./OfflineWithFeedback");
var PopoverMenu_1 = require("./PopoverMenu");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var Tooltip_1 = require("./Tooltip");
function AvatarWithImagePicker(_a) {
    var _b = _a.DefaultAvatar, DefaultAvatar = _b === void 0 ? function () { return null; } : _b, style = _a.style, disabledStyle = _a.disabledStyle, editIconStyle = _a.editIconStyle, pendingAction = _a.pendingAction, errors = _a.errors, errorRowStyles = _a.errorRowStyles, _c = _a.onErrorClose, onErrorClose = _c === void 0 ? function () { } : _c, _d = _a.source, source = _d === void 0 ? '' : _d, avatarID = _a.avatarID, _e = _a.fallbackIcon, fallbackIcon = _e === void 0 ? Expensicons.FallbackAvatar : _e, _f = _a.size, size = _f === void 0 ? CONST_1.default.AVATAR_SIZE.DEFAULT : _f, _g = _a.type, type = _g === void 0 ? CONST_1.default.ICON_TYPE_AVATAR : _g, _h = _a.headerTitle, headerTitle = _h === void 0 ? '' : _h, _j = _a.previewSource, previewSource = _j === void 0 ? '' : _j, _k = _a.originalFileName, originalFileName = _k === void 0 ? '' : _k, _l = _a.isUsingDefaultAvatar, isUsingDefaultAvatar = _l === void 0 ? false : _l, _m = _a.onImageSelected, onImageSelected = _m === void 0 ? function () { } : _m, _o = _a.onImageRemoved, onImageRemoved = _o === void 0 ? function () { } : _o, editorMaskImage = _a.editorMaskImage, avatarStyle = _a.avatarStyle, _p = _a.disabled, disabled = _p === void 0 ? false : _p, onViewPhotoPress = _a.onViewPhotoPress, _q = _a.enablePreview, enablePreview = _q === void 0 ? false : _q, _r = _a.shouldDisableViewPhoto, shouldDisableViewPhoto = _r === void 0 ? false : _r, _s = _a.editIcon, editIcon = _s === void 0 ? Expensicons.Pencil : _s, _t = _a.shouldUseStyleUtilityForAnchorPosition, shouldUseStyleUtilityForAnchorPosition = _t === void 0 ? false : _t;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var isFocused = (0, native_1.useIsFocused)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var _u = (0, react_1.useState)({ horizontal: 0, vertical: 0 }), popoverPosition = _u[0], setPopoverPosition = _u[1];
    var _v = (0, react_1.useState)(false), isMenuVisible = _v[0], setIsMenuVisible = _v[1];
    var _w = (0, react_1.useState)({ validationError: null, phraseParam: {} }), errorData = _w[0], setErrorData = _w[1];
    var _x = (0, react_1.useState)(false), isAvatarCropModalOpen = _x[0], setIsAvatarCropModalOpen = _x[1];
    var _y = (0, react_1.useState)({
        uri: '',
        name: '',
        type: '',
    }), imageData = _y[0], setImageData = _y[1];
    var anchorRef = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    var setError = function (error, phraseParam) {
        setErrorData({
            validationError: error,
            phraseParam: phraseParam,
        });
    };
    (0, react_1.useEffect)(function () {
        if (isFocused) {
            return;
        }
        // Reset the error if the component is no longer focused.
        setError(null, {});
    }, [isFocused]);
    (0, react_1.useEffect)(function () {
        setError(null, {});
    }, [source, avatarID]);
    /**
     * Check if the attachment extension is allowed.
     */
    var isValidExtension = (0, react_1.useCallback)(function (image) {
        var _a;
        var fileExtension = (0, FileUtils_1.splitExtensionFromFileName)((_a = image === null || image === void 0 ? void 0 : image.name) !== null && _a !== void 0 ? _a : '').fileExtension;
        return CONST_1.default.AVATAR_ALLOWED_EXTENSIONS.some(function (extension) { return extension === fileExtension.toLowerCase(); });
    }, []);
    /**
     * Check if the attachment size is less than allowed size.
     */
    var isValidSize = (0, react_1.useCallback)(function (image) { var _a; return ((_a = image === null || image === void 0 ? void 0 : image.size) !== null && _a !== void 0 ? _a : 0) < CONST_1.default.AVATAR_MAX_ATTACHMENT_SIZE; }, []);
    /**
     * Check if the attachment resolution matches constraints.
     */
    var isValidResolution = function (image) {
        return (0, getImageResolution_1.default)(image).then(function (_a) {
            var height = _a.height, width = _a.width;
            return height >= CONST_1.default.AVATAR_MIN_HEIGHT_PX && width >= CONST_1.default.AVATAR_MIN_WIDTH_PX && height <= CONST_1.default.AVATAR_MAX_HEIGHT_PX && width <= CONST_1.default.AVATAR_MAX_WIDTH_PX;
        });
    };
    /**
     * Validates if an image has a valid resolution and opens an avatar crop modal
     */
    var showAvatarCropModal = (0, react_1.useCallback)(function (image) {
        if (!isValidExtension(image)) {
            setError('avatarWithImagePicker.notAllowedExtension', { allowedExtensions: CONST_1.default.AVATAR_ALLOWED_EXTENSIONS });
            return;
        }
        if (!isValidSize(image)) {
            setError('avatarWithImagePicker.sizeExceeded', { maxUploadSizeInMB: CONST_1.default.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024) });
            return;
        }
        (0, FileUtils_1.validateImageForCorruption)(image)
            .then(function () { return isValidResolution(image); })
            .then(function (isValid) {
            var _a, _b, _c;
            if (!isValid) {
                setError('avatarWithImagePicker.resolutionConstraints', {
                    minHeightInPx: CONST_1.default.AVATAR_MIN_HEIGHT_PX,
                    minWidthInPx: CONST_1.default.AVATAR_MIN_WIDTH_PX,
                    maxHeightInPx: CONST_1.default.AVATAR_MAX_HEIGHT_PX,
                    maxWidthInPx: CONST_1.default.AVATAR_MAX_WIDTH_PX,
                });
                return;
            }
            setIsAvatarCropModalOpen(true);
            setError(null, {});
            setIsMenuVisible(false);
            setImageData({
                uri: (_a = image.uri) !== null && _a !== void 0 ? _a : '',
                name: (_b = image.name) !== null && _b !== void 0 ? _b : '',
                type: (_c = image.type) !== null && _c !== void 0 ? _c : '',
            });
        })
            .catch(function () {
            setError('attachmentPicker.errorWhileSelectingCorruptedAttachment', {});
        });
    }, [isValidExtension, isValidSize]);
    var hideAvatarCropModal = function () {
        setIsAvatarCropModalOpen(false);
    };
    /**
     * Create menu items list for avatar menu
     */
    var createMenuItems = function (openPicker) {
        var menuItems = [
            {
                icon: Expensicons.Upload,
                text: translate('avatarWithImagePicker.uploadPhoto'),
                onSelected: function () {
                    if ((0, Browser_1.isSafari)()) {
                        return;
                    }
                    openPicker({
                        onPicked: function (data) { var _a; return showAvatarCropModal((_a = data.at(0)) !== null && _a !== void 0 ? _a : {}); },
                    });
                },
                shouldCallAfterModalHide: true,
            },
        ];
        // If current avatar isn't a default avatar, allow Remove Photo option
        if (!isUsingDefaultAvatar) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('avatarWithImagePicker.removePhoto'),
                onSelected: function () {
                    setError(null, {});
                    onImageRemoved();
                },
            });
        }
        return menuItems;
    };
    (0, react_1.useEffect)(function () {
        if (!anchorRef.current) {
            return;
        }
        if (!isMenuVisible) {
            return;
        }
        anchorRef.current.measureInWindow(function (x, y, width, height) {
            setPopoverPosition({
                horizontal: x + (width - variables_1.default.photoUploadPopoverWidth) / 2,
                vertical: y + height + variables_1.default.spacing2,
            });
        });
    }, [isMenuVisible, windowWidth]);
    var onPressAvatar = (0, react_1.useCallback)(function (openPicker) {
        if (disabled && enablePreview && onViewPhotoPress) {
            onViewPhotoPress();
            return;
        }
        if (isUsingDefaultAvatar) {
            openPicker({
                onPicked: function (data) { var _a; return showAvatarCropModal((_a = data.at(0)) !== null && _a !== void 0 ? _a : {}); },
            });
            return;
        }
        setIsMenuVisible(function (prev) { return !prev; });
    }, [disabled, enablePreview, isUsingDefaultAvatar, onViewPhotoPress, showAvatarCropModal]);
    return (<react_native_1.View style={[styles.w100, style]}>
            <react_native_1.View style={styles.w100}>
                <AttachmentModal_1.default headerTitle={headerTitle} source={previewSource} originalFileName={originalFileName} fallbackSource={fallbackIcon} maybeIcon={isUsingDefaultAvatar}>
                    {function (_a) {
            var show = _a.show;
            return (<AttachmentPicker_1.default type={CONST_1.default.ATTACHMENT_PICKER_TYPE.IMAGE} 
            // We need to skip the validation in AttachmentPicker because it is handled in this component itself
            shouldValidateImage={false}>
                            {function (_a) {
                    var openPicker = _a.openPicker;
                    var menuItems = createMenuItems(openPicker);
                    // If the current avatar isn't a default avatar and we are not overriding this behavior allow the "View Photo" option
                    if (!shouldDisableViewPhoto && !isUsingDefaultAvatar) {
                        menuItems.push({
                            icon: Expensicons.Eye,
                            text: translate('avatarWithImagePicker.viewPhoto'),
                            onSelected: function () {
                                if (typeof onViewPhotoPress !== 'function') {
                                    show();
                                    return;
                                }
                                onViewPhotoPress();
                            },
                            shouldCallAfterModalHide: true,
                        });
                    }
                    return (<>
                                        <OfflineWithFeedback_1.default errors={errors} errorRowStyles={errorRowStyles} onClose={onErrorClose}>
                                            <Tooltip_1.default shouldRender={!disabled} text={translate('avatarWithImagePicker.editImage')}>
                                                <PressableWithoutFeedback_1.default onPress={function () { return onPressAvatar(openPicker); }} accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('avatarWithImagePicker.editImage')} disabled={isAvatarCropModalOpen || (disabled && !enablePreview)} disabledStyle={disabledStyle} style={[styles.pRelative, type === CONST_1.default.ICON_TYPE_AVATAR && styles.alignSelfCenter, avatarStyle]} ref={anchorRef}>
                                                    <OfflineWithFeedback_1.default pendingAction={pendingAction}>
                                                        {source ? (<Avatar_1.default containerStyles={avatarStyle} imageStyles={[styles.alignSelfCenter, avatarStyle]} source={source} avatarID={avatarID} fallbackIcon={fallbackIcon} size={size} type={type}/>) : (<DefaultAvatar />)}
                                                    </OfflineWithFeedback_1.default>
                                                    {!disabled && (<react_native_1.View style={react_native_1.StyleSheet.flatten([styles.smallEditIcon, styles.smallAvatarEditIcon, editIconStyle])}>
                                                            <Icon_1.default src={editIcon} width={variables_1.default.iconSizeSmall} height={variables_1.default.iconSizeSmall} fill={theme.icon}/>
                                                        </react_native_1.View>)}
                                                </PressableWithoutFeedback_1.default>
                                            </Tooltip_1.default>
                                        </OfflineWithFeedback_1.default>
                                        <PopoverMenu_1.default isVisible={isMenuVisible} onClose={function () { return setIsMenuVisible(false); }} onItemSelected={function (item, index) {
                            setIsMenuVisible(false);
                            // In order for the file picker to open dynamically, the click
                            // function must be called from within an event handler that was initiated
                            // by the user on Safari.
                            if (index === 0 && (0, Browser_1.isSafari)()) {
                                openPicker({
                                    onPicked: function (data) { var _a; return showAvatarCropModal((_a = data.at(0)) !== null && _a !== void 0 ? _a : {}); },
                                });
                            }
                        }} menuItems={menuItems} anchorPosition={shouldUseStyleUtilityForAnchorPosition ? styles.popoverMenuOffset(windowWidth) : popoverPosition} anchorAlignment={{ horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP }} anchorRef={anchorRef}/>
                                    </>);
                }}
                        </AttachmentPicker_1.default>);
        }}
                </AttachmentModal_1.default>
            </react_native_1.View>
            {!!errorData.validationError && (<DotIndicatorMessage_1.default style={[styles.mt6]} 
        // eslint-disable-next-line @typescript-eslint/naming-convention
        messages={{ 0: translate(errorData.validationError, errorData.phraseParam) }} type="error"/>)}
            <AvatarCropModal_1.default onClose={hideAvatarCropModal} isVisible={isAvatarCropModalOpen} onSave={onImageSelected} imageUri={imageData.uri} imageName={imageData.name} imageType={imageData.type} maskImage={editorMaskImage}/>
        </react_native_1.View>);
}
AvatarWithImagePicker.displayName = 'AvatarWithImagePicker';
exports.default = AvatarWithImagePicker;
