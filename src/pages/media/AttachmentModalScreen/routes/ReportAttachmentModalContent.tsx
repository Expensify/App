import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
import validateAttachmentFile from '@libs/AttachmentUtils';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {translateLocal} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type ModalType from '@src/types/utils/ModalType';
import type AttachmentModalRouteProps from './types';

function ReportAttachmentModalContent({
    navigation,
    type,
    file,
    isAuthTokenRequired,
    attachmentLink,
    originalFileName,
    source: sourceProp,
    accountID: accountIDProp,
    reportID: reportIDProp,
    isReceiptAttachment: isReceiptAttachmentProp,
    onModalHide: onModalHideParam,
    onModalClose: onModalCloseParam,
}: AttachmentModalRouteProps) {
    const accountID = accountIDProp ?? CONST.DEFAULT_NUMBER_ID;
    const reportID = reportIDProp ?? CONST.DEFAULT_NUMBER_ID;
    const isReceiptAttachment = isReceiptAttachmentProp ?? false;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(true);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState<TranslationPaths | null>(null);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths | null>(null);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);

    const isPDFLoadError = useRef(false);
    const submitRef = useRef<View | HTMLElement>(null);

    const isOverlayModalVisible = (isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!isReceiptAttachment && isAttachmentInvalid);

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute({
                reportID,
                type,
                source: String(attachment.source),
                accountID,
                isAuthTokenRequired: attachment?.isAuthTokenRequired,
                fileName: attachment?.file?.name,
                attachmentLink: attachment?.attachmentLink,
            });
            Navigation.navigate(routeToNavigate);
        },
        [reportID, type, accountID],
    );

    /**
     * Close the confirm modals.
     */
    const closeConfirmModal = useCallback(() => {
        setIsAttachmentInvalid(false);
        setIsDeleteReceiptConfirmModalVisible(false);
    }, [setIsAttachmentInvalid]);

    const onModalHide = useCallback(() => {
        if (!isPDFLoadError.current) {
            onModalHideParam?.();
        }
        setShouldLoadAttachment(false);
        if (isPDFLoadError.current) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
            setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
        }
    }, [onModalHideParam]);

    const onPdfLoadError = useCallback(
        (closeModal?: (shouldCallDirectly?: boolean) => void) => {
            isPDFLoadError.current = true;
            closeModal?.();
        },
        [isPDFLoadError],
    );

    const onInvalidReasonModalHide = useCallback(() => {
        if (!isPDFLoadError.current) {
            return;
        }
        isPDFLoadError.current = false;
        onModalHide?.();
    }, [isPDFLoadError, onModalHide]);

    const onModalClose = useCallback(() => {
        Navigation.dismissModal();
        // This enables Composer refocus when the attachments modal is closed by the browser navigation
        ComposerFocusManager.setReadyToFocus();

        onModalCloseParam?.();
    }, [onModalCloseParam]);

    /**
     * If our attachment is a PDF, return the unswipeablge Modal type.
     */
    const getModalType = useCallback(
        (sourceURL: string, fileObject: FileObject) =>
            sourceURL && (Str.isPDF(sourceURL) || (fileObject && Str.isPDF(fileObject.name ?? translateLocal('attachmentView.unknownFilename'))))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED,
        [],
    );

    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [source, setSource] = useState(() => Number(sourceProp) || sourceProp);

    // Validates the attachment file and renders the appropriate modal type or errors
    useEffect(() => {
        if (!file) {
            return;
        }

        validateAttachmentFile(file).then((result) => {
            if (!result.isValid) {
                const {error} = result;

                setIsAttachmentInvalid?.(true);
                switch (error) {
                    case 'tooLarge':
                        setAttachmentInvalidReasonTitle?.('attachmentPicker.attachmentTooLarge');
                        setAttachmentInvalidReason?.('attachmentPicker.sizeExceeded');
                        break;
                    case 'tooSmall':
                        setAttachmentInvalidReasonTitle?.('attachmentPicker.attachmentTooSmall');
                        setAttachmentInvalidReason?.('attachmentPicker.sizeNotMet');
                        break;
                    case 'fileDoesNotExist':
                        setAttachmentInvalidReasonTitle?.('attachmentPicker.attachmentError');
                        setAttachmentInvalidReason?.('attachmentPicker.folderNotAllowedMessage');
                        break;
                    case 'fileInvalid':
                    default:
                        setAttachmentInvalidReasonTitle?.('attachmentPicker.attachmentError');
                        setAttachmentInvalidReason?.('attachmentPicker.errorWhileSelectingCorruptedAttachment');
                }

                return;
            }

            const {fileType, source: fileSource} = result;

            if (fileType === 'file') {
                const inputModalType = getModalType(fileSource, file);
                setModalType(inputModalType);
                setSource(fileSource);
                return;
            }

            if (fileType === 'uri') {
                const inputModalType = getModalType(fileSource, file);
                setModalType(inputModalType);
                setSource(fileSource);
            }
        });
    }, [file, getModalType]);

    const screenProps = useMemo(
        () => ({
            // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
            source,
            type,
            report,
            accountID,
            shouldShowNotFoundPage: !file && !isLoadingApp && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID,
            allowDownload: true,
            isAuthTokenRequired: !!isAuthTokenRequired,
            attachmentLink: attachmentLink ?? '',
            originalFileName: originalFileName ?? '',
        }),
        [accountID, attachmentLink, file, isAuthTokenRequired, isLoadingApp, originalFileName, report, source, type],
    );

    const contentProps = useMemo(
        () =>
            ({
                ...screenProps,
                shouldLoadAttachment,
                isAttachmentInvalid,
                attachmentInvalidReasonTitle,
                attachmentInvalidReason,
                isDeleteReceiptConfirmModalVisible,
                submitRef,
                onCarouselAttachmentChange,
                onRequestDeleteReceipt: () => setIsDeleteReceiptConfirmModalVisible?.(true),
                onDeleteReceipt: () => setIsDeleteReceiptConfirmModalVisible?.(false),
                onPdfLoadError,
                onInvalidReasonModalHide,
            } satisfies Partial<AttachmentModalBaseContentProps>),
        [
            attachmentInvalidReason,
            attachmentInvalidReasonTitle,
            isAttachmentInvalid,
            isDeleteReceiptConfirmModalVisible,
            onCarouselAttachmentChange,
            onInvalidReasonModalHide,
            onPdfLoadError,
            screenProps,
            shouldLoadAttachment,
        ],
    );

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
            modalType={modalType}
            setModalType={setModalType}
            setShouldLoadAttachment={setShouldLoadAttachment}
            isOverlayModalVisible={isOverlayModalVisible}
            closeConfirmModal={closeConfirmModal}
            onModalClose={onModalClose}
            onModalHide={onModalHide}
        />
    );
}

export default ReportAttachmentModalContent;
