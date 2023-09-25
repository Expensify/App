import React from 'react';
import _ from 'underscore';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import OptionsList from '../../../components/OptionsList';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import * as Report from '../../../libs/actions/Report';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as Expensicons from '../../../components/Icon/Expensicons';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    ...withLocalizePropTypes,

    /** The report for which we are setting notification preferences */
    report: reportPropTypes.isRequired,
};
const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

function NotificationPreferencePage(props) {
    const shouldDisableNotificationPreferences = ReportUtils.shouldDisableSettings(props.report) || ReportUtils.isArchivedRoom(props.report);
    const notificationPreferenceOptions = _.map(
        _.filter(_.values(CONST.REPORT.NOTIFICATION_PREFERENCE), (pref) => pref !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN),
        (preference) => ({
            value: preference,
            text: props.translate(`notificationPreferencesPage.notificationPreferences.${preference}`),
            keyForList: preference,

            // Include the green checkmark icon to indicate the currently selected value
            customIcon: preference === props.report.notificationPreference ? greenCheckmark : null,

            // This property will make the currently selected value have bold text
            boldStyle: preference === props.report.notificationPreference,
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
                <OptionsList
                    sections={[{data: notificationPreferenceOptions}]}
                    onSelectRow={(option) => Report.updateNotificationPreferenceAndNavigate(props.report.reportID, props.report.notificationPreference, option.value)}
                    hideSectionHeaders
                    optionHoveredStyle={{
                        ...styles.hoveredComponentBG,
                        ...styles.mhn5,
                        ...styles.ph5,
                    }}
                    shouldHaveOptionSeparator
                    shouldDisableRowInnerPadding
                    contentContainerStyles={[styles.ph5]}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

NotificationPreferencePage.displayName = 'NotificationPreferencePage';
NotificationPreferencePage.propTypes = propTypes;

export default compose(withLocalize, withReportOrNotFound)(NotificationPreferencePage);
