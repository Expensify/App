import React from 'react';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as ReportUtils from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';

const propTypes = {
    ...withLocalizePropTypes,

    /** The report for which we are setting notification preferences */
    report: reportPropTypes.isRequired,
};

function NotificationPreferencePage(props) {
    const shouldDisableNotificationPreferences = ReportUtils.isArchivedRoom(props.report);
    const notificationPreferenceOptions = _.map(
        _.filter(_.values(CONST.REPORT.NOTIFICATION_PREFERENCE), (pref) => pref !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN),
        (preference) => ({
            value: preference,
            text: props.translate(`notificationPreferencesPage.notificationPreferences.${preference}`),
            keyForList: preference,
            isSelected: preference === props.report.notificationPreference,
        }),
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={NotificationPreferencePage.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableNotificationPreferences}>
                <HeaderWithBackButton
                    title={props.translate('notificationPreferencesPage.header')}
                    onBackButtonPress={() => ReportUtils.goBackToDetailsPage(props.report)}
                />
                <SelectionList
                    sections={[{data: notificationPreferenceOptions}]}
                    onSelectRow={(option) =>
                        Report.updateNotificationPreference(props.report.reportID, props.report.notificationPreference, option.value, true, undefined, undefined, props.report)
                    }
                    initiallyFocusedOptionKey={_.find(notificationPreferenceOptions, (locale) => locale.isSelected).keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

NotificationPreferencePage.displayName = 'NotificationPreferencePage';
NotificationPreferencePage.propTypes = propTypes;

export default compose(withLocalize, withReportOrNotFound())(NotificationPreferencePage);
