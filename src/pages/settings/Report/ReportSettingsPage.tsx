import type {StackScreenProps} from '@react-navigation/stack';
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
import * as ReportUtils from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportSettingsPageProps = WithReportOrNotFoundProps & StackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.ROOT>;

function ReportSettingsPage({report, policies}: ReportSettingsPageProps) {
    const reportID = report?.reportID ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    // The workspace the report is on, null if the user isn't a member of the workspace
    const linkedWorkspace = useMemo(() => Object.values(policies ?? {}).find((policy) => policy && policy.id === report?.policyID), [policies, report?.policyID]);
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);

    const shouldDisableSettings = isEmptyObject(report) || ReportUtils.isArchivedRoom(report, reportNameValuePairs) || ReportUtils.isSelfDM(report);
    const notificationPreference =
        report?.notificationPreference && report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN
            ? translate(`notificationPreferencesPage.notificationPreferences.${report.notificationPreference}`)
            : '';
    const writeCapability = ReportUtils.isAdminRoom(report) ? CONST.REPORT.WRITE_CAPABILITIES.ADMINS : report?.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL;

    const writeCapabilityText = translate(`writeCapabilityPage.writeCapability.${writeCapability}`);
    const shouldAllowWriteCapabilityEditing = useMemo(() => ReportUtils.canEditWriteCapability(report, linkedWorkspace), [report, linkedWorkspace]);
    const shouldAllowChangeVisibility = useMemo(() => ReportUtils.canEditRoomVisibility(report, linkedWorkspace), [report, linkedWorkspace]);

    const shouldShowNotificationPref = !isMoneyRequestReport && report?.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;

    const shouldShowWriteCapability = !isMoneyRequestReport;

    return (
        <ScreenWrapper testID={ReportSettingsPage.displayName}>
            <FullPageNotFoundView shouldShow={shouldDisableSettings}>
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID))}
                />
                <ScrollView style={[styles.flex1]}>
                    {shouldShowNotificationPref && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={notificationPreference}
                            description={translate('notificationPreferencesPage.label')}
                            onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(reportID))}
                        />
                    )}
                    {shouldShowWriteCapability &&
                        (shouldAllowWriteCapabilityEditing ? (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={writeCapabilityText}
                                description={translate('writeCapabilityPage.label')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY.getRoute(reportID))}
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
                                onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_VISIBILITY.getRoute(report.reportID))}
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
