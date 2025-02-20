import {Str} from 'expensify-common';
import {useCallback, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {translateLocal} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type ModalType from '@src/types/utils/ModalType';
import type {AttachmentModalBaseContentProps} from './BaseContent';
import type {AttachmentModalContent, AttachmentModalWrapperWrapperProps} from './types';

const ReportAttachmentModalContent: AttachmentModalContent = ({params, children}) => {
    const accountID = params.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const reportID = params.reportID ?? CONST.DEFAULT_NUMBER_ID;
    const isReceiptAttachment = params.isReceiptAttachment ?? false;

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
                type: params.type,
                source: String(attachment.source),
                accountID,
                isAuthTokenRequired: attachment?.isAuthTokenRequired,
                fileName: attachment?.file?.name,
                attachmentLink: attachment?.attachmentLink,
            });
            Navigation.navigate(routeToNavigate);
        },
        [reportID, params.type, accountID],
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
            params.onModalHide?.();
        }
        setShouldLoadAttachment(false);
        if (isPDFLoadError.current) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
            setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
        }
    }, [params]);

    const onPdfLoadError = useCallback(
        (setIsModalOpen?: (isModalOpen: boolean) => void) => {
            isPDFLoadError.current = true;
            setIsModalOpen?.(false);
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

        params.onModalClose?.();
    }, [params]);

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

    const onUploadFileValidated = useCallback(
        (type: string, sourceURL: string, fileObject: FileObject) => {
            if (type === 'file') {
                const inputModalType = getModalType(sourceURL, fileObject);
                setModalType(inputModalType);
            } else if (type === 'uri') {
                const inputModalType = getModalType(sourceURL, fileObject);
                setModalType(inputModalType);
            }
        },
        [getModalType],
    );

    const screenProps = useMemo(
        () =>
            params.file
                ? {...params, accountID}
                : {
                      // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
                      source: Number(params.source) || params.source,
                      type: params.type,
                      report,
                      accountID,
                      shouldShowNotFoundPage: !params.file && !isLoadingApp && params.type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID,
                      allowDownload: true,
                      isAuthTokenRequired: !!params.isAuthTokenRequired,
                      attachmentLink: params.attachmentLink ?? '',
                      originalFileName: params.originalFileName ?? '',
                  },
        [accountID, isLoadingApp, params, report],
    );

    const contentProps = useMemo(
        () =>
            ({
                ...screenProps,
                shouldLoadAttachment,
                isAttachmentInvalid,
                setIsAttachmentInvalid,
                setAttachmentInvalidReason,
                attachmentInvalidReasonTitle,
                setAttachmentInvalidReasonTitle,
                attachmentInvalidReason,
                isDeleteReceiptConfirmModalVisible,
                setIsDeleteReceiptConfirmModalVisible,
                submitRef,
                onCarouselAttachmentChange,
                onPdfLoadError,
                onInvalidReasonModalHide,
                onUploadFileValidated,
            } satisfies Partial<AttachmentModalBaseContentProps>),
        [
            attachmentInvalidReason,
            attachmentInvalidReasonTitle,
            isAttachmentInvalid,
            isDeleteReceiptConfirmModalVisible,
            onCarouselAttachmentChange,
            onInvalidReasonModalHide,
            onPdfLoadError,
            onUploadFileValidated,
            screenProps,
            shouldLoadAttachment,
        ],
    );

    const wrapperProps = useMemo(
        () =>
            ({
                modalType,
                setModalType,
                setShouldLoadAttachment,
                isOverlayModalVisible,
                closeConfirmModal,
                onModalClose,
                onModalHide,
            } satisfies AttachmentModalWrapperWrapperProps),
        [closeConfirmModal, isOverlayModalVisible, modalType, onModalClose, onModalHide],
    );

    // eslint-disable-next-line react-compiler/react-compiler
    return children({contentProps, wrapperProps});
};

export default ReportAttachmentModalContent;
