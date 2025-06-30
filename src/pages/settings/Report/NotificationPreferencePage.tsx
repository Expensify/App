import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getReportNotificationPreference,
    goBackToDetailsPage,
    isArchivedNonExpenseReport,
    isHiddenForCurrentUser,
    isMoneyRequestReport as isMoneyRequestReportUtils,
    isSelfDM,
} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import {updateNotificationPreference as updateNotificationPreferenceReportActionUtils} from '@userActions/Report';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type NotificationPreferencePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES>;

function NotificationPreferencePage({report}: NotificationPreferencePageProps) {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES>>();
    const {translate} = useLocalize();
    const isMoneyRequestReport = isMoneyRequestReportUtils(report);
    const currentNotificationPreference = getReportNotificationPreference(report);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const shouldDisableNotificationPreferences =
        isArchivedNonExpenseReport(report, isReportArchived) || isSelfDM(report) || (!isMoneyRequestReport && isHiddenForCurrentUser(currentNotificationPreference));
    const notificationPreferenceOptions = Object.values(CONST.REPORT.NOTIFICATION_PREFERENCE)
        .filter((pref) => !isHiddenForCurrentUser(pref))
        .map((preference) => ({
            value: preference,
            text: translate(`notificationPreferencesPage.notificationPreferences.${preference}`),
            keyForList: preference,
            isSelected: preference === currentNotificationPreference,
        }));

    const goBack = useCallback(() => {
        goBackToDetailsPage(report, route.params.backTo);
    }, [report, route.params.backTo]);

    const updateNotificationPreference = useCallback(
        (value: ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE>) => {
            updateNotificationPreferenceReportActionUtils(report.reportID, currentNotificationPreference, value, undefined, undefined);
            goBack();
        },
        [report.reportID, currentNotificationPreference, goBack],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={NotificationPreferencePage.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableNotificationPreferences}>
                <HeaderWithBackButton
                    title={translate('notificationPreferencesPage.header')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    sections={[{data: notificationPreferenceOptions}]}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => updateNotificationPreference(option.value)}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={notificationPreferenceOptions.find((locale) => locale.isSelected)?.keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

NotificationPreferencePage.displayName = 'NotificationPreferencePage';

export default withReportOrNotFound()(NotificationPreferencePage);
