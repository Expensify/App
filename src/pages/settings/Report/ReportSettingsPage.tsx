import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    canEditRoomVisibility,
    canEditWriteCapability,
    getReportNotificationPreference,
    isAdminRoom,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isHiddenForCurrentUser,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isSelfDM,
} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportSettingsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.ROOT>;

function ReportSettingsPage({report, policy, route}: ReportSettingsPageProps) {
    const backTo = route.params.backTo;
    const reportID = report?.reportID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true});
    // The workspace the report is on, null if the user isn't a member of the workspace
    const linkedWorkspace = useMemo(() => (report?.policyID && policy?.id === report?.policyID ? policy : undefined), [policy, report?.policyID]);
    const isMoneyRequestReport = isMoneyRequestReportUtil(report);

    const shouldDisableSettings = isEmptyObject(report) || isArchivedNonExpenseReport(report, reportNameValuePairs) || isSelfDM(report);
    const notificationPreferenceValue = getReportNotificationPreference(report);
    const notificationPreference =
        notificationPreferenceValue && !isHiddenForCurrentUser(notificationPreferenceValue)
            ? translate(`notificationPreferencesPage.notificationPreferences.${notificationPreferenceValue}`)
            : '';
    const writeCapability = isAdminRoom(report) ? CONST.REPORT.WRITE_CAPABILITIES.ADMINS : (report?.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL);

    const writeCapabilityText = translate(`writeCapabilityPage.writeCapability.${writeCapability}`);
    const isReportArchived = isArchivedReport(reportNameValuePairs);
    const shouldAllowWriteCapabilityEditing = useMemo(() => canEditWriteCapability(report, linkedWorkspace, isReportArchived), [report, linkedWorkspace, isReportArchived]);
    const shouldAllowChangeVisibility = useMemo(() => canEditRoomVisibility(report, linkedWorkspace), [report, linkedWorkspace]);

    const shouldShowNotificationPref = !isMoneyRequestReport && !isHiddenForCurrentUser(notificationPreferenceValue);

    const shouldShowWriteCapability = !isMoneyRequestReport;

    return (
        <ScreenWrapper testID={ReportSettingsPage.displayName}>
            <FullPageNotFoundView shouldShow={shouldDisableSettings}>
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo))}
                />
                <ScrollView style={[styles.flex1]}>
                    {shouldShowNotificationPref && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={notificationPreference}
                            description={translate('notificationPreferencesPage.label')}
                            onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(reportID, backTo))}
                        />
                    )}
                    {shouldShowWriteCapability &&
                        (shouldAllowWriteCapabilityEditing ? (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={writeCapabilityText}
                                description={translate('writeCapabilityPage.label')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY.getRoute(reportID, backTo))}
                            />
                        ) : (
                            <View style={[styles.ph5, styles.pv3]}>
                                <Text
                                    style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                    numberOfLines={1}
                                >
                                    {translate('writeCapabilityPage.label')}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.optionAlternateText, styles.pre]}
                                >
                                    {writeCapabilityText}
                                </Text>
                            </View>
                        ))}
                    {!!report?.visibility &&
                        report.chatType !== CONST.REPORT.CHAT_TYPE.INVOICE &&
                        (shouldAllowChangeVisibility ? (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={translate(`newRoomPage.visibilityOptions.${report.visibility}`)}
                                description={translate('newRoomPage.visibility')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_VISIBILITY.getRoute(report.reportID, backTo))}
                            />
                        ) : (
                            <View style={[styles.pv3, styles.ph5]}>
                                <Text
                                    style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                    numberOfLines={1}
                                >
                                    {translate('newRoomPage.visibility')}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.reportSettingsVisibilityText]}
                                >
                                    {translate(`newRoomPage.visibilityOptions.${report.visibility}`)}
                                </Text>
                                <Text style={[styles.textLabelSupporting, styles.mt1]}>{translate(`newRoomPage.${report.visibility}Description`)}</Text>
                            </View>
                        ))}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportSettingsPage.displayName = 'ReportSettingsPage';

export default withReportOrNotFound()(ReportSettingsPage);
