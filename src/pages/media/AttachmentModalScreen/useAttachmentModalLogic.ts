import {useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
// import attachmentModalHandler from '@libs/AttachmentModalHandler';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import ReportAttachmentsContext from '@pages/home/report/ReportAttachmentsContext';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AttachmentModalContentProps} from './AttachmentModalContent';
import type {AttachmentModalScreenParams, AttachmentModalType as AttachmentModalScreenType} from './types';
import useAttachment from './useAttachment';

function useAttachmentModalLogic(route: PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.ATTACHMENTS>['route'], isModal = false) {
    const attachmentId = route.params.attachmentId;
    const attachmentsContext = useContext(ReportAttachmentsContext);
    const params: AttachmentModalScreenParams = useMemo(() => {
        if (attachmentId) {
            return {...route.params, ...attachmentsContext.getAttachmentById(attachmentId)};
        }
        return route.params;
    }, [attachmentId, attachmentsContext, route.params]);

    const attachmentType = (route.name ?? '') as AttachmentModalScreenType;
    const {
        source: sourceProp,
        fallbackSource,
        headerTitle,
        maybeIcon,
        type,
        accountID,
        isAuthTokenRequired,
        originalFileName,
        attachmentLink,
    } = useAttachment({...params, attachmentModalType: attachmentType});

    const isReceiptAttachment = route.params.isReceiptAttachment ?? false;

    const reportID = params.reportID;
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

    const contentProps: AttachmentModalContentProps = {
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
        originalFileName: originalFileName ?? '',
        isAttachmentInvalid,
        headerTitle,
    };

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
