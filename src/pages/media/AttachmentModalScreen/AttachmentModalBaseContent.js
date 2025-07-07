"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var AttachmentCarousel_1 = require("@components/Attachments/AttachmentCarousel");
var AttachmentCarouselPagerContext_1 = require("@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext");
var AttachmentView_1 = require("@components/Attachments/AttachmentView");
var useAttachmentErrors_1 = require("@components/Attachments/AttachmentView/useAttachmentErrors");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderGap_1 = require("@components/HeaderGap");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var SafeAreaConsumer_1 = require("@components/SafeAreaConsumer");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var fileDownload_1 = require("@libs/fileDownload");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var variables_1 = require("@styles/variables");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var viewRef_1 = require("@src/types/utils/viewRef");
function AttachmentModalBaseContent(_a) {
    var _b;
    var _c = _a.source, source = _c === void 0 ? '' : _c, attachmentID = _a.attachmentID, fallbackSource = _a.fallbackSource, fileProp = _a.file, _d = _a.originalFileName, originalFileName = _d === void 0 ? '' : _d, _e = _a.isAuthTokenRequired, isAuthTokenRequired = _e === void 0 ? false : _e, _f = _a.maybeIcon, maybeIcon = _f === void 0 ? false : _f, headerTitleProp = _a.headerTitle, type = _a.type, draftTransactionID = _a.draftTransactionID, iouAction = _a.iouAction, iouTypeProp = _a.iouType, accountID = _a.accountID, _g = _a.attachmentLink, attachmentLink = _g === void 0 ? '' : _g, _h = _a.allowDownload, allowDownload = _h === void 0 ? false : _h, _j = _a.isTrackExpenseAction, isTrackExpenseAction = _j === void 0 ? false : _j, report = _a.report, reportID = _a.reportID, _k = _a.isReceiptAttachment, isReceiptAttachment = _k === void 0 ? false : _k, _l = _a.isWorkspaceAvatar, isWorkspaceAvatar = _l === void 0 ? false : _l, _m = _a.canEditReceipt, canEditReceipt = _m === void 0 ? false : _m, _o = _a.canDeleteReceipt, canDeleteReceipt = _o === void 0 ? false : _o, _p = _a.isLoading, isLoading = _p === void 0 ? false : _p, _q = _a.shouldShowNotFoundPage, shouldShowNotFoundPage = _q === void 0 ? false : _q, _r = _a.shouldDisableSendButton, shouldDisableSendButton = _r === void 0 ? false : _r, _s = _a.shouldDisplayHelpButton, shouldDisplayHelpButton = _s === void 0 ? true : _s, _t = _a.isDeleteReceiptConfirmModalVisible, isDeleteReceiptConfirmModalVisible = _t === void 0 ? false : _t, _u = _a.isAttachmentInvalid, isAttachmentInvalid = _u === void 0 ? false : _u, attachmentInvalidReason = _a.attachmentInvalidReason, attachmentInvalidReasonTitle = _a.attachmentInvalidReasonTitle, submitRef = _a.submitRef, onClose = _a.onClose, onConfirm = _a.onConfirm, onConfirmModalClose = _a.onConfirmModalClose, onRequestDeleteReceipt = _a.onRequestDeleteReceipt, onDeleteReceipt = _a.onDeleteReceipt, _v = _a.onCarouselAttachmentChange, onCarouselAttachmentChange = _v === void 0 ? function () { } : _v, onValidateFile = _a.onValidateFile;
    var styles = (0, useThemeStyles_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    // This logic is used to ensure that the source is updated when the source changes and
    // that the initially provided source is always used as a fallback.
    var _w = (0, react_1.useState)(function () { return source; }), sourceState = _w[0], setSourceState = _w[1];
    var sourceForAttachmentView = sourceState || source;
    (0, react_1.useEffect)(function () {
        setSourceState(function () { return source; });
    }, [source]);
    var _x = (0, react_1.useState)(isAuthTokenRequired), isAuthTokenRequiredState = _x[0], setIsAuthTokenRequiredState = _x[1];
    (0, react_1.useEffect)(function () {
        setIsAuthTokenRequiredState(isAuthTokenRequired);
    }, [isAuthTokenRequired]);
    var _y = (0, react_1.useState)(false), isConfirmButtonDisabled = _y[0], setIsConfirmButtonDisabled = _y[1];
    var _z = react_1.default.useState(true), isDownloadButtonReadyToBeShown = _z[0], setIsDownloadButtonReadyToBeShown = _z[1];
    var iouType = (0, react_1.useMemo)(function () { return iouTypeProp !== null && iouTypeProp !== void 0 ? iouTypeProp : (isTrackExpenseAction ? CONST_1.default.IOU.TYPE.TRACK : CONST_1.default.IOU.TYPE.SUBMIT); }, [isTrackExpenseAction, iouTypeProp]);
    var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(report === null || report === void 0 ? void 0 : report.parentReportID, report === null || report === void 0 ? void 0 : report.parentReportActionID);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var transactionID = ((0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction) && ((_b = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID)) || CONST_1.default.DEFAULT_NUMBER_ID;
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var _0 = (0, react_1.useState)(attachmentLink), currentAttachmentLink = _0[0], setCurrentAttachmentLink = _0[1];
    var _1 = (0, useAttachmentErrors_1.default)(), setAttachmentError = _1.setAttachmentError, isErrorInAttachment = _1.isErrorInAttachment, clearAttachmentErrors = _1.clearAttachmentErrors;
    (0, react_1.useEffect)(function () {
        return function () {
            clearAttachmentErrors();
        };
    }, [clearAttachmentErrors]);
    var fallbackFile = (0, react_1.useMemo)(function () { return (originalFileName ? { name: originalFileName } : undefined); }, [originalFileName]);
    var _2 = (0, react_1.useState)(function () { return fileProp !== null && fileProp !== void 0 ? fileProp : fallbackFile; }), file = _2[0], setFile = _2[1];
    (0, react_1.useEffect)(function () {
        if (!fileProp) {
            return;
        }
        if (onValidateFile) {
            onValidateFile === null || onValidateFile === void 0 ? void 0 : onValidateFile(fileProp, setFile);
        }
        else {
            setFile(fileProp !== null && fileProp !== void 0 ? fileProp : fallbackFile);
        }
    }, [fileProp, fallbackFile, onValidateFile]);
    (0, react_1.useEffect)(function () {
        setFile(fallbackFile);
    }, [fallbackFile]);
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isLocalSource = typeof sourceState === 'string' && /^file:|^blob:/.test(sourceState);
    /**
     * Keeps the attachment source in sync with the attachment displayed currently in the carousel.
     */
    var onNavigate = (0, react_1.useCallback)(function (attachment) {
        var _a, _b;
        setSourceState(attachment.source);
        setFile(attachment.file);
        setIsAuthTokenRequiredState((_a = attachment.isAuthTokenRequired) !== null && _a !== void 0 ? _a : false);
        onCarouselAttachmentChange(attachment);
        setCurrentAttachmentLink((_b = attachment === null || attachment === void 0 ? void 0 : attachment.attachmentLink) !== null && _b !== void 0 ? _b : '');
    }, [onCarouselAttachmentChange]);
    var setDownloadButtonVisibility = (0, react_1.useCallback)(function (isButtonVisible) {
        if (isDownloadButtonReadyToBeShown === isButtonVisible) {
            return;
        }
        setIsDownloadButtonReadyToBeShown(isButtonVisible);
    }, [isDownloadButtonReadyToBeShown]);
    /**
     * Download the currently viewed attachment.
     */
    var downloadAttachment = (0, react_1.useCallback)(function () {
        var sourceURL = sourceState;
        if (isAuthTokenRequiredState && typeof sourceURL === 'string') {
            sourceURL = (0, addEncryptedAuthTokenToURL_1.default)(sourceURL);
        }
        if (typeof sourceURL === 'string') {
            var fileName = type === CONST_1.default.ATTACHMENT_TYPE.SEARCH ? (0, FileUtils_1.getFileName)("".concat(sourceURL)) : file === null || file === void 0 ? void 0 : file.name;
            (0, fileDownload_1.default)(sourceURL, fileName !== null && fileName !== void 0 ? fileName : '', undefined, undefined, undefined, undefined, undefined, !draftTransactionID);
        }
        // At ios, if the keyboard is open while opening the attachment, then after downloading
        // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
        react_native_1.Keyboard.dismiss();
    }, [sourceState, isAuthTokenRequiredState, type, file === null || file === void 0 ? void 0 : file.name, draftTransactionID]);
    /**
     * Execute the onConfirm callback and close the modal.
     */
    var submitAndClose = (0, react_1.useCallback)(function () {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (isConfirmButtonDisabled) {
            return;
        }
        if (onConfirm) {
            onConfirm(Object.assign(file !== null && file !== void 0 ? file : {}, { source: sourceState }));
        }
        onClose === null || onClose === void 0 ? void 0 : onClose();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isConfirmButtonDisabled, onConfirm, file, sourceState]);
    /**
     * Detach the receipt and close the modal.
     */
    var deleteAndCloseModal = (0, react_1.useCallback)(function () {
        (0, IOU_1.detachReceipt)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
        onDeleteReceipt === null || onDeleteReceipt === void 0 ? void 0 : onDeleteReceipt();
        onClose === null || onClose === void 0 ? void 0 : onClose();
    }, [onClose, onDeleteReceipt, transaction === null || transaction === void 0 ? void 0 : transaction.transactionID]);
    // Close the modal when the escape key is pressed
    (0, react_1.useEffect)(function () {
        var shortcutConfig = CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE;
        var unsubscribeEscapeKey = KeyboardShortcut_1.default.subscribe(shortcutConfig.shortcutKey, function () {
            onClose === null || onClose === void 0 ? void 0 : onClose();
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true, true);
        return unsubscribeEscapeKey;
    }, [onClose]);
    var threeDotsMenuItems = (0, react_1.useMemo)(function () {
        if (!isReceiptAttachment) {
            return [];
        }
        var menuItems = [];
        if (canEditReceipt) {
            menuItems.push({
                icon: Expensicons.Camera,
                text: translate('common.replace'),
                onSelected: function () {
                    var goToScanScreen = function () {
                        react_native_1.InteractionManager.runAfterInteractions(function () {
                            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(iouAction !== null && iouAction !== void 0 ? iouAction : CONST_1.default.IOU.ACTION.EDIT, iouType, draftTransactionID !== null && draftTransactionID !== void 0 ? draftTransactionID : transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, report === null || report === void 0 ? void 0 : report.reportID, Navigation_1.default.getActiveRoute()));
                        });
                    };
                    onClose === null || onClose === void 0 ? void 0 : onClose({ shouldCallDirectly: true, onAfterClose: goToScanScreen });
                },
            });
        }
        if ((!isOffline && allowDownload && !isLocalSource) || !!draftTransactionID) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: function () { return downloadAttachment(); },
            });
        }
        var hasOnlyEReceipt = (0, TransactionUtils_1.hasEReceipt)(transaction) && !(0, TransactionUtils_1.hasReceiptSource)(transaction);
        if (!hasOnlyEReceipt && (0, TransactionUtils_1.hasReceipt)(transaction) && !(0, TransactionUtils_1.isReceiptBeingScanned)(transaction) && canDeleteReceipt && !(0, TransactionUtils_1.hasMissingSmartscanFields)(transaction)) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('receipt.deleteReceipt'),
                onSelected: onRequestDeleteReceipt,
                shouldCallAfterModalHide: true,
            });
        }
        return menuItems;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isReceiptAttachment, transaction, file, sourceState, iouType]);
    // There are a few things that shouldn't be set until we absolutely know if the file is a receipt or an attachment.
    // props.isReceiptAttachment will be null until its certain what the file is, in which case it will then be true|false.
    var headerTitle = (0, react_1.useMemo)(function () { return headerTitleProp !== null && headerTitleProp !== void 0 ? headerTitleProp : translate(isReceiptAttachment ? 'common.receipt' : 'common.attachment'); }, [headerTitleProp, isReceiptAttachment, translate]);
    var shouldShowThreeDotsButton = (0, react_1.useMemo)(function () { return isReceiptAttachment && threeDotsMenuItems.length !== 0; }, [isReceiptAttachment, threeDotsMenuItems.length]);
    var shouldShowDownloadButton = (0, react_1.useMemo)(function () {
        if ((!(0, EmptyObject_1.isEmptyObject)(report) || type === CONST_1.default.ATTACHMENT_TYPE.SEARCH) && !isErrorInAttachment(sourceState)) {
            return allowDownload && isDownloadButtonReadyToBeShown && !shouldShowNotFoundPage && !isReceiptAttachment && !isOffline && !isLocalSource;
        }
        return false;
    }, [allowDownload, isDownloadButtonReadyToBeShown, isErrorInAttachment, isLocalSource, isOffline, isReceiptAttachment, report, shouldShowNotFoundPage, sourceState, type]);
    var isPDFLoadError = (0, react_1.useRef)(false);
    var onPdfLoadError = (0, react_1.useCallback)(function () {
        isPDFLoadError.current = true;
        onClose === null || onClose === void 0 ? void 0 : onClose();
    }, [isPDFLoadError, onClose]);
    var onInvalidReasonModalHide = (0, react_1.useCallback)(function () {
        if (!isPDFLoadError.current) {
            return;
        }
        isPDFLoadError.current = false;
    }, [isPDFLoadError]);
    // We need to pass a shared value of type boolean to the context, so `falseSV` acts as a default value.
    var falseSV = (0, react_native_reanimated_1.useSharedValue)(false);
    var context = (0, react_1.useMemo)(function () { return ({
        pagerItems: [{ source: sourceForAttachmentView, index: 0, isActive: true }],
        activePage: 0,
        pagerRef: undefined,
        isPagerScrolling: falseSV,
        isScrollEnabled: falseSV,
        onTap: function () { },
        onScaleChanged: function () { },
        onSwipeDown: onClose,
        onAttachmentError: setAttachmentError,
    }); }, [onClose, falseSV, sourceForAttachmentView, setAttachmentError]);
    return (<>
            <react_native_gesture_handler_1.GestureHandlerRootView style={styles.flex1}>
                {shouldUseNarrowLayout && <HeaderGap_1.default />}
                <HeaderWithBackButton_1.default shouldMinimizeMenuButton title={headerTitle} shouldShowBorderBottom shouldShowDownloadButton={shouldShowDownloadButton} shouldDisplayHelpButton={shouldDisplayHelpButton} onDownloadButtonPress={function () { return downloadAttachment(); }} shouldShowCloseButton={!shouldUseNarrowLayout} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={onClose} onCloseButtonPress={onClose} shouldShowThreeDotsButton={shouldShowThreeDotsButton} threeDotsAnchorPosition={styles.threeDotsPopoverOffsetAttachmentModal(windowWidth)} threeDotsAnchorAlignment={{
            horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }} shouldSetModalVisibility={false} threeDotsMenuItems={threeDotsMenuItems} shouldOverlayDots subTitleLink={currentAttachmentLink !== null && currentAttachmentLink !== void 0 ? currentAttachmentLink : ''}/>
                <react_native_1.View style={styles.imageModalImageCenterContainer}>
                    {isLoading && <FullscreenLoadingIndicator_1.default testID="attachment-loading-spinner"/>}
                    {shouldShowNotFoundPage && !isLoading && (<BlockingView_1.default icon={Illustrations.ToddBehindCloud} iconWidth={variables_1.default.modalTopIconWidth} iconHeight={variables_1.default.modalTopIconHeight} title={translate('notFound.notHere')} subtitle={translate('notFound.pageNotFound')} linkKey="notFound.goBackHome" shouldShowLink onLinkPress={onClose}/>)}
                    {!shouldShowNotFoundPage &&
            !isLoading &&
            // We shouldn't show carousel arrow in search result attachment
            (!(0, EmptyObject_1.isEmptyObject)(report) && !isReceiptAttachment && type !== CONST_1.default.ATTACHMENT_TYPE.SEARCH ? (<AttachmentCarousel_1.default accountID={accountID} type={type} attachmentID={attachmentID} report={report} onNavigate={onNavigate} onClose={onClose} source={source} setDownloadButtonVisibility={setDownloadButtonVisibility} attachmentLink={currentAttachmentLink} onAttachmentError={setAttachmentError}/>) : (!!sourceForAttachmentView && (<AttachmentCarouselPagerContext_1.default.Provider value={context}>
                                    <AttachmentView_1.default containerStyles={[styles.mh5]} source={sourceForAttachmentView} isAuthTokenRequired={isAuthTokenRequiredState} file={file} onToggleKeyboard={setIsConfirmButtonDisabled} onPDFLoadError={function () { return onPdfLoadError === null || onPdfLoadError === void 0 ? void 0 : onPdfLoadError(); }} isWorkspaceAvatar={isWorkspaceAvatar} maybeIcon={maybeIcon} fallbackSource={fallbackSource} isUsedInAttachmentModal transactionID={transaction === null || transaction === void 0 ? void 0 : transaction.transactionID} isUploaded={!(0, EmptyObject_1.isEmptyObject)(report)} reportID={reportID !== null && reportID !== void 0 ? reportID : (!(0, EmptyObject_1.isEmptyObject)(report) ? report.reportID : undefined)}/>
                                </AttachmentCarouselPagerContext_1.default.Provider>)))}
                </react_native_1.View>
                {/* If we have an onConfirm method show a confirmation button */}
                {!!onConfirm && !isConfirmButtonDisabled && (<react_native_reanimated_1.LayoutAnimationConfig skipEntering>
                        {!!onConfirm && !isConfirmButtonDisabled && (<SafeAreaConsumer_1.default>
                                {function (_a) {
                    var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
                    return (<react_native_reanimated_1.default.View style={safeAreaPaddingBottomStyle} entering={react_native_reanimated_1.FadeIn}>
                                        <Button_1.default ref={submitRef ? (0, viewRef_1.default)(submitRef) : undefined} success large style={[styles.buttonConfirm, shouldUseNarrowLayout ? {} : styles.attachmentButtonBigScreen]} textStyles={[styles.buttonConfirmText]} text={translate('common.send')} onPress={submitAndClose} isDisabled={isConfirmButtonDisabled || shouldDisableSendButton} pressOnEnter/>
                                    </react_native_reanimated_1.default.View>);
                }}
                            </SafeAreaConsumer_1.default>)}
                    </react_native_reanimated_1.LayoutAnimationConfig>)}
                {isReceiptAttachment && (<ConfirmModal_1.default title={translate('receipt.deleteReceipt')} isVisible={isDeleteReceiptConfirmModalVisible} onConfirm={deleteAndCloseModal} onCancel={onConfirmModalClose} prompt={translate('receipt.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>)}
            </react_native_gesture_handler_1.GestureHandlerRootView>
            {!isReceiptAttachment && (<ConfirmModal_1.default title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''} onConfirm={function () { return onConfirmModalClose === null || onConfirmModalClose === void 0 ? void 0 : onConfirmModalClose(); }} onCancel={onConfirmModalClose} isVisible={isAttachmentInvalid} prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''} confirmText={translate('common.close')} shouldShowCancelButton={false} onModalHide={onInvalidReasonModalHide}/>)}
        </>);
}
AttachmentModalBaseContent.displayName = 'AttachmentModalBaseContent';
exports.default = (0, react_1.memo)(AttachmentModalBaseContent);
