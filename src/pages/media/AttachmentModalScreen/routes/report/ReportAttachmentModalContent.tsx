import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Attachment} from '@components/Attachments/types';
import useNetwork from '@hooks/useNetwork';
import {openReport} from '@libs/actions/Report';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import {isReportNotFound} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {AttachmentModalBaseContentProps} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContainer from '@pages/media/AttachmentModalScreen/AttachmentModalContainer';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useFileErrorModal from './useFileErrorModal';
import useFileUploadValidation from './useFileUploadValidation';
import useReportAttachmentModalType from './useReportAttachmentModalType';

function ReportAttachmentModalContent({route, navigation}: AttachmentModalScreenProps) {
    const {
        attachmentID,
        type,
        file: fileParam,
        source: sourceParam,
        isAuthTokenRequired,
        attachmentLink,
        originalFileName,
        accountID = CONST.DEFAULT_NUMBER_ID,
        reportID,
        hashKey,
        shouldDisableSendButton,
        headerTitle,
        onConfirm,
        onShow,
    } = route.params;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        canBeMissing: true,
    });
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        canBeMissing: false,
    });

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {isOffline} = useNetwork();

    const submitRef = useRef<View | HTMLElement>(null);

    // Extract the reportActionID from the attachmentID (format: reportActionID_index)
    const reportActionID = useMemo(() => attachmentID?.split('_')?.[0], [attachmentID]);

    const shouldFetchReport = useMemo(() => {
        return isEmptyObject(reportActions?.[reportActionID ?? CONST.DEFAULT_NUMBER_ID]);
    }, [reportActions, reportActionID]);

    const isLoading = useMemo(() => {
        if (isOffline || isReportNotFound(report) || !reportID) {
            return false;
        }
        const isEmptyReport = isEmptyObject(report);
        return !!isLoadingApp || isEmptyReport || (reportMetadata?.isLoadingInitialReportActions !== false && shouldFetchReport);
    }, [isOffline, reportID, isLoadingApp, report, reportMetadata, shouldFetchReport]);

    const fetchReport = useCallback(() => {
        openReport(reportID, reportActionID);
    }, [reportID, reportActionID]);

    useEffect(() => {
        if (!reportID || !shouldFetchReport) {
            return;
        }

        fetchReport();
    }, [reportID, fetchReport, shouldFetchReport]);

    const onCarouselAttachmentChange = useCallback(
        (attachment: Attachment) => {
            const routeToNavigate = ROUTES.ATTACHMENTS.getRoute({
                reportID,
                attachmentID: attachment.attachmentID,
                type,
                source: String(attachment.source),
                accountID,
                isAuthTokenRequired: attachment?.isAuthTokenRequired,
                originalFileName: attachment?.file?.name,
                attachmentLink: attachment?.attachmentLink,
                hashKey,
            });
            Navigation.navigate(routeToNavigate);
        },
        [reportID, type, accountID, hashKey],
    );

    const onClose = useCallback(() => {
        // This enables Composer refocus when the attachments modal is closed by the browser navigation
        ComposerFocusManager.setReadyToFocus();
    }, []);

    const [source, setSource] = useState(() => Number(sourceParam) || (typeof sourceParam === 'string' ? tryResolveUrlFromApiRoot(decodeURIComponent(sourceParam)) : undefined));
    const {validFilesToUpload, fileError, isFileErrorModalVisible} = useFileUploadValidation({
        files: fileParam,
        onValid: (result) => {
            if (!('validatedFile' in result)) {
                return;
            }
            setSource(result.validatedFile.source);
        },
    });
    const modalType = useReportAttachmentModalType(fileParam);

    const ExtraModals = useFileErrorModal({
        fileError,
        isFileErrorModalVisible,
        onCancel: navigation.goBack,
        isMultipleFiles: Array.isArray(validFilesToUpload) && validFilesToUpload.length > 0,
    });

    const contentTypeProps = useMemo<Partial<AttachmentModalBaseContentProps>>(
        () =>
            validFilesToUpload
                ? {
                      file: validFilesToUpload,
                      fileError,
                      isFileErrorModalVisible,
                  }
                : {
                      // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
                      type,
                      report,
                      shouldShowNotFoundPage: !isLoading && type !== CONST.ATTACHMENT_TYPE.SEARCH && !report?.reportID,
                      allowDownload: true,
                      isAuthTokenRequired: !!isAuthTokenRequired,
                      attachmentLink: attachmentLink ?? '',
                      originalFileName: originalFileName ?? '',
                      isLoading,
                  },
        [attachmentLink, fileError, isAuthTokenRequired, isFileErrorModalVisible, isLoading, originalFileName, report, type, validFilesToUpload],
    );

    const contentProps = useMemo<Partial<AttachmentModalBaseContentProps>>(
        () => ({
            ...contentTypeProps,
            source,
            attachmentID,
            accountID,
            onConfirm,
            headerTitle,
            shouldDisableSendButton,
            submitRef,
            onCarouselAttachmentChange,
            ExtraModals,
        }),
        [accountID, attachmentID, contentTypeProps, headerTitle, onCarouselAttachmentChange, onConfirm, shouldDisableSendButton, source],
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
            onClose={onClose}
        />
    );
}
ReportAttachmentModalContent.displayName = 'ReportAttachmentModalContent';

export default ReportAttachmentModalContent;
