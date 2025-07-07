"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var picker_1 = require("@react-native-documents/picker");
var expensify_common_1 = require("expensify-common");
var expo_image_manipulator_1 = require("expo-image-manipulator");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_blob_util_1 = require("react-native-blob-util");
var react_native_image_picker_1 = require("react-native-image-picker");
var react_native_image_size_1 = require("react-native-image-size");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var Popover_1 = require("@components/Popover");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var CONST_1 = require("@src/CONST");
var launchCamera_1 = require("./launchCamera/launchCamera");
/**
 * Return imagePickerOptions based on the type
 */
var getImagePickerOptions = function (type, fileLimit) {
    // mediaType property is one of the ImagePicker configuration to restrict types'
    var mediaType = type === CONST_1.default.ATTACHMENT_PICKER_TYPE.IMAGE ? 'photo' : 'mixed';
    /**
     * See https://github.com/react-native-image-picker/react-native-image-picker/#options
     * for ImagePicker configuration options
     */
    return {
        mediaType: mediaType,
        includeBase64: false,
        saveToPhotos: false,
        includeExtra: false,
        assetRepresentationMode: 'current',
        selectionLimit: fileLimit,
    };
};
/**
 * The data returned from `show` is different on web and mobile, so use this function to ensure the data we
 * send to the xhr will be handled properly.
 */
var getDataForUpload = function (fileData) {
    var fileName = fileData.name || 'chat_attachment';
    var fileResult = {
        name: (0, FileUtils_1.cleanFileName)(fileName),
        type: fileData.type,
        width: fileData.width,
        height: fileData.height,
        uri: fileData.uri,
        size: fileData.size,
    };
    if (fileResult.size) {
        return Promise.resolve(fileResult);
    }
    return react_native_blob_util_1.default.fs.stat(fileData.uri.replace('file://', '')).then(function (stats) {
        fileResult.size = stats.size;
        return fileResult;
    });
};
/**
 * This component renders a function as a child and
 * returns a "show attachment picker" method that takes
 * a callback. This is the ios/android implementation
 * opening a modal with attachment options
 */
function AttachmentPicker(_a) {
    var _this = this;
    var _b = _a.type, type = _b === void 0 ? CONST_1.default.ATTACHMENT_PICKER_TYPE.FILE : _b, children = _a.children, _c = _a.shouldHideCameraOption, shouldHideCameraOption = _c === void 0 ? false : _c, _d = _a.shouldValidateImage, shouldValidateImage = _d === void 0 ? true : _d, _e = _a.shouldHideGalleryOption, shouldHideGalleryOption = _e === void 0 ? false : _e, _f = _a.fileLimit, fileLimit = _f === void 0 ? 1 : _f, onOpenPicker = _a.onOpenPicker;
    var styles = (0, useThemeStyles_1.default)();
    var _g = (0, react_1.useState)(false), isVisible = _g[0], setIsVisible = _g[1];
    var StyleUtils = (0, useStyleUtils_1.default)();
    var theme = (0, useTheme_1.default)();
    var completeAttachmentSelection = (0, react_1.useRef)(function () { });
    var onModalHide = (0, react_1.useRef)(undefined);
    var onCanceled = (0, react_1.useRef)(function () { });
    var onClosed = (0, react_1.useRef)(function () { });
    var popoverRef = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    /**
     * A generic handling when we don't know the exact reason for an error
     */
    var showGeneralAlert = (0, react_1.useCallback)(function (message) {
        if (message === void 0) { message = translate('attachmentPicker.errorWhileSelectingAttachment'); }
        react_native_1.Alert.alert(translate('attachmentPicker.attachmentError'), message);
    }, [translate]);
    /**
     * Common image picker handling
     *
     * @param {function} imagePickerFunc - RNImagePicker.launchCamera or RNImagePicker.launchImageLibrary
     */
    var showImagePicker = (0, react_1.useCallback)(function (imagePickerFunc) {
        return new Promise(function (resolve, reject) {
            imagePickerFunc(getImagePickerOptions(type, fileLimit), function (response) {
                if (response.didCancel) {
                    // When the user cancelled resolve with no attachment
                    return resolve();
                }
                if (response.errorCode) {
                    switch (response.errorCode) {
                        case 'permission':
                            (0, FileUtils_1.showCameraPermissionsAlert)();
                            return resolve();
                        default:
                            showGeneralAlert();
                            break;
                    }
                    return reject(new Error("Error during attachment selection: ".concat(response.errorMessage)));
                }
                var assets = response.assets;
                if (!assets || assets.length === 0) {
                    return resolve();
                }
                var processedAssets = [];
                var processedCount = 0;
                var checkAllProcessed = function () {
                    processedCount++;
                    if (processedCount === assets.length) {
                        resolve(processedAssets.length > 0 ? processedAssets : undefined);
                    }
                };
                assets.forEach(function (asset) {
                    var _a;
                    if (!asset.uri) {
                        checkAllProcessed();
                        return;
                    }
                    if ((_a = asset.type) === null || _a === void 0 ? void 0 : _a.startsWith('image')) {
                        (0, FileUtils_1.verifyFileFormat)({ fileUri: asset.uri, formatSignatures: CONST_1.default.HEIC_SIGNATURES })
                            .then(function (isHEIC) {
                            // react-native-image-picker incorrectly changes file extension without transcoding the HEIC file, so we are doing it manually if we detect HEIC signature
                            if (isHEIC && asset.uri) {
                                expo_image_manipulator_1.ImageManipulator.manipulate(asset.uri)
                                    .renderAsync()
                                    .then(function (manipulatedImage) { return manipulatedImage.saveAsync({ format: expo_image_manipulator_1.SaveFormat.JPEG }); })
                                    .then(function (manipulationResult) {
                                    var uri = manipulationResult.uri;
                                    var convertedAsset = {
                                        uri: uri,
                                        name: uri
                                            .substring(uri.lastIndexOf('/') + 1)
                                            .split('?')
                                            .at(0),
                                        type: 'image/jpeg',
                                        width: manipulationResult.width,
                                        height: manipulationResult.height,
                                    };
                                    processedAssets.push(convertedAsset);
                                    checkAllProcessed();
                                })
                                    .catch(function (error) {
                                    var _a;
                                    showGeneralAlert((_a = error.message) !== null && _a !== void 0 ? _a : 'An unknown error occurred');
                                    checkAllProcessed();
                                });
                            }
                            else {
                                processedAssets.push(asset);
                                checkAllProcessed();
                            }
                        })
                            .catch(function (error) {
                            var _a;
                            showGeneralAlert((_a = error.message) !== null && _a !== void 0 ? _a : 'An unknown error occurred');
                            checkAllProcessed();
                        });
                    }
                    else {
                        processedAssets.push(asset);
                        checkAllProcessed();
                    }
                });
            });
        });
    }, [fileLimit, showGeneralAlert, type]);
    /**
     * Launch the DocumentPicker. Results are in the same format as ImagePicker
     */
    // eslint-disable-next-line @lwc/lwc/no-async-await
    var showDocumentPicker = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var pickedFiles, localCopies;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, picker_1.pick)({
                        type: [type === CONST_1.default.ATTACHMENT_PICKER_TYPE.IMAGE ? picker_1.types.images : picker_1.types.allFiles],
                        allowMultiSelection: fileLimit !== 1,
                    })];
                case 1:
                    pickedFiles = _a.sent();
                    return [4 /*yield*/, (0, picker_1.keepLocalCopy)({
                            files: pickedFiles.map(function (file) {
                                var _a;
                                return {
                                    uri: file.uri,
                                    fileName: (_a = file.name) !== null && _a !== void 0 ? _a : '',
                                };
                            }),
                            destination: 'cachesDirectory',
                        })];
                case 2:
                    localCopies = _a.sent();
                    return [2 /*return*/, pickedFiles.map(function (file, index) {
                            var localCopy = localCopies[index];
                            if (localCopy.status !== 'success') {
                                throw new Error("Couldn't create local file copy");
                            }
                            return {
                                name: file.name,
                                uri: localCopy.localUri,
                                size: file.size,
                                type: file.type,
                            };
                        })];
            }
        });
    }); }, [fileLimit, type]);
    var menuItemData = (0, react_1.useMemo)(function () {
        var data = [
            {
                icon: Expensicons.Paperclip,
                textTranslationKey: 'attachmentPicker.chooseDocument',
                pickAttachment: showDocumentPicker,
            },
        ];
        if (!shouldHideGalleryOption) {
            data.unshift({
                icon: Expensicons.Gallery,
                textTranslationKey: 'attachmentPicker.chooseFromGallery',
                pickAttachment: function () { return showImagePicker(react_native_image_picker_1.launchImageLibrary); },
            });
        }
        if (!shouldHideCameraOption) {
            data.unshift({
                icon: Expensicons.Camera,
                textTranslationKey: 'attachmentPicker.takePhoto',
                pickAttachment: function () { return showImagePicker(launchCamera_1.default); },
            });
        }
        return data;
    }, [showDocumentPicker, shouldHideGalleryOption, shouldHideCameraOption, showImagePicker]);
    var _h = (0, useArrowKeyFocusManager_1.default)({ initialFocusedIndex: -1, maxIndex: menuItemData.length - 1, isActive: isVisible }), focusedIndex = _h[0], setFocusedIndex = _h[1];
    /**
     * An attachment error dialog when user selected malformed images
     */
    var showImageCorruptionAlert = (0, react_1.useCallback)(function () {
        react_native_1.Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
    }, [translate]);
    /**
     * Opens the attachment modal
     *
     * @param onPickedHandler A callback that will be called with the selected attachment
     * @param onCanceledHandler A callback that will be called without a selected attachment
     */
    var open = function (onPickedHandler, onCanceledHandler, onClosedHandler) {
        if (onCanceledHandler === void 0) { onCanceledHandler = function () { }; }
        if (onClosedHandler === void 0) { onClosedHandler = function () { }; }
        // eslint-disable-next-line react-compiler/react-compiler
        completeAttachmentSelection.current = onPickedHandler;
        onCanceled.current = onCanceledHandler;
        onClosed.current = onClosedHandler;
        setIsVisible(true);
    };
    /**
     * Closes the attachment modal
     */
    var close = function () {
        setIsVisible(false);
    };
    /**
     * Handles the image/document picker result and
     * sends the selected attachment to the caller (parent component)
     */
    var pickAttachment = (0, react_1.useCallback)(function (attachments) {
        if (attachments === void 0) { attachments = []; }
        if (!attachments || attachments.length === 0) {
            onCanceled.current();
            return Promise.resolve();
        }
        var filesToProcess = attachments.map(function (fileData) {
            var _a;
            if (!fileData) {
                return Promise.resolve(null);
            }
            /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
            var fileDataName = ('fileName' in fileData && fileData.fileName) || ('name' in fileData && fileData.name) || '';
            var fileDataUri = ('uri' in fileData && fileData.uri) || '';
            var fileDataObject = {
                name: fileDataName !== null && fileDataName !== void 0 ? fileDataName : '',
                uri: fileDataUri,
                size: ('size' in fileData && fileData.size) || ('fileSize' in fileData && fileData.fileSize) || null,
                type: (_a = fileData.type) !== null && _a !== void 0 ? _a : '',
                width: ('width' in fileData && fileData.width) || undefined,
                height: ('height' in fileData && fileData.height) || undefined,
            };
            if (!shouldValidateImage && fileDataName && expensify_common_1.Str.isImage(fileDataName)) {
                return react_native_image_size_1.default.getSize(fileDataUri)
                    .then(function (_a) {
                    var width = _a.width, height = _a.height;
                    fileDataObject.width = width;
                    fileDataObject.height = height;
                    return fileDataObject;
                })
                    .then(function (file) { return getDataForUpload(file); })
                    .catch(function () {
                    showImageCorruptionAlert();
                    return null;
                });
            }
            if (fileDataName && expensify_common_1.Str.isImage(fileDataName)) {
                return react_native_image_size_1.default.getSize(fileDataUri)
                    .then(function (_a) {
                    var width = _a.width, height = _a.height;
                    fileDataObject.width = width;
                    fileDataObject.height = height;
                    if (fileDataObject.width <= 0 || fileDataObject.height <= 0) {
                        showImageCorruptionAlert();
                        return null;
                    }
                    return getDataForUpload(fileDataObject);
                })
                    .catch(function () {
                    showImageCorruptionAlert();
                    return null;
                });
            }
            return getDataForUpload(fileDataObject).catch(function (error) {
                showGeneralAlert(error.message);
                return null;
            });
        });
        return Promise.all(filesToProcess)
            .then(function (results) {
            var validResults = results.filter(function (result) { return result !== null; });
            if (validResults.length > 0) {
                completeAttachmentSelection.current(validResults);
            }
            else {
                onCanceled.current();
            }
        })
            .catch(function (error) {
            if (error instanceof Error) {
                showGeneralAlert(error.message);
            }
            else {
                showGeneralAlert('An unknown error occurred');
            }
        });
    }, [shouldValidateImage, showGeneralAlert, showImageCorruptionAlert]);
    /**
     * Setup native attachment selection to start after this popover closes
     *
     * @param {Object} item - an item from this.menuItemData
     * @param {Function} item.pickAttachment
     */
    var selectItem = (0, react_1.useCallback)(function (item) {
        onOpenPicker === null || onOpenPicker === void 0 ? void 0 : onOpenPicker();
        /* setTimeout delays execution to the frame after the modal closes
         * without this on iOS closing the modal closes the gallery/camera as well */
        onModalHide.current = function () {
            setTimeout(function () {
                item.pickAttachment()
                    .catch(function (error) {
                    if (JSON.stringify(error).includes('OPERATION_CANCELED')) {
                        return;
                    }
                    showGeneralAlert(error.message);
                    throw error;
                })
                    .then(function (result) { return pickAttachment(result); })
                    .catch(console.error)
                    .finally(function () {
                    onClosed.current();
                    delete onModalHide.current;
                });
            }, 200);
        };
        close();
    }, [onOpenPicker, pickAttachment, showGeneralAlert]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ENTER, function () {
        if (focusedIndex === -1) {
            return;
        }
        var item = menuItemData.at(focusedIndex);
        if (item) {
            selectItem(item);
            setFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
        }
    }, {
        isActive: isVisible,
    });
    /**
     * Call the `children` renderProp with the interface defined in propTypes
     */
    var renderChildren = function () {
        return children({
            openPicker: function (_a) {
                var onPicked = _a.onPicked, newOnCanceled = _a.onCanceled, newOnClosed = _a.onClosed;
                return open(onPicked, newOnCanceled, newOnClosed);
            },
        });
    };
    return (<>
            <Popover_1.default onClose={function () {
            close();
            onCanceled.current();
        }} isVisible={isVisible} anchorRef={popoverRef} 
    // eslint-disable-next-line react-compiler/react-compiler
    onModalHide={function () { var _a; return (_a = onModalHide.current) === null || _a === void 0 ? void 0 : _a.call(onModalHide); }}>
                <react_native_1.View style={!shouldUseNarrowLayout && styles.createMenuContainer}>
                    {menuItemData.map(function (item, menuIndex) { return (<MenuItem_1.default key={item.textTranslationKey} icon={item.icon} title={translate(item.textTranslationKey)} onPress={function () { return selectItem(item); }} focused={focusedIndex === menuIndex} wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === menuIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}/>); })}
                </react_native_1.View>
            </Popover_1.default>
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            {renderChildren()}
        </>);
}
AttachmentPicker.displayName = 'AttachmentPicker';
exports.default = AttachmentPicker;
