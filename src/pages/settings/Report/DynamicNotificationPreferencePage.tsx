import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import Navigation from '@libs/Navigation/Navigation';
import {getReportNotificationPreference, isArchivedNonExpenseReport, isHiddenForCurrentUser, isMoneyRequestReport, isSelfDM} from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import {updateNotificationPreference} from '@userActions/Report';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type DynamicNotificationPreferencePageProps = WithReportOrNotFoundProps;

function DynamicNotificationPreferencePage({report}: DynamicNotificationPreferencePageProps) {
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
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.NOTIFICATION_PREFERENCES.path);

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

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

export default withReportOrNotFound()(DynamicNotificationPreferencePage);
