"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var AttachmentModalHandler_1 = require("@libs/AttachmentModalHandler");
var fileDownload_1 = require("@libs/fileDownload");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
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
var AttachmentCarousel_1 = require("./Attachments/AttachmentCarousel");
var AttachmentCarouselPagerContext_1 = require("./Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext");
var AttachmentView_1 = require("./Attachments/AttachmentView");
var useAttachmentErrors_1 = require("./Attachments/AttachmentView/useAttachmentErrors");
var BlockingView_1 = require("./BlockingViews/BlockingView");
var Button_1 = require("./Button");
var ConfirmModal_1 = require("./ConfirmModal");
var FullscreenLoadingIndicator_1 = require("./FullscreenLoadingIndicator");
var HeaderGap_1 = require("./HeaderGap");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var Expensicons = require("./Icon/Expensicons");
var Illustrations = require("./Icon/Illustrations");
var Modal_1 = require("./Modal");
var SafeAreaConsumer_1 = require("./SafeAreaConsumer");
function AttachmentModal(_a) {
    var _b;
    var _c = _a.source, source = _c === void 0 ? '' : _c, onConfirm = _a.onConfirm, _d = _a.defaultOpen, defaultOpen = _d === void 0 ? false : _d, _e = _a.originalFileName, originalFileName = _e === void 0 ? '' : _e, _f = _a.isAuthTokenRequired, isAuthTokenRequired = _f === void 0 ? false : _f, _g = _a.allowDownload, allowDownload = _g === void 0 ? false : _g, _h = _a.isTrackExpenseAction, isTrackExpenseAction = _h === void 0 ? false : _h, report = _a.report, reportID = _a.reportID, _j = _a.onModalShow, onModalShow = _j === void 0 ? function () { } : _j, _k = _a.onModalHide, onModalHide = _k === void 0 ? function () { } : _k, _l = _a.onCarouselAttachmentChange, onCarouselAttachmentChange = _l === void 0 ? function () { } : _l, _m = _a.isReceiptAttachment, isReceiptAttachment = _m === void 0 ? false : _m, _o = _a.isWorkspaceAvatar, isWorkspaceAvatar = _o === void 0 ? false : _o, _p = _a.maybeIcon, maybeIcon = _p === void 0 ? false : _p, headerTitle = _a.headerTitle, children = _a.children, fallbackSource = _a.fallbackSource, _q = _a.canEditReceipt, canEditReceipt = _q === void 0 ? false : _q, _r = _a.canDeleteReceipt, canDeleteReceipt = _r === void 0 ? false : _r, _s = _a.onModalClose, onModalClose = _s === void 0 ? function () { } : _s, _t = _a.isLoading, isLoading = _t === void 0 ? false : _t, _u = _a.shouldShowNotFoundPage, shouldShowNotFoundPage = _u === void 0 ? false : _u, _v = _a.type, type = _v === void 0 ? undefined : _v, attachmentID = _a.attachmentID, _w = _a.accountID, accountID = _w === void 0 ? undefined : _w, _x = _a.shouldDisableSendButton, shouldDisableSendButton = _x === void 0 ? false : _x, draftTransactionID = _a.draftTransactionID, iouAction = _a.iouAction, iouTypeProp = _a.iouType, _y = _a.attachmentLink, attachmentLink = _y === void 0 ? '' : _y, shouldHandleNavigationBack = _a.shouldHandleNavigationBack;
    var styles = (0, useThemeStyles_1.default)();
    var _z = (0, react_1.useState)(defaultOpen), isModalOpen = _z[0], setIsModalOpen = _z[1];
    var _0 = (0, react_1.useState)(false), shouldLoadAttachment = _0[0], setShouldLoadAttachment = _0[1];
    var _1 = (0, react_1.useState)(false), isAttachmentInvalid = _1[0], setIsAttachmentInvalid = _1[1];
    var _2 = (0, react_1.useState)(false), isDeleteReceiptConfirmModalVisible = _2[0], setIsDeleteReceiptConfirmModalVisible = _2[1];
    var _3 = (0, react_1.useState)(isAuthTokenRequired), isAuthTokenRequiredState = _3[0], setIsAuthTokenRequiredState = _3[1];
    var _4 = (0, react_1.useState)(null), attachmentInvalidReasonTitle = _4[0], setAttachmentInvalidReasonTitle = _4[1];
    var _5 = (0, react_1.useState)(null), attachmentInvalidReason = _5[0], setAttachmentInvalidReason = _5[1];
    var _6 = (0, react_1.useState)(function () { return source; }), sourceState = _6[0], setSourceState = _6[1];
    var _7 = (0, react_1.useState)(CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE), modalType = _7[0], setModalType = _7[1];
    var _8 = (0, react_1.useState)(false), isConfirmButtonDisabled = _8[0], setIsConfirmButtonDisabled = _8[1];
    var _9 = react_1.default.useState(true), isDownloadButtonReadyToBeShown = _9[0], setIsDownloadButtonReadyToBeShown = _9[1];
    var isPDFLoadError = (0, react_1.useRef)(false);
    var isReplaceReceipt = (0, react_1.useRef)(false);
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var nope = (0, react_native_reanimated_1.useSharedValue)(false);
    var isOverlayModalVisible = (isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!isReceiptAttachment && isAttachmentInvalid);
    var iouType = (0, react_1.useMemo)(function () { return iouTypeProp !== null && iouTypeProp !== void 0 ? iouTypeProp : (isTrackExpenseAction ? CONST_1.default.IOU.TYPE.TRACK : CONST_1.default.IOU.TYPE.SUBMIT); }, [isTrackExpenseAction, iouTypeProp]);
    var parentReportAction = (0, ReportActionsUtils_1.getReportAction)(report === null || report === void 0 ? void 0 : report.parentReportID, report === null || report === void 0 ? void 0 : report.parentReportActionID);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var transactionID = ((0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction) && ((_b = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID)) || CONST_1.default.DEFAULT_NUMBER_ID;
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var _10 = (0, react_1.useState)(attachmentLink), currentAttachmentLink = _10[0], setCurrentAttachmentLink = _10[1];
    var _11 = (0, useAttachmentErrors_1.default)(), setAttachmentError = _11.setAttachmentError, isErrorInAttachment = _11.isErrorInAttachment, clearAttachmentErrors = _11.clearAttachmentErrors;
    var _12 = (0, react_1.useState)(originalFileName
        ? {
            name: originalFileName,
        }
        : undefined), file = _12[0], setFile = _12[1];
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isLocalSource = typeof sourceState === 'string' && /^file:|^blob:/.test(sourceState);
    (0, react_1.useEffect)(function () {
        setFile(originalFileName ? { name: originalFileName } : undefined);
    }, [originalFileName]);
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
    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     */
    var getModalType = (0, react_1.useCallback)(function (sourceURL, fileObject) {
        var _a;
        return sourceURL && (expensify_common_1.Str.isPDF(sourceURL) || (fileObject && expensify_common_1.Str.isPDF((_a = fileObject.name) !== null && _a !== void 0 ? _a : translate('attachmentView.unknownFilename'))))
            ? CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
            : CONST_1.default.MODAL.MODAL_TYPE.CENTERED;
    }, [translate]);
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
    }, [isAuthTokenRequiredState, sourceState, file, type, draftTransactionID]);
    /**
     * Execute the onConfirm callback and close the modal.
     */
    var submitAndClose = (0, react_1.useCallback)(function () {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (!isModalOpen || isConfirmButtonDisabled) {
            return;
        }
        if (onConfirm) {
            onConfirm(Object.assign(file !== null && file !== void 0 ? file : {}, { source: sourceState }));
        }
        setIsModalOpen(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isModalOpen, isConfirmButtonDisabled, onConfirm, file, sourceState]);
    /**
     * Close the confirm modals.
     */
    var closeConfirmModal = (0, react_1.useCallback)(function () {
        setIsAttachmentInvalid(false);
        setIsDeleteReceiptConfirmModalVisible(false);
    }, []);
    /**
     * Detach the receipt and close the modal.
     */
    var deleteAndCloseModal = (0, react_1.useCallback)(function () {
        (0, IOU_1.detachReceipt)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
        setIsDeleteReceiptConfirmModalVisible(false);
        Navigation_1.default.goBack();
    }, [transaction]);
    var isValidFile = (0, react_1.useCallback)(function (fileObject) {
        return (0, FileUtils_1.validateImageForCorruption)(fileObject)
            .then(function () {
            if (fileObject.size && fileObject.size > CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setIsAttachmentInvalid(true);
                setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooLarge');
                setAttachmentInvalidReason('attachmentPicker.sizeExceeded');
                return false;
            }
            if (fileObject.size && fileObject.size < CONST_1.default.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                setIsAttachmentInvalid(true);
                setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooSmall');
                setAttachmentInvalidReason('attachmentPicker.sizeNotMet');
                return false;
            }
            return true;
        })
            .catch(function () {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
            setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
            return false;
        });
    }, []);
    var isDirectoryCheck = (0, react_1.useCallback)(function (data) {
        var _a;
        if ('webkitGetAsEntry' in data && ((_a = data.webkitGetAsEntry()) === null || _a === void 0 ? void 0 : _a.isDirectory)) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
            setAttachmentInvalidReason('attachmentPicker.folderNotAllowedMessage');
            return false;
        }
        return true;
    }, []);
    var validateAndDisplayFileToUpload = (0, react_1.useCallback)(function (data) {
        if (!data || !isDirectoryCheck(data)) {
            return;
        }
        var fileObject = data;
        if ('getAsFile' in data && typeof data.getAsFile === 'function') {
            fileObject = data.getAsFile();
        }
        if (!fileObject) {
            return;
        }
        isValidFile(fileObject).then(function (isValid) {
            if (!isValid) {
                return;
            }
            if (fileObject instanceof File) {
                /**
                 * Cleaning file name, done here so that it covers all cases:
                 * upload, drag and drop, copy-paste
                 */
                var updatedFile = fileObject;
                var cleanName = (0, FileUtils_1.cleanFileName)(updatedFile.name);
                if (updatedFile.name !== cleanName) {
                    updatedFile = new File([updatedFile], cleanName, { type: updatedFile.type });
                }
                var inputSource = URL.createObjectURL(updatedFile);
                updatedFile.uri = inputSource;
                var inputModalType = getModalType(inputSource, updatedFile);
                setIsModalOpen(true);
                setSourceState(inputSource);
                setFile(updatedFile);
                setModalType(inputModalType);
            }
            else if (fileObject.uri) {
                var inputModalType = getModalType(fileObject.uri, fileObject);
                setIsModalOpen(true);
                setSourceState(fileObject.uri);
                setFile(fileObject);
                setModalType(inputModalType);
            }
        });
    }, [isValidFile, getModalType, isDirectoryCheck]);
    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    var closeModal = (0, react_1.useCallback)(function (shouldCallDirectly) {
        setIsModalOpen(false);
        if (typeof onModalClose === 'function') {
            if (shouldCallDirectly) {
                onModalClose();
                return;
            }
            AttachmentModalHandler_1.default.handleModalClose(onModalClose);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [onModalClose]);
    /**
     *  open the modal
     */
    var openModal = (0, react_1.useCallback)(function () {
        setIsModalOpen(true);
    }, []);
    (0, react_1.useEffect)(function () {
        setSourceState(function () { return source; });
    }, [source]);
    (0, react_1.useEffect)(function () {
        setIsAuthTokenRequiredState(isAuthTokenRequired);
    }, [isAuthTokenRequired]);
    var sourceForAttachmentView = sourceState || source;
    var threeDotsMenuItems = (0, react_1.useMemo)(function () {
        if (!isReceiptAttachment) {
            return [];
        }
        var menuItems = [];
        if (canEditReceipt) {
            // linter keep complain about accessing ref during render
            // eslint-disable-next-line react-compiler/react-compiler
            menuItems.push({
                icon: Expensicons.Camera,
                text: translate('common.replace'),
                onSelected: function () {
                    closeModal(true);
                    // Set the ref to true, so when the modal is hidden, we will navigate to the scan receipt screen
                    isReplaceReceipt.current = true;
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
                onSelected: function () {
                    setIsDeleteReceiptConfirmModalVisible(true);
                },
                shouldCallAfterModalHide: true,
            });
        }
        return menuItems;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isReceiptAttachment, transaction, file, sourceState, iouType]);
    var headerTitleNew = headerTitle !== null && headerTitle !== void 0 ? headerTitle : translate(isReceiptAttachment ? 'common.receipt' : 'common.attachment');
    var shouldShowThreeDotsButton = isReceiptAttachment && isModalOpen && threeDotsMenuItems.length !== 0;
    var shouldShowDownloadButton = false;
    if ((!(0, EmptyObject_1.isEmptyObject)(report) || type === CONST_1.default.ATTACHMENT_TYPE.SEARCH) && !isErrorInAttachment(sourceState)) {
        shouldShowDownloadButton = allowDownload && isDownloadButtonReadyToBeShown && !shouldShowNotFoundPage && !isReceiptAttachment && !isOffline && !isLocalSource;
    }
    var context = (0, react_1.useMemo)(function () { return ({
        pagerItems: [{ source: sourceForAttachmentView, index: 0, isActive: true }],
        activePage: 0,
        pagerRef: undefined,
        isPagerScrolling: nope,
        isScrollEnabled: nope,
        onTap: function () { },
        onScaleChanged: function () { },
        onSwipeDown: closeModal,
        onAttachmentError: setAttachmentError,
    }); }, [closeModal, setAttachmentError, nope, sourceForAttachmentView]);
    var submitRef = (0, react_1.useRef)(null);
    return (<>
            <Modal_1.default type={modalType} onClose={isOverlayModalVisible ? closeConfirmModal : closeModal} isVisible={isModalOpen} onModalShow={function () {
            onModalShow();
            setShouldLoadAttachment(true);
        }} onModalHide={function () {
            if (!isPDFLoadError.current) {
                onModalHide();
            }
            setShouldLoadAttachment(false);
            clearAttachmentErrors();
            if (isPDFLoadError.current) {
                setIsAttachmentInvalid(true);
                setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
                setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
                return;
            }
            if (isReplaceReceipt.current) {
                react_native_1.InteractionManager.runAfterInteractions(function () {
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SCAN.getRoute(iouAction !== null && iouAction !== void 0 ? iouAction : CONST_1.default.IOU.ACTION.EDIT, iouType, draftTransactionID !== null && draftTransactionID !== void 0 ? draftTransactionID : transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, report === null || report === void 0 ? void 0 : report.reportID, Navigation_1.default.getActiveRoute()));
                });
            }
        }} propagateSwipe initialFocus={function () {
            if (!submitRef.current) {
                return false;
            }
            return submitRef.current;
        }} shouldHandleNavigationBack={shouldHandleNavigationBack}>
                <react_native_gesture_handler_1.GestureHandlerRootView style={styles.flex1}>
                    {shouldUseNarrowLayout && <HeaderGap_1.default />}
                    <HeaderWithBackButton_1.default shouldMinimizeMenuButton title={headerTitleNew} shouldShowBorderBottom shouldShowDownloadButton={shouldShowDownloadButton} onDownloadButtonPress={function () { return downloadAttachment(); }} shouldShowCloseButton={!shouldUseNarrowLayout} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={closeModal} onCloseButtonPress={closeModal} shouldShowThreeDotsButton={shouldShowThreeDotsButton} threeDotsAnchorPosition={styles.threeDotsPopoverOffsetAttachmentModal(windowWidth)} threeDotsAnchorAlignment={{
            horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }} shouldSetModalVisibility={false} threeDotsMenuItems={threeDotsMenuItems} shouldOverlayDots subTitleLink={currentAttachmentLink !== null && currentAttachmentLink !== void 0 ? currentAttachmentLink : ''} shouldDisplayHelpButton={false}/>
                    <react_native_1.View style={styles.imageModalImageCenterContainer}>
                        {isLoading && <FullscreenLoadingIndicator_1.default testID="attachment-loading-spinner"/>}
                        {shouldShowNotFoundPage && !isLoading && (<BlockingView_1.default icon={Illustrations.ToddBehindCloud} iconWidth={variables_1.default.modalTopIconWidth} iconHeight={variables_1.default.modalTopIconHeight} title={translate('notFound.notHere')} subtitle={translate('notFound.pageNotFound')} linkKey="notFound.goBackHome" shouldShowLink onLinkPress={function () { return Navigation_1.default.dismissModal(); }}/>)}
                        {!shouldShowNotFoundPage &&
            !isLoading &&
            // We shouldn't show carousel arrow in search result attachment
            (!(0, EmptyObject_1.isEmptyObject)(report) && !isReceiptAttachment && type !== CONST_1.default.ATTACHMENT_TYPE.SEARCH ? (<AttachmentCarousel_1.default accountID={accountID} type={type} attachmentID={attachmentID} report={report} onNavigate={onNavigate} onClose={closeModal} source={source} setDownloadButtonVisibility={setDownloadButtonVisibility} attachmentLink={currentAttachmentLink} onAttachmentError={setAttachmentError}/>) : (!!sourceForAttachmentView &&
                shouldLoadAttachment && (<AttachmentCarouselPagerContext_1.default.Provider value={context}>
                                        <AttachmentView_1.default containerStyles={[styles.mh5]} source={sourceForAttachmentView} isAuthTokenRequired={isAuthTokenRequiredState} file={file} onToggleKeyboard={setIsConfirmButtonDisabled} onPDFLoadError={function () {
                    isPDFLoadError.current = true;
                    closeModal();
                }} isWorkspaceAvatar={isWorkspaceAvatar} maybeIcon={maybeIcon} fallbackSource={fallbackSource} isUsedInAttachmentModal transactionID={transaction === null || transaction === void 0 ? void 0 : transaction.transactionID} isUploaded={!(0, EmptyObject_1.isEmptyObject)(report)} reportID={reportID !== null && reportID !== void 0 ? reportID : (!(0, EmptyObject_1.isEmptyObject)(report) ? report.reportID : undefined)}/>
                                    </AttachmentCarouselPagerContext_1.default.Provider>)))}
                    </react_native_1.View>
                    {/* If we have an onConfirm method show a confirmation button */}
                    <react_native_reanimated_1.LayoutAnimationConfig skipEntering>
                        {!!onConfirm && !isConfirmButtonDisabled && (<SafeAreaConsumer_1.default>
                                {function (_a) {
                var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
                return (<react_native_reanimated_1.default.View style={safeAreaPaddingBottomStyle} entering={react_native_reanimated_1.FadeIn}>
                                        <Button_1.default ref={(0, viewRef_1.default)(submitRef)} success large style={[styles.buttonConfirm, shouldUseNarrowLayout ? {} : styles.attachmentButtonBigScreen]} textStyles={[styles.buttonConfirmText]} text={translate('common.send')} onPress={submitAndClose} isDisabled={isConfirmButtonDisabled || shouldDisableSendButton} pressOnEnter/>
                                    </react_native_reanimated_1.default.View>);
            }}
                            </SafeAreaConsumer_1.default>)}
                    </react_native_reanimated_1.LayoutAnimationConfig>
                    {isReceiptAttachment && (<ConfirmModal_1.default title={translate('receipt.deleteReceipt')} isVisible={isDeleteReceiptConfirmModalVisible} onConfirm={deleteAndCloseModal} onCancel={closeConfirmModal} prompt={translate('receipt.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>)}
                </react_native_gesture_handler_1.GestureHandlerRootView>
            </Modal_1.default>
            {!isReceiptAttachment && (<ConfirmModal_1.default title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''} onConfirm={closeConfirmModal} onCancel={closeConfirmModal} isVisible={isAttachmentInvalid} prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''} confirmText={translate('common.close')} shouldShowCancelButton={false} onModalHide={function () {
                if (!isPDFLoadError.current) {
                    return;
                }
                isPDFLoadError.current = false;
                onModalHide === null || onModalHide === void 0 ? void 0 : onModalHide();
            }}/>)}

            {children === null || children === void 0 ? void 0 : children({
            displayFileInModal: validateAndDisplayFileToUpload,
            show: openModal,
        })}
        </>);
}
AttachmentModal.displayName = 'AttachmentModal';
exports.default = (0, react_1.memo)(AttachmentModal);
