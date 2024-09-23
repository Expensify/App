import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type NotificationPreferencePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES>;

function NotificationPreferencePage({report}: NotificationPreferencePageProps) {
    const {translate} = useLocalize();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID || -1}`);
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentNotificationPreference = ReportUtils.getReportNotificationPreference(report);
    const shouldDisableNotificationPreferences =
        ReportUtils.isArchivedRoom(report, reportNameValuePairs) ||
        ReportUtils.isSelfDM(report) ||
        (!isMoneyRequestReport && currentNotificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);
    const notificationPreferenceOptions = Object.values(CONST.REPORT.NOTIFICATION_PREFERENCE)
        .filter((pref) => pref !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN)
        .map((preference) => ({
            value: preference,
            text: translate(`notificationPreferencesPage.notificationPreferences.${preference}`),
            keyForList: preference,
            isSelected: preference === currentNotificationPreference,
        }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={NotificationPreferencePage.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableNotificationPreferences}>
                <HeaderWithBackButton
                    title={translate('notificationPreferencesPage.header')}
                    onBackButtonPress={() => ReportUtils.goBackToDetailsPage(report)}
                />
                <SelectionList
                    sections={[{data: notificationPreferenceOptions}]}
                    ListItem={RadioListItem}
                    onSelectRow={(option) =>
                        report && ReportActions.updateNotificationPreference(report.reportID, currentNotificationPreference, option.value, true, undefined, undefined, report)
                    }
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={notificationPreferenceOptions.find((locale) => locale.isSelected)?.keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

NotificationPreferencePage.displayName = 'NotificationPreferencePage';

export default withReportOrNotFound()(NotificationPreferencePage);
