import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
import validateAttachmentFile from '@libs/AttachmentUtils';
import {translateLocal} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import type {AttachmentModalBaseContentProps, OnValidateFileCallback} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type ModalType from '@src/types/utils/ModalType';
import type AttachmentModalRouteProps from './types';

function ReportAttachmentModalContent({
    route,
    navigation,
    type,
    file: fileParam,
    source: sourceParam,
    isAuthTokenRequired,
    attachmentLink,
    originalFileName,
    accountID = CONST.DEFAULT_NUMBER_ID,
    reportID,
    shouldDisableSendButton,
    headerTitle,
    onConfirm,
    onShow,
}: AttachmentModalRouteProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState<TranslationPaths | null>(null);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths | null>(null);
    const submitRef = useRef<View | HTMLElement>(null);

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
    const [source, setSource] = useState(() => Number(sourceParam) || sourceParam);

    // Validates the attachment file and renders the appropriate modal type or errors
    const validateFile: OnValidateFileCallback = useCallback(
        (file, setFile) => {
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

                const {source: fileSource} = result;
                const inputModalType = getModalType(fileSource, file);
                setModalType(inputModalType);
                setSource(fileSource);
                setFile(file);
            });
        },
        [getModalType],
    );

    const contentTypeProps = useMemo<Partial<AttachmentModalBaseContentProps>>(
        () =>
            fileParam
                ? {
                      file: fileParam,
                      onValidateFile: validateFile,
                  }
                : {
                      // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
                      type,
                      report,
                      shouldShowNotFoundPage: !isLoadingApp && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID,
                      allowDownload: true,
                      isAuthTokenRequired: !!isAuthTokenRequired,
                      attachmentLink: attachmentLink ?? '',
                      originalFileName: originalFileName ?? '',
                  },
        [attachmentLink, fileParam, isAuthTokenRequired, isLoadingApp, originalFileName, report, type, validateFile],
    );

    const contentProps = useMemo<Partial<AttachmentModalBaseContentProps>>(
        () => ({
            ...contentTypeProps,
            source,
            accountID,
            onConfirm,
            headerTitle,
            isAttachmentInvalid,
            attachmentInvalidReasonTitle,
            attachmentInvalidReason,
            shouldDisableSendButton,
            submitRef,
            onCarouselAttachmentChange,
        }),
        [
            accountID,
            attachmentInvalidReason,
            attachmentInvalidReasonTitle,
            contentTypeProps,
            headerTitle,
            isAttachmentInvalid,
            onCarouselAttachmentChange,
            onConfirm,
            shouldDisableSendButton,
            source,
        ],
    );

    // If the user refreshes during the send attachment flow, we need to navigate back to the report or home
    useEffect(() => {
        if (!!sourceParam || !!fileParam) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            if (reportID) {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            } else {
                Navigation.goBack(ROUTES.HOME);
            }
        });
    }, [sourceParam, reportID, route.name, fileParam]);

    return (
        <AttachmentModalContainer
            navigation={navigation}
            contentProps={contentProps}
            modalType={modalType}
            onShow={onShow}
        />
    );
}

export default ReportAttachmentModalContent;
