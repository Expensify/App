import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

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

import type {ValueOf} from 'type-fest';

import React, {useCallback, useState} from 'react';

type DynamicNotificationPreferencePageProps = WithReportOrNotFoundProps;

function DynamicNotificationPreferencePage({report}: DynamicNotificationPreferencePageProps) {
    const {translate} = useLocalize();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isMoneyRequest = isMoneyRequestReport(report);
    const currentNotificationPreference = getReportNotificationPreference(report);

    const [draftNotificationPreference, setDraftNotificationPreference] = useState<ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE> | undefined>(undefined);
    const selectedNotificationPreference = draftNotificationPreference ?? currentNotificationPreference;
    const shouldDisableNotificationPreferences =
        isArchivedNonExpenseReport(report, isReportArchived) || isSelfDM(report) || (!isMoneyRequest && isHiddenForCurrentUser(currentNotificationPreference));
    const notificationPreferenceOptions = Object.values(CONST.REPORT.NOTIFICATION_PREFERENCE)
        .filter((pref) => !isHiddenForCurrentUser(pref))
        .map((preference) => ({
            value: preference,
            text: translate(`notificationPreferencesPage.notificationPreferences.${preference}`),
            keyForList: preference,
            isSelected: preference === selectedNotificationPreference,
        }));
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.NOTIFICATION_PREFERENCES.path);

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const saveNotificationPreference = () => {
        updateNotificationPreference(report.reportID, currentNotificationPreference, selectedNotificationPreference, currentUserAccountID, undefined, undefined);
        goBack();
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveNotificationPreference,
        isDisabled: selectedNotificationPreference === currentNotificationPreference,
    };

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
                    ListItem={SingleSelectListItem}
                    onSelectRow={(option) => setDraftNotificationPreference(option.value)}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={currentNotificationPreference}
                    addBottomSafeAreaPadding
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicNotificationPreferencePage);
