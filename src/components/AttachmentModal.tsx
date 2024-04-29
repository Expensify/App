import Str from 'expensify-common/lib/str';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Animated, Keyboard, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {useSharedValue} from 'react-native-reanimated';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import useNativeDriver from '@libs/useNativeDriver';
import type {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type ModalType from '@src/types/utils/ModalType';
import AttachmentCarousel from './Attachments/AttachmentCarousel';
import AttachmentCarouselPagerContext from './Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from './Attachments/AttachmentView';
import type {Attachment} from './Attachments/types';
import BlockingView from './BlockingViews/BlockingView';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import HeaderGap from './HeaderGap';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import * as Illustrations from './Icon/Illustrations';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

type AttachmentModalOnyxProps = {
    /** The transaction associated with the receipt attachment, if any */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The report associated with the receipt attachment, if any */
    parentReport: OnyxEntry<OnyxTypes.Report>;

    /** The policy associated with the receipt attachment, if any */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The list of report actions associated with the receipt attachment, if any */
    parentReportActions: OnyxEntry<OnyxTypes.ReportActions>;
};

type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse>;

type ChildrenProps = {
    displayFileInModal: (data: FileObject) => void;
    show: () => void;
};

type AttachmentModalProps = AttachmentModalOnyxProps & {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source?: AvatarSource;

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm?: ((file: FileObject) => void) | null;

    /** Whether the modal should be open by default */
    defaultOpen?: boolean;

    /** Trigger when we explicity click close button in ProfileAttachment modal */
    onModalClose?: () => void;

    /** Optional original filename when uploading */
    originalFileName?: string;

    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** Determines if download Button should be shown or not */
    allowDownload?: boolean;

    /** Determines if the receipt comes from track expense action */
    isTrackExpenseAction?: boolean;

    /** Title shown in the header of the modal */
    headerTitle?: string;

    /** The report that has this attachment */
    report?: OnyxEntry<OnyxTypes.Report> | EmptyObject;

    /** Optional callback to fire when we want to do something after modal show. */
    onModalShow?: () => void;

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide?: () => void;

    /** The data is loading or not */
    isLoading?: boolean;

    /** Should display not found page or not */
    shouldShowNotFoundPage?: boolean;

    /** Optional callback to fire when we want to do something after attachment carousel changes. */
    onCarouselAttachmentChange?: (attachment: Attachment) => void;

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar?: boolean;

    /** Denotes whether it can be an icon (ex: SVG) */
    maybeIcon?: boolean;

    /** Whether it is a receipt attachment or not */
    isReceiptAttachment?: boolean;

    /** A function as a child to pass modal launching methods to */
    children?: React.FC<ChildrenProps>;

    fallbackSource?: AvatarSource;

    canEditReceipt?: boolean;
};

function AttachmentModal({
    source = '',
    onConfirm,
    defaultOpen = false,
    originalFileName = '',
    isAuthTokenRequired = false,
    allowDownload = false,
    isTrackExpenseAction = false,
    report,
    onModalShow = () => {},
    onModalHide = () => {},
    onCarouselAttachmentChange = () => {},
    isReceiptAttachment = false,
    isWorkspaceAvatar = false,
    maybeIcon = false,
    transaction,
    parentReport,
    parentReportActions,
    headerTitle,
    policy,
    children,
    fallbackSource,
    canEditReceipt = false,
    onModalClose = () => {},
    isLoading = false,
    shouldShowNotFoundPage = false,
}: AttachmentModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isModalOpen, setIsModalOpen] = useState(defaultOpen);
    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isAuthTokenRequiredState, setIsAuthTokenRequiredState] = useState(isAuthTokenRequired);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths | null>(null);
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState<TranslationPaths | null>(null);
    const [sourceState, setSourceState] = useState<AvatarSource>(() => source);
    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const [confirmButtonFadeAnimation] = useState(() => new Animated.Value(1));
    const [isDownloadButtonReadyToBeShown, setIsDownloadButtonReadyToBeShown] = React.useState(true);
    const nope = useSharedValue(false);
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const isOverlayModalVisible = (isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!isReceiptAttachment && isAttachmentInvalid);
    const iouType = useMemo(() => (isTrackExpenseAction ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseAction]);

    const [file, setFile] = useState<FileObject | undefined>(
        originalFileName
            ? {
                  name: originalFileName,
              }
            : undefined,
    );
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    useEffect(() => {
        setFile(originalFileName ? {name: originalFileName} : undefined);
    }, [originalFileName]);

    /**
     * Keeps the attachment source in sync with the attachment displayed currently in the carousel.
     */
    const onNavigate = useCallback(
        (attachment: Attachment) => {
            setSourceState(attachment.source);
            setFile(attachment.file);
            setIsAuthTokenRequiredState(attachment.isAuthTokenRequired ?? false);
            onCarouselAttachmentChange(attachment);
        },
        [onCarouselAttachmentChange],
    );

    /**
     * If our attachment is a PDF, return the unswipeablge Modal type.
     */
    const getModalType = useCallback(
        (sourceURL: string, fileObject: FileObject) =>
            sourceURL && (Str.isPDF(sourceURL) || (fileObject && Str.isPDF(fileObject.name ?? translate('attachmentView.unknownFilename'))))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED,
        [translate],
    );

    const setDownloadButtonVisibility = useCallback(
        (isButtonVisible: boolean) => {
            if (isDownloadButtonReadyToBeShown === isButtonVisible) {
                return;
            }
            setIsDownloadButtonReadyToBeShown(isButtonVisible);
        },
        [isDownloadButtonReadyToBeShown],
    );

    /**
     * Download the currently viewed attachment.
     */
    const downloadAttachment = useCallback(() => {
        let sourceURL = sourceState;
        if (isAuthTokenRequiredState && typeof sourceURL === 'string') {
            sourceURL = addEncryptedAuthTokenToURL(sourceURL);
        }

        if (typeof sourceURL === 'string') {
            fileDownload(sourceURL, file?.name ?? '');
        }

        // At ios, if the keyboard is open while opening the attachment, then after downloading
        // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
        Keyboard.dismiss();
    }, [isAuthTokenRequiredState, sourceState, file]);

    /**
     * Execute the onConfirm callback and close the modal.
     */
    const submitAndClose = useCallback(() => {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (!isModalOpen || isConfirmButtonDisabled) {
            return;
        }

        if (onConfirm) {
            onConfirm(Object.assign(file ?? {}, {source: sourceState} as FileObject));
        }

        setIsModalOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, isConfirmButtonDisabled, onConfirm, file, sourceState]);

    /**
     * Close the confirm modals.
     */
    const closeConfirmModal = useCallback(() => {
        setIsAttachmentInvalid(false);
        setIsDeleteReceiptConfirmModalVisible(false);
    }, []);

    /**
     * Detach the receipt and close the modal.
     */
    const deleteAndCloseModal = useCallback(() => {
        IOU.detachReceipt(transaction?.transactionID ?? '');
        setIsDeleteReceiptConfirmModalVisible(false);
        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? ''));
    }, [transaction, report]);

    const isValidFile = useCallback((fileObject: FileObject) => {
        if (fileObject.size && fileObject.size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooLarge');
            setAttachmentInvalidReason('attachmentPicker.sizeExceeded');
            return false;
        }

        if (fileObject.size && fileObject.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooSmall');
            setAttachmentInvalidReason('attachmentPicker.sizeNotMet');
            return false;
        }

        return true;
    }, []);

    const isDirectoryCheck = useCallback((data: FileObject) => {
        if ('webkitGetAsEntry' in data && typeof data.webkitGetAsEntry === 'function' && data.webkitGetAsEntry().isDirectory) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
            setAttachmentInvalidReason('attachmentPicker.folderNotAllowedMessage');
            return false;
        }
        return true;
    }, []);

    const validateAndDisplayFileToUpload = useCallback(
        (data: FileObject) => {
            if (!data || !isDirectoryCheck(data)) {
                return;
            }
            let fileObject = data;
            if ('getAsFile' in data && typeof data.getAsFile === 'function') {
                fileObject = data.getAsFile();
            }
            if (!fileObject) {
                return;
            }

            if (!isValidFile(fileObject)) {
                return;
            }

            if (fileObject instanceof File) {
                /**
                 * Cleaning file name, done here so that it covers all cases:
                 * upload, drag and drop, copy-paste
                 */
                let updatedFile = fileObject;
                const cleanName = FileUtils.cleanFileName(updatedFile.name);
                if (updatedFile.name !== cleanName) {
                    updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
                }
                const inputSource = URL.createObjectURL(updatedFile);
                const inputModalType = getModalType(inputSource, updatedFile);
                setIsModalOpen(true);
                setSourceState(inputSource);
                setFile(updatedFile);
                setModalType(inputModalType);
            } else if (fileObject.uri) {
                const inputModalType = getModalType(fileObject.uri, fileObject);
                setIsModalOpen(true);
                setSourceState(fileObject.uri);
                setFile(fileObject);
                setModalType(inputModalType);
            }
        },
        [isValidFile, getModalType, isDirectoryCheck],
    );

    /**
     * In order to gracefully hide/show the confirm button when the keyboard
     * opens/closes, apply an animation to fade the confirm button out/in. And since
     * we're only updating the opacity of the confirm button, we must also conditionally
     * disable it.
     *
     * @param shouldFadeOut If true, fade out confirm button. Otherwise fade in.
     */
    const updateConfirmButtonVisibility = useCallback(
        (shouldFadeOut: boolean) => {
            setIsConfirmButtonDisabled(shouldFadeOut);
            const toValue = shouldFadeOut ? 0 : 1;

            Animated.timing(confirmButtonFadeAnimation, {
                toValue,
                duration: 100,
                useNativeDriver,
            }).start();
        },
        [confirmButtonFadeAnimation],
    );

    /**
     * close the modal
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);

        if (typeof onModalClose === 'function') {
            onModalClose();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onModalClose]);

    /**
     *  open the modal
     */
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        setSourceState(() => source);
    }, [source]);

    useEffect(() => {
        setIsAuthTokenRequiredState(isAuthTokenRequired);
    }, [isAuthTokenRequired]);

    const sourceForAttachmentView = sourceState || source;

    const threeDotsMenuItems = useMemo(() => {
        if (!isReceiptAttachment || !parentReport || !parentReportActions) {
            return [];
        }

        const menuItems = [];
        if (canEditReceipt) {
            menuItems.push({
                icon: Expensicons.Camera,
                text: translate('common.replaceText'),
                onSelected: () => {
                    closeModal();
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                            CONST.IOU.ACTION.EDIT,
                            iouType,
                            transaction?.transactionID ?? '',
                            report?.reportID ?? '',
                            Navigation.getActiveRouteWithoutParams(),
                        ),
                    );
                },
            });
        }
        if (!isOffline && allowDownload) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: () => downloadAttachment(),
            });
        }
        if (TransactionUtils.hasReceipt(transaction) && !TransactionUtils.isReceiptBeingScanned(transaction) && canEditReceipt && !TransactionUtils.hasMissingSmartscanFields(transaction)) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('receipt.deleteReceipt'),
                onSelected: () => {
                    setIsDeleteReceiptConfirmModalVisible(true);
                },
            });
        }
        return menuItems;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReceiptAttachment, parentReport, parentReportActions, policy, transaction, file, sourceState, iouType]);

    // There are a few things that shouldn't be set until we absolutely know if the file is a receipt or an attachment.
    // props.isReceiptAttachment will be null until its certain what the file is, in which case it will then be true|false.
    let headerTitleNew = headerTitle;
    let shouldShowDownloadButton = false;
    let shouldShowThreeDotsButton = false;
    if (!isEmptyObject(report)) {
        headerTitleNew = translate(isReceiptAttachment ? 'common.receipt' : 'common.attachment');
        shouldShowDownloadButton = allowDownload && isDownloadButtonReadyToBeShown && !isReceiptAttachment && !isOffline;
        shouldShowThreeDotsButton = isReceiptAttachment && isModalOpen && threeDotsMenuItems.length !== 0;
    }
    const context = useMemo(
        () => ({
            pagerItems: [],
            activePage: 0,
            pagerRef: undefined,
            isPagerScrolling: nope,
            isScrollEnabled: nope,
            onTap: () => {},
            onScaleChanged: () => {},
            onSwipeDown: closeModal,
        }),
        [closeModal, nope],
    );

    return (
        <>
            <Modal
                type={modalType}
                onSubmit={submitAndClose}
                onClose={isOverlayModalVisible ? closeConfirmModal : closeModal}
                isVisible={isModalOpen}
                onModalShow={() => {
                    onModalShow();
                    setShouldLoadAttachment(true);
                }}
                onModalHide={() => {
                    onModalHide();
                    setShouldLoadAttachment(false);
                }}
                propagateSwipe
            >
                <GestureHandlerRootView style={styles.flex1}>
                    {isSmallScreenWidth && <HeaderGap />}
                    <HeaderWithBackButton
                        title={headerTitleNew}
                        shouldShowBorderBottom
                        shouldShowDownloadButton={shouldShowDownloadButton}
                        onDownloadButtonPress={() => downloadAttachment()}
                        shouldShowCloseButton={!isSmallScreenWidth}
                        shouldShowBackButton={isSmallScreenWidth}
                        onBackButtonPress={closeModal}
                        onCloseButtonPress={closeModal}
                        shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetAttachmentModal(windowWidth)}
                        threeDotsMenuItems={threeDotsMenuItems}
                        shouldOverlayDots
                    />
                    <View style={styles.imageModalImageCenterContainer}>
                        {isLoading && <FullScreenLoadingIndicator />}
                        {shouldShowNotFoundPage && !isLoading && (
                            <BlockingView
                                icon={Illustrations.ToddBehindCloud}
                                iconWidth={variables.modalTopIconWidth}
                                iconHeight={variables.modalTopIconHeight}
                                title={translate('notFound.notHere')}
                                subtitle={translate('notFound.pageNotFound')}
                                linkKey="notFound.goBackHome"
                                shouldShowLink
                                onLinkPress={() => Navigation.dismissModal()}
                            />
                        )}
                        {!isEmptyObject(report) && !isReceiptAttachment ? (
                            <AttachmentCarousel
                                report={report}
                                onNavigate={onNavigate}
                                onClose={closeModal}
                                source={source}
                                setDownloadButtonVisibility={setDownloadButtonVisibility}
                            />
                        ) : (
                            !!sourceForAttachmentView &&
                            shouldLoadAttachment &&
                            !isLoading &&
                            !shouldShowNotFoundPage && (
                                <AttachmentCarouselPagerContext.Provider value={context}>
                                    <AttachmentView
                                        containerStyles={[styles.mh5]}
                                        source={sourceForAttachmentView}
                                        isAuthTokenRequired={isAuthTokenRequiredState}
                                        file={file}
                                        onToggleKeyboard={updateConfirmButtonVisibility}
                                        isWorkspaceAvatar={isWorkspaceAvatar}
                                        maybeIcon={maybeIcon}
                                        fallbackSource={fallbackSource}
                                        isUsedInAttachmentModal
                                        transactionID={transaction?.transactionID}
                                    />
                                </AttachmentCarouselPagerContext.Provider>
                            )
                        )}
                    </View>
                    {/* If we have an onConfirm method show a confirmation button */}
                    {!!onConfirm && (
                        <SafeAreaConsumer>
                            {({safeAreaPaddingBottomStyle}) => (
                                <Animated.View style={[StyleUtils.fade(confirmButtonFadeAnimation), safeAreaPaddingBottomStyle]}>
                                    <Button
                                        success
                                        large
                                        style={[styles.buttonConfirm, isSmallScreenWidth ? {} : styles.attachmentButtonBigScreen]}
                                        textStyles={[styles.buttonConfirmText]}
                                        text={translate('common.send')}
                                        onPress={submitAndClose}
                                        isDisabled={isConfirmButtonDisabled}
                                        pressOnEnter
                                    />
                                </Animated.View>
                            )}
                        </SafeAreaConsumer>
                    )}
                    {isReceiptAttachment && (
                        <ConfirmModal
                            title={translate('receipt.deleteReceipt')}
                            isVisible={isDeleteReceiptConfirmModalVisible}
                            onConfirm={deleteAndCloseModal}
                            onCancel={closeConfirmModal}
                            prompt={translate('receipt.deleteConfirmation')}
                            confirmText={translate('common.delete')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                    )}
                </GestureHandlerRootView>
            </Modal>
            {!isReceiptAttachment && (
                <ConfirmModal
                    title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                    onConfirm={closeConfirmModal}
                    onCancel={closeConfirmModal}
                    isVisible={isAttachmentInvalid}
                    prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                    confirmText={translate('common.close')}
                    shouldShowCancelButton={false}
                />
            )}

            {children?.({
                displayFileInModal: validateAndDisplayFileToUpload,
                show: openModal,
            })}
        </>
    );
}

AttachmentModal.displayName = 'AttachmentModal';

export default withOnyx<AttachmentModalProps, AttachmentModalOnyxProps>({
    transaction: {
        key: ({report}) => {
            const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '', report?.parentReportActionID ?? '');
            const transactionID = parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? parentReportAction?.originalMessage.IOUTransactionID ?? '0' : '0';
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        },
        initWithStoredValues: false,
    },
    parentReport: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '0'}`,
    },
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
        canEvict: false,
    },
})(memo(AttachmentModal));

export type {Attachment, FileObject, ImagePickerResponse};
