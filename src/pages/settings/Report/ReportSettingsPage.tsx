import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    canEditRoomVisibility,
    canEditWriteCapability,
    getReportNotificationPreference,
    isAdminRoom,
    isArchivedNonExpenseReport as isArchivedNonExpenseReportUtils,
    isHiddenForCurrentUser,
    isMoneyRequestReport as isMoneyRequestReportUtils,
    isSelfDM,
} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportSettingsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.ROOT>;

function ReportSettingsPage({report, policy, route}: ReportSettingsPageProps) {
    const backTo = route.params.backTo;
    const reportID = report?.reportID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isReportArchived = useReportIsArchived(reportID);
    const isArchivedNonExpenseReport = isArchivedNonExpenseReportUtils(report, isReportArchived);
    // The workspace the report is on, null if the user isn't a member of the workspace
    const linkedWorkspace = useMemo(() => (report?.policyID && policy?.id === report?.policyID ? policy : undefined), [policy, report?.policyID]);
    const isMoneyRequestReport = isMoneyRequestReportUtils(report);
    const shouldDisableSettings = isArchivedNonExpenseReport || isEmptyObject(report) || isSelfDM(report);
    const notificationPreferenceValue = getReportNotificationPreference(report);
    const notificationPreference =
        notificationPreferenceValue && !isHiddenForCurrentUser(notificationPreferenceValue)
            ? translate(`notificationPreferencesPage.notificationPreferences.${notificationPreferenceValue}`)
            : '';
    const writeCapability = isAdminRoom(report) ? CONST.REPORT.WRITE_CAPABILITIES.ADMINS : (report?.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL);
    const writeCapabilityText = translate(`writeCapabilityPage.writeCapability.${writeCapability}`);
    const shouldAllowWriteCapabilityEditing = useMemo(() => canEditWriteCapability(report, linkedWorkspace, isReportArchived), [report, linkedWorkspace, isReportArchived]);
    const shouldAllowChangeVisibility = useMemo(() => canEditRoomVisibility(linkedWorkspace, isArchivedNonExpenseReport), [linkedWorkspace, isArchivedNonExpenseReport]);

    const shouldShowNotificationPref = !isMoneyRequestReport && !isHiddenForCurrentUser(notificationPreferenceValue);

    const shouldShowWriteCapability = !isMoneyRequestReport;

    return (
        <ScreenWrapper testID="ReportSettingsPage">
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

export default withReportOrNotFound()(ReportSettingsPage);
