import React from 'react';
import _ from 'underscore';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import * as Report from '../../../libs/actions/Report';
import * as ReportUtils from '../../../libs/ReportUtils';
import SelectionList from '../../../components/SelectionList';

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
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(props.report.reportID))}
                />
                <SelectionList
                    sections={[{data: notificationPreferenceOptions}]}
                    onSelectRow={(option) => Report.updateNotificationPreference(props.report.reportID, props.report.notificationPreference, option.value, true)}
                    initiallyFocusedOptionKey={_.find(notificationPreferenceOptions, (locale) => locale.isSelected).keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

NotificationPreferencePage.displayName = 'NotificationPreferencePage';
NotificationPreferencePage.propTypes = propTypes;

export default compose(withLocalize, withReportOrNotFound)(NotificationPreferencePage);
