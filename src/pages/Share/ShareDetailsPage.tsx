import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import AttachmentPreview from '@components/AttachmentPreview';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addAttachment, addComment, getCurrentUserAccountID, openReport} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getFileName, readFileAsync} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import {getReportDisplayOption} from '@libs/OptionsListUtils';
import {getReportOrDraftReport, isDraftReport} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import UserListItem from '@src/components/SelectionList/UserListItem';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report as ReportType} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {showErrorAlert} from './ShareRootPage';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SHARE_DETAILS>;

function ShareDetailsPage({
    route: {
        params: {reportOrAccountID},
    },
}: ShareDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [unknownUserDetails] = useOnyx(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS);
    const [currentAttachment] = useOnyx(ONYXKEYS.SHARE_TEMP_FILE);
    const isTextShared = currentAttachment?.mimeType === 'txt';
    const [message, setMessage] = useState(isTextShared ? currentAttachment?.content ?? '' : '');

    const report: OnyxEntry<ReportType> = getReportOrDraftReport(reportOrAccountID);
    const displayReport = useMemo(() => getReportDisplayOption(report, unknownUserDetails), [report, unknownUserDetails]);
    if (isEmptyObject(report)) {
        return <NotFoundPage />;
    }

    const isDraft = isDraftReport(reportOrAccountID);
    const currentUserID = getCurrentUserAccountID();
    const shouldShowAttachment = !isTextShared;

    const fileName = currentAttachment?.content.split('/').pop();

    const handleShare = () => {
        if (!currentAttachment) {
            return;
        }

        if (isTextShared) {
            addComment(report.reportID, message);
            const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportOrAccountID);
            Navigation.navigate(routeToNavigate);
            return;
        }

        readFileAsync(
            currentAttachment.content,
            getFileName(currentAttachment.content),
            (file) => {
                if (isDraft) {
                    openReport(
                        report.reportID,
                        '',
                        displayReport.participantsList?.filter((u) => u.accountID !== currentUserID).map((u) => u.login ?? '') ?? [],
                        report,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                    );
                }
                if (report.reportID) {
                    addAttachment(report.reportID, file, message);
                }

                const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportOrAccountID);
                Navigation.navigate(routeToNavigate, {forceReplace: true});
            },
            () => {},
        );
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={canUseTouchScreen()}
            testID={ShareDetailsPage.displayName}
        >
            <View style={[styles.flex1, styles.flexColumn, styles.h100]}>
                <HeaderWithBackButton
                    title={translate('share.shareToExpensify')}
                    shouldShowBackButton
                />
                {!!report && (
                    <>
                        <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                            <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.to')}</Text>
                        </View>
                        <UserListItem
                            item={displayReport}
                            isFocused={false}
                            showTooltip={false}
                            onSelectRow={() => {}}
                            pressableStyle={[styles.flexRow]}
                            shouldSyncFocus={false}
                            isDisabled
                        />
                    </>
                )}

                <View style={[styles.ph5, styles.flex1, styles.flexColumn]}>
                    <View style={styles.pv5}>
                        <ScrollView>
                            <TextInput
                                value={message}
                                multiline
                                onChangeText={setMessage}
                                accessibilityLabel={translate('share.messageInputLabel')}
                                label={translate('share.messageInputLabel')}
                            />
                        </ScrollView>
                    </View>
                    {shouldShowAttachment && (
                        <>
                            <View style={[styles.pt6, styles.pb2]}>
                                <Text style={styles.textLabelSupporting}>{translate('common.attachment')}</Text>
                            </View>
                            <SafeAreaView>
                                <AttachmentModal
                                    headerTitle={fileName}
                                    source={currentAttachment?.content}
                                    originalFileName={fileName}
                                    fallbackSource={FallbackAvatar}
                                >
                                    {({show}) => (
                                        <AttachmentPreview
                                            source={currentAttachment?.content ?? ''}
                                            aspectRatio={currentAttachment?.aspectRatio}
                                            onPress={show}
                                            onLoadError={() => {
                                                showErrorAlert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                                            }}
                                        />
                                    )}
                                </AttachmentModal>
                            </SafeAreaView>
                        </>
                    )}
                </View>

                <View style={[styles.flexGrow1, styles.flexColumn, styles.justifyContentEnd, styles.mh4, styles.mv3]}>
                    <Button
                        success
                        large
                        text={translate('common.share')}
                        style={styles.w100}
                        onPress={handleShare}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

ShareDetailsPage.displayName = 'ShareDetailsPage';
export default ShareDetailsPage;
