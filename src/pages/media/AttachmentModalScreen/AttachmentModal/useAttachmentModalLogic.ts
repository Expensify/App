import {useCallback, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
// import attachmentModalHandler from '@libs/AttachmentModalHandler';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AttachmentModalContentProps} from './AttachmentModalContent';

function useAttachmentModalLogic(route: AttachmentModalScreenProps['route']) {
    const reportID = route.params.reportID;
    const type = route.params.type;
    const accountID = route.params.accountID;
    const isAuthTokenRequired = route.params.isAuthTokenRequired;
    const attachmentLink = route.params.attachmentLink;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || -1}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const fileName = route.params?.fileName;
    const defaultOpen = route.params.defaultOpen;

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const source = Number(route.params.source) || route.params.source;

    const isReceiptAttachment = route.params.isReceiptAttachment ?? false;

    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths | null>(null);
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState<TranslationPaths | null>(null);
    const isPDFLoadError = useRef(false);
    const submitRef = useRef<View | HTMLElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(defaultOpen ?? true);
    const isOverlayModalVisible = (isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!isReceiptAttachment && isAttachmentInvalid);

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute(
                reportID,
                type,
                String(attachment.source),
                Number(accountID),
                attachment?.isAuthTokenRequired,
                attachment?.file?.name,
                attachment?.attachmentLink,
            );
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

    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeModal = useCallback((shouldCallDirectly?: boolean) => {
        setIsModalOpen(false);

        // TODO: figure this out
        // if (typeof onModalClose === 'function') {
        //     if (shouldCallDirectly) {
        //         onModalClose();
        //         return;
        //     }
        //     attachmentModalHandler.handleModalClose(onModalClose);
        // }

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const contentProps = {
        accountID: Number(accountID),
        type,
        allowDownload: true,
        defaultOpen: true,
        report,
        source,
        onModalClose: () => {
            Navigation.dismissModal();
            // This enables Composer refocus when the attachments modal is closed by the browser navigation
            ComposerFocusManager.setReadyToFocus();
        },
        onCarouselAttachmentChange,
        shouldShowNotFoundPage: !isLoadingApp && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID,
        isAuthTokenRequired: !!isAuthTokenRequired,
        attachmentLink: attachmentLink ?? '',
        originalFileName: fileName ?? '',
        isAttachmentInvalid,
    } as unknown as AttachmentModalContentProps;

    return {
        contentProps,
        isOverlayModalVisible,
        setIsAttachmentInvalid,
        shouldLoadAttachment,
        setShouldLoadAttachment,
        isModalOpen,
        setIsModalOpen,
        isPDFLoadError,
        attachmentInvalidReasonTitle,
        setAttachmentInvalidReasonTitle,
        attachmentInvalidReason,
        setAttachmentInvalidReason,
        submitRef,

        closeConfirmModal,
        closeModal,
    };
}

export default useAttachmentModalLogic;
