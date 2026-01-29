import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getReportNotificationPreference, goBackToDetailsPage, isArchivedNonExpenseReport, isHiddenForCurrentUser, isMoneyRequestReport, isSelfDM} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import {updateNotificationPreference} from '@userActions/Report';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type NotificationPreferencePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES>;

function NotificationPreferencePage({report}: NotificationPreferencePageProps) {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES>>();
    const {translate} = useLocalize();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isMoneyRequest = isMoneyRequestReport(report);
    const currentNotificationPreference = getReportNotificationPreference(report);
    const shouldDisableNotificationPreferences =
        isArchivedNonExpenseReport(report, isReportArchived) || isSelfDM(report) || (!isMoneyRequest && isHiddenForCurrentUser(currentNotificationPreference));
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

    const updateNotificationPreferenceForReportAction = useCallback(
        (value: ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE>) => {
            updateNotificationPreference(report.reportID, currentNotificationPreference, value, currentUserAccountID, undefined, undefined);
            goBack();
        },
        [report.reportID, currentNotificationPreference, currentUserAccountID, goBack],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="NotificationPreferencePage"
        >
            <FullPageNotFoundView shouldShow={shouldDisableNotificationPreferences}>
                <HeaderWithBackButton
                    title={translate('notificationPreferencesPage.header')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    data={notificationPreferenceOptions}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => updateNotificationPreferenceForReportAction(option.value)}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={notificationPreferenceOptions.find((locale) => locale.isSelected)?.keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(NotificationPreferencePage);
