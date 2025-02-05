import {useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
// import attachmentModalHandler from '@libs/AttachmentModalHandler';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {AttachmentModalProps} from '@pages/home/report/ReportAttachmentsContext';
import ReportAttachmentsContext from '@pages/home/report/ReportAttachmentsContext';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AttachmentModalContentProps} from './AttachmentModalContent';
import type {AttachmentModalScreenProps} from './types';

function useAttachmentModalLogic(route: AttachmentModalScreenProps['route'], isModal = false) {
    const attachmentId = route.params.attachmentId;
    const attachmentsContext = useContext(ReportAttachmentsContext);
    const {
        reportID,
        source: sourceProp,
        fallbackSource,
        headerTitle,
        maybeIcon,
        type,
        accountID,
        isAuthTokenRequired,
        fileName,
        attachmentLink,
    }: AttachmentModalProps = useMemo(() => {
        const props = {
            reportID: route.params.reportID,
            source: route.params.source,
            fileName: route.params.fileName,
            fallbackSource: route.params.fallbackSource,
            headerTitle: route.params.headerTitle,
            maybeIcon: route.params.maybeIcon,
            type: route.params.type,
            accountID: route.params.accountID,
            isAuthTokenRequired: route.params.isAuthTokenRequired,
            attachmentLink: route.params.attachmentLink,
        };

        if (attachmentId) {
            return {...props, ...attachmentsContext.getAttachmentById(attachmentId)};
        }
        return props;
    }, [
        attachmentId,
        attachmentsContext,
        route.params.accountID,
        route.params.attachmentLink,
        route.params.fallbackSource,
        route.params.fileName,
        route.params.headerTitle,
        route.params.isAuthTokenRequired,
        route.params.maybeIcon,
        route.params.reportID,
        route.params.source,
        route.params.type,
    ]);

    const isReceiptAttachment = route.params.isReceiptAttachment ?? false;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? -1}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const isReportMissing = !!reportID && !report?.reportID;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !isLoadingApp && type !== CONST.ATTACHMENT_TYPE.SEARCH && isReportMissing;

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const source = Number(sourceProp) || sourceProp;

    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(!isModal);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths | null>(null);
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState<TranslationPaths | null>(null);
    const isPDFLoadError = useRef(false);
    const submitRef = useRef<View | HTMLElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(true);
    const isOverlayModalVisible = (isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!isReceiptAttachment && isAttachmentInvalid);

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute({
                reportID,
                type,
                source: String(attachment.source),
                accountID: Number(accountID),
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
        source,
        accountID: Number(accountID),
        type,
        allowDownload: true,
        report,
        onModalClose: () => {
            if (attachmentId) {
                attachmentsContext.removeAttachment(attachmentId);
            }
            Navigation.dismissModal();
            // This enables Composer refocus when the attachments modal is closed by the browser navigation
            ComposerFocusManager.setReadyToFocus();
        },
        onCarouselAttachmentChange,
        shouldShowNotFoundPage,
        isAuthTokenRequired: !!isAuthTokenRequired,
        attachmentLink: attachmentLink ?? '',
        fallbackSource,
        maybeIcon,
        originalFileName: fileName ?? '',
        isAttachmentInvalid,
        headerTitle,
    } satisfies AttachmentModalContentProps;

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
