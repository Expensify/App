import type {StackScreenProps} from '@react-navigation/stack';
import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AttachmentPreview from '@components/AttachmentPreview';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useThemeStyles from '@hooks/useThemeStyles';
import {addAttachmentWithComment, addComment, openReport} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getFileName, readFileAsync} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import {getReportDisplayOption} from '@libs/OptionsListUtils';
import {shouldValidateFile} from '@libs/ReceiptUtils';
import {getReportOrDraftReport, isDraftReport} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report as ReportType} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import KeyboardUtils from '@src/utils/keyboard';
import getFileSize from './getFileSize';
import {showErrorAlert} from './ShareRootPage';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SHARE_DETAILS>;

function ShareDetailsPage({route}: ShareDetailsPageProps) {
    const {reportOrAccountID} = route.params;

    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [unknownUserDetails] = useOnyx(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS, {canBeMissing: true});
    const [currentAttachment] = useOnyx(ONYXKEYS.SHARE_TEMP_FILE, {canBeMissing: true});
    const [validatedFile] = useOnyx(ONYXKEYS.VALIDATED_FILE_OBJECT, {canBeMissing: true});

    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const personalDetails = usePersonalDetails();
    const personalDetail = useCurrentUserPersonalDetails();
    const isTextShared = currentAttachment?.mimeType === CONST.SHARE_FILE_MIMETYPE.TXT;
    const shouldUsePreValidatedFile = shouldValidateFile(currentAttachment);
    const [message, setMessage] = useState(isTextShared ? (currentAttachment?.content ?? '') : '');
    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const report: OnyxEntry<ReportType> = getReportOrDraftReport(reportOrAccountID);
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
    const ancestors = useAncestors(report);
    const displayReport = useMemo(
        () => getReportDisplayOption(report, unknownUserDetails, personalDetail.accountID, personalDetails, privateIsArchived, reportAttributesDerived),
        [report, unknownUserDetails, personalDetails, privateIsArchived, reportAttributesDerived, personalDetail.accountID],
    );

    const shouldShowAttachment = !isTextShared;
    const fileSource = shouldUsePreValidatedFile ? (validatedFile?.uri ?? '') : (currentAttachment?.content ?? '');

    // Only get file name for actual files to avoid URI decoding errors on text content
    const validateFileName = useMemo(() => {
        if (!shouldShowAttachment) {
            return '';
        }
        return shouldUsePreValidatedFile ? getFileName(validatedFile?.uri ?? CONST.ATTACHMENT_IMAGE_DEFAULT_NAME) : getFileName(currentAttachment?.content ?? '');
    }, [shouldShowAttachment, shouldUsePreValidatedFile, validatedFile?.uri, currentAttachment?.content]);

    const fileType = shouldUsePreValidatedFile ? (validatedFile?.type ?? CONST.SHARE_FILE_MIMETYPE.JPEG) : (currentAttachment?.mimeType ?? '');

    const reportAttachmentsContext = useContext(AttachmentModalContext);
    const showAttachmentModalScreen = useCallback(() => {
        reportAttachmentsContext.setCurrentAttachment<typeof SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT>({
            source: fileSource,
            headerTitle: validateFileName,
            originalFileName: validateFileName,
            fallbackSource: icons.FallbackAvatar,
        });
        Navigation.navigate(ROUTES.SHARE_DETAILS_ATTACHMENT);
    }, [reportAttachmentsContext, fileSource, validateFileName, icons.FallbackAvatar]);

    useEffect(() => {
        if (!currentAttachment?.content || errorTitle || !shouldShowAttachment) {
            return;
        }
        getFileSize(currentAttachment?.content).then((size) => {
            if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setErrorTitle(translate('attachmentPicker.attachmentTooLarge'));
                setErrorMessage(translate('attachmentPicker.sizeExceeded'));
            }

            if (size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                setErrorTitle(translate('attachmentPicker.attachmentTooSmall'));
                setErrorMessage(translate('attachmentPicker.sizeNotMet'));
            }
        });
    }, [currentAttachment?.content, errorTitle, translate, shouldShowAttachment]);

    useEffect(() => {
        if (!errorTitle || !errorMessage) {
            return;
        }

        showErrorAlert(errorTitle, errorMessage);
    }, [errorTitle, errorMessage]);

    if (isEmptyObject(report)) {
        return <NotFoundPage />;
    }

    const isDraft = isDraftReport(reportOrAccountID);

    const handleShare = () => {
        if (!currentAttachment || (shouldUsePreValidatedFile && !validatedFile)) {
            return;
        }

        if (isTextShared) {
            addComment(report, report.reportID, ancestors, message, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE, personalDetail.accountID);
            const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportOrAccountID);
            Navigation.navigate(routeToNavigate, {forceReplace: true});
            return;
        }

        readFileAsync(
            fileSource,
            validateFileName,
            (file) => {
                if (isDraft) {
                    openReport(
                        report.reportID,
                        '',
                        displayReport.participantsList?.filter((u) => u.accountID !== personalDetail.accountID).map((u) => u.login ?? '') ?? [],
                        report,
                        undefined,
                        undefined,
                        undefined,
                    );
                }
                if (report.reportID) {
                    addAttachmentWithComment(report, report.reportID, ancestors, file, personalDetail.accountID, message, personalDetail.timezone, undefined, undefined);
                }

                const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportOrAccountID);
                Navigation.navigate(routeToNavigate, {forceReplace: true});
            },
            () => {},
            fileType,
        );
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            keyboardAvoidingViewBehavior="padding"
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="ShareDetailsPage"
        >
            <View style={[styles.flex1, styles.flexColumn, styles.h100, styles.appBG]}>
                {/* eslint-disable-next-line no-restricted-syntax -- Temporarily disabled ESLint for the missing sentryLabel, as it is out of scope for this PR and should be addressed in the PR that introduced the lint rule. */}
                <PressableWithoutFeedback
                    onPress={() => {
                        KeyboardUtils.dismiss();
                    }}
                    accessible={false}
                >
                    <HeaderWithBackButton
                        title={translate('share.shareToExpensify')}
                        shouldShowBackButton
                    />

                    {!!report && (
                        <View>
                            <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                                <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.to')}</Text>
                            </View>
                            <UserListItem
                                item={displayReport}
                                isFocused={false}
                                showTooltip={false}
                                onSelectRow={() => {
                                    KeyboardUtils.dismiss();
                                }}
                                pressableStyle={[styles.flexRow]}
                                shouldSyncFocus={false}
                            />
                        </View>
                    )}
                </PressableWithoutFeedback>
                <View style={[styles.ph5, styles.flex1, styles.flexColumn, styles.overflowHidden]}>
                    <View style={styles.pv3}>
                        <ScrollView scrollEnabled={false}>
                            <TextInput
                                autoFocus={false}
                                value={message}
                                scrollEnabled
                                type="markdown"
                                autoGrowHeight
                                maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                                onChangeText={setMessage}
                                accessibilityLabel={translate('share.messageInputLabel')}
                                label={translate('share.messageInputLabel')}
                            />
                        </ScrollView>
                    </View>
                    {/* eslint-disable-next-line no-restricted-syntax -- Temporarily disabled ESLint for the missing sentryLabel, as it is out of scope for this PR and should be addressed in the PR that introduced the lint rule. */}
                    <PressableWithoutFeedback
                        onPress={() => {
                            KeyboardUtils.dismiss();
                        }}
                        accessible={false}
                    >
                        {shouldShowAttachment && (
                            <>
                                <View style={[styles.pt6, styles.pb2]}>
                                    <Text style={styles.textLabelSupporting}>{translate('common.attachment')}</Text>
                                </View>
                                <AttachmentPreview
                                    source={fileSource ?? ''}
                                    aspectRatio={currentAttachment?.aspectRatio}
                                    onPress={showAttachmentModalScreen}
                                    onLoadError={() => {
                                        showErrorAlert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                                    }}
                                />
                            </>
                        )}
                    </PressableWithoutFeedback>
                </View>
                <FixedFooter style={[styles.pt4]}>
                    <Button
                        success
                        large
                        text={translate('common.share')}
                        style={styles.w100}
                        onPress={handleShare}
                    />
                </FixedFooter>
            </View>
        </ScreenWrapper>
    );
}

export default ShareDetailsPage;
