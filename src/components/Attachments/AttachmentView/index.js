"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsFileImage = checkIsFileImage;
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AttachmentCarouselPagerContext_1 = require("@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext");
var DistanceEReceipt_1 = require("@components/DistanceEReceipt");
var EReceipt_1 = require("@components/EReceipt");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var PerDiemEReceipt_1 = require("@components/PerDiemEReceipt");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var useFirstRenderRoute_1 = require("@hooks/useFirstRenderRoute");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CachedPDFPaths_1 = require("@libs/actions/CachedPDFPaths");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AttachmentViewImage_1 = require("./AttachmentViewImage");
var AttachmentViewPdf_1 = require("./AttachmentViewPdf");
var AttachmentViewVideo_1 = require("./AttachmentViewVideo");
var DefaultAttachmentView_1 = require("./DefaultAttachmentView");
var HighResolutionInfo_1 = require("./HighResolutionInfo");
function checkIsFileImage(source, fileName) {
    var isSourceImage = typeof source === 'number' || (typeof source === 'string' && expensify_common_1.Str.isImage(source));
    var isFileNameImage = fileName && expensify_common_1.Str.isImage(fileName);
    return isSourceImage || isFileNameImage;
}
function AttachmentView(_a) {
    var _b, _c, _d;
    var source = _a.source, previewSource = _a.previewSource, file = _a.file, isAuthTokenRequired = _a.isAuthTokenRequired, onPress = _a.onPress, shouldShowLoadingSpinnerIcon = _a.shouldShowLoadingSpinnerIcon, shouldShowDownloadIcon = _a.shouldShowDownloadIcon, containerStyles = _a.containerStyles, onToggleKeyboard = _a.onToggleKeyboard, _e = _a.onPDFLoadError, onPDFLoadErrorProp = _e === void 0 ? function () { } : _e, isFocused = _a.isFocused, isUsedInAttachmentModal = _a.isUsedInAttachmentModal, isWorkspaceAvatar = _a.isWorkspaceAvatar, maybeIcon = _a.maybeIcon, fallbackSource = _a.fallbackSource, _f = _a.transactionID, transactionID = _f === void 0 ? '-1' : _f, reportActionID = _a.reportActionID, isHovered = _a.isHovered, duration = _a.duration, isUsedAsChatAttachment = _a.isUsedAsChatAttachment, _g = _a.isUploaded, isUploaded = _g === void 0 ? true : _g, isDeleted = _a.isDeleted, _h = _a.isUploading, isUploading = _h === void 0 ? false : _h, reportID = _a.reportID;
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var updateCurrentURLAndReportID = (0, PlaybackContext_1.usePlaybackContext)().updateCurrentURLAndReportID;
    var attachmentCarouselPagerContext = (0, react_1.useContext)(AttachmentCarouselPagerContext_1.default);
    var onAttachmentError = (attachmentCarouselPagerContext !== null && attachmentCarouselPagerContext !== void 0 ? attachmentCarouselPagerContext : {}).onAttachmentError;
    var theme = (0, useTheme_1.default)();
    var safeAreaPaddingBottomStyle = (0, useSafeAreaPaddings_1.default)().safeAreaPaddingBottomStyle;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _j = (0, react_1.useState)(false), loadComplete = _j[0], setLoadComplete = _j[1];
    var _k = (0, react_1.useState)(false), isHighResolution = _k[0], setIsHighResolution = _k[1];
    var _l = (0, react_1.useState)(false), hasPDFFailedToLoad = _l[0], setHasPDFFailedToLoad = _l[1];
    var isVideo = (typeof source === 'string' && expensify_common_1.Str.isVideo(source)) || ((file === null || file === void 0 ? void 0 : file.name) && expensify_common_1.Str.isVideo(file.name));
    var firstRenderRoute = (0, useFirstRenderRoute_1.default)();
    var isInFocusedModal = firstRenderRoute.isFocused && isFocused === undefined;
    (0, react_1.useEffect)(function () {
        if (!isFocused && !isInFocusedModal && !(file && isUsedInAttachmentModal)) {
            return;
        }
        updateCurrentURLAndReportID(isVideo && typeof source === 'string' ? source : undefined, reportID);
    }, [file, isFocused, isInFocusedModal, isUsedInAttachmentModal, isVideo, reportID, source, updateCurrentURLAndReportID]);
    var _m = (0, react_1.useState)(false), imageError = _m[0], setImageError = _m[1];
    var isOffline = (0, useNetwork_1.default)({ onReconnect: function () { return setImageError(false); } }).isOffline;
    (0, react_1.useEffect)(function () {
        (0, FileUtils_1.getFileResolution)(file).then(function (resolution) {
            setIsHighResolution((0, FileUtils_1.isHighResolutionImage)(resolution));
        });
    }, [file]);
    (0, react_1.useEffect)(function () {
        var isImageSource = typeof source !== 'function' && !!checkIsFileImage(source, file === null || file === void 0 ? void 0 : file.name);
        var isErrorInImage = imageError && (typeof fallbackSource === 'number' || typeof fallbackSource === 'function');
        onAttachmentError === null || onAttachmentError === void 0 ? void 0 : onAttachmentError(source, isErrorInImage && isImageSource);
    }, [fallbackSource, file === null || file === void 0 ? void 0 : file.name, imageError, onAttachmentError, source]);
    // Handles case where source is a component (ex: SVG) or a number
    // Number may represent a SVG or an image
    if (typeof source === 'function' || (maybeIcon && typeof source === 'number')) {
        var iconFillColor = '';
        var additionalStyles = [];
        if (isWorkspaceAvatar && file) {
            var defaultWorkspaceAvatarColor = StyleUtils.getDefaultWorkspaceAvatarColor((_b = file.name) !== null && _b !== void 0 ? _b : '');
            iconFillColor = defaultWorkspaceAvatarColor.fill;
            additionalStyles = [defaultWorkspaceAvatarColor];
        }
        return (<Icon_1.default src={source} height={variables_1.default.defaultAvatarPreviewSize} width={variables_1.default.defaultAvatarPreviewSize} fill={iconFillColor} additionalStyles={additionalStyles} enableMultiGestureCanvas/>);
    }
    if ((0, TransactionUtils_1.isPerDiemRequest)(transaction) && transaction && !(0, TransactionUtils_1.hasReceiptSource)(transaction)) {
        return <PerDiemEReceipt_1.default transactionID={transaction.transactionID}/>;
    }
    if (transaction && !(0, TransactionUtils_1.hasReceiptSource)(transaction) && (0, TransactionUtils_1.hasEReceipt)(transaction)) {
        return (<react_native_1.View style={[styles.flex1, styles.alignItemsCenter]}>
                <ScrollView_1.default style={styles.w100} contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <EReceipt_1.default transactionID={transaction.transactionID}/>
                </ScrollView_1.default>
            </react_native_1.View>);
    }
    // Check both source and file.name since PDFs dragged into the text field
    // will appear with a source that is a blob
    var isSourcePDF = typeof source === 'string' && expensify_common_1.Str.isPDF(source);
    var isFilePDF = file && expensify_common_1.Str.isPDF((_c = file.name) !== null && _c !== void 0 ? _c : translate('attachmentView.unknownFilename'));
    if (!hasPDFFailedToLoad && !isUploading && (isSourcePDF || isFilePDF)) {
        var encryptedSourceUrl = isAuthTokenRequired ? (0, addEncryptedAuthTokenToURL_1.default)(source) : source;
        var onPDFLoadComplete = function (path) {
            var _a;
            var id = (_a = (transaction && transaction.transactionID)) !== null && _a !== void 0 ? _a : reportActionID;
            if (path && id) {
                (0, CachedPDFPaths_1.add)(id, path);
            }
            if (!loadComplete) {
                setLoadComplete(true);
            }
        };
        var onPDFLoadError = function () {
            setHasPDFFailedToLoad(true);
            onPDFLoadErrorProp();
        };
        // We need the following View component on android native
        // So that the event will propagate properly and
        // the Password protected preview will be shown for pdf attachment we are about to send.
        return (<react_native_1.View style={[styles.flex1, styles.attachmentCarouselContainer]}>
                <AttachmentViewPdf_1.default file={file} isFocused={isFocused} encryptedSourceUrl={encryptedSourceUrl} onPress={onPress} onToggleKeyboard={onToggleKeyboard} onLoadComplete={onPDFLoadComplete} style={isUsedInAttachmentModal ? styles.imageModalPDF : styles.flex1} isUsedAsChatAttachment={isUsedAsChatAttachment} onLoadError={onPDFLoadError}/>
            </react_native_1.View>);
    }
    if ((0, TransactionUtils_1.isDistanceRequest)(transaction) && transaction) {
        return <DistanceEReceipt_1.default transaction={transaction}/>;
    }
    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the text field.
    // We also check for numeric source since this is how static images (used for preview) are represented in RN.
    // isLocalSource checks if the source is blob as that's the type of the temp image coming from mobile web
    var isFileImage = checkIsFileImage(source, file === null || file === void 0 ? void 0 : file.name);
    var isLocalSourceImage = typeof source === 'string' && source.startsWith('blob:');
    var isImage = isFileImage !== null && isFileImage !== void 0 ? isFileImage : isLocalSourceImage;
    if (isImage) {
        if (imageError && (typeof fallbackSource === 'number' || typeof fallbackSource === 'function')) {
            return (<react_native_1.View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon_1.default src={fallbackSource} width={variables_1.default.iconSizeSuperLarge} height={variables_1.default.iconSizeSuperLarge} fill={theme.icon}/>
                    <react_native_1.View>
                        <Text_1.default style={[styles.notFoundTextHeader]}>{translate('attachmentView.attachmentNotFound')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>);
        }
        var imageSource = imageError && fallbackSource ? fallbackSource : source;
        if (isHighResolution) {
            if (!isUploaded) {
                return (<>
                        <react_native_1.View style={styles.imageModalImageCenterContainer}>
                            <DefaultAttachmentView_1.default icon={Expensicons_1.Gallery} fileName={file === null || file === void 0 ? void 0 : file.name} shouldShowDownloadIcon={shouldShowDownloadIcon} shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon} containerStyles={containerStyles}/>
                        </react_native_1.View>
                        <HighResolutionInfo_1.default isUploaded={isUploaded}/>
                    </>);
            }
            imageSource = (_d = previewSource === null || previewSource === void 0 ? void 0 : previewSource.toString()) !== null && _d !== void 0 ? _d : imageSource;
        }
        return (<>
                <react_native_1.View style={styles.imageModalImageCenterContainer}>
                    <AttachmentViewImage_1.default url={imageSource} file={file} isAuthTokenRequired={isAuthTokenRequired} loadComplete={loadComplete} isImage={isImage} onPress={onPress} onError={function () {
                if (isOffline) {
                    return;
                }
                setImageError(true);
            }}/>
                </react_native_1.View>
                <react_native_1.View style={safeAreaPaddingBottomStyle}>{isHighResolution && <HighResolutionInfo_1.default isUploaded={isUploaded}/>}</react_native_1.View>
            </>);
    }
    if ((isVideo !== null && isVideo !== void 0 ? isVideo : ((file === null || file === void 0 ? void 0 : file.name) && expensify_common_1.Str.isVideo(file.name))) && typeof source === 'string') {
        return (<AttachmentViewVideo_1.default source={source} shouldUseSharedVideoElement={!CONST_1.default.ATTACHMENT_LOCAL_URL_PREFIX.some(function (prefix) { return source.startsWith(prefix); })} isHovered={isHovered} duration={duration} reportID={reportID}/>);
    }
    return (<DefaultAttachmentView_1.default fileName={file === null || file === void 0 ? void 0 : file.name} shouldShowDownloadIcon={shouldShowDownloadIcon} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon || isUploading} containerStyles={containerStyles} isDeleted={isDeleted} isUploading={isUploading}/>);
}
AttachmentView.displayName = 'AttachmentView';
exports.default = (0, react_1.memo)(AttachmentView);
