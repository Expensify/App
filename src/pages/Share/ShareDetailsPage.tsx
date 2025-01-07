import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import AttachmentPreview from '@components/AttachmentPreview';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import UserListItem from '@src/components/SelectionList/UserListItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SHARE_DETAILS>;

function ShareDetailsPage({
    route: {
        params: {reportOrAccountID},
    },
}: ShareDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [onyxReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportOrAccountID}`, {allowStaleData: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [unknownUserDetails] = useOnyx(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS);
    const currentUserID = Report.getCurrentUserAccountID();

    const optimisticReport = Report.getOptimisticChatReport(parseInt(reportOrAccountID, 10));
    const report = onyxReport ?? optimisticReport;
    const displayReport = OptionsListUtils.getReportDisplayOption(report);

    if (unknownUserDetails) {
        optimisticReport.reportID = unknownUserDetails?.accountID?.toString() ?? '';
        displayReport.participantsList = [{...unknownUserDetails, displayName: unknownUserDetails.login, accountID: unknownUserDetails.accountID ?? CONST.DEFAULT_NUMBER_ID}];
    }

    if (!onyxReport || onyxReport?.ownerAccountID === 0) {
        const participants = onyxReport
            ? ReportUtils.getDisplayNamesWithTooltips(
                  OptionsListUtils.getPersonalDetailsForAccountIDs(
                      Object.keys(onyxReport?.participants ?? {})
                          .map((p) => parseInt(p ?? '', 10))
                          .filter((u) => u !== currentUserID),
                      personalDetails,
                  ),
                  false,
              )
            : displayReport.participantsList;
        const participant = participants?.filter((u) => u.accountID !== currentUserID).at(0);
        displayReport.text = participant?.displayName;
        displayReport.alternateText = participant?.login;
    }

    const [currentAttachment] = useOnyx(ONYXKEYS.SHARE_TEMP_FILE);

    const isTextShared = useMemo(() => currentAttachment?.mimeType === 'txt', [currentAttachment]);

    const [message, setMessage] = useState(isTextShared ? currentAttachment?.content ?? '' : '');

    const fileName = currentAttachment?.content.split('/').pop();

    const handleShare = () => {
        if (!currentAttachment) {
            return;
        }
        FileUtils.readFileAsync(
            currentAttachment.content,
            FileUtils.getFileName(currentAttachment.content),
            (file) => {
                if (!onyxReport && report.reportID) {
                    Report.openReport(
                        report.reportID,
                        '',
                        displayReport.participantsList?.filter((u) => u.accountID !== currentUserID).map((u) => u.login ?? '') ?? [],
                        optimisticReport,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                    );
                }
                if (report.reportID) {
                    if (isTextShared) {
                        Report.addComment(report.reportID, message);
                    } else {
                        Report.addAttachment(report.reportID, file, message);
                    }
                }

                const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportOrAccountID);
                Navigation.navigate(routeToNavigate, CONST.NAVIGATION.TYPE.UP);
            },
            () => {},
        );
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
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
                    {!isTextShared && (
                        <>
                            <View style={[styles.pt6, styles.pb2]}>
                                <Text style={styles.textLabelSupporting}>{translate('common.attachment')}</Text>
                            </View>
                            <SafeAreaView>
                                <AttachmentModal
                                    headerTitle={fileName}
                                    source={currentAttachment?.content}
                                    originalFileName={fileName}
                                    fallbackSource={Expensicons.FallbackAvatar}
                                >
                                    {({show}) => (
                                        <AttachmentPreview
                                            source={currentAttachment?.content ?? ''}
                                            aspectRatio={currentAttachment?.aspectRatio}
                                            onPress={show}
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
