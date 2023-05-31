import React from 'react';
import _ from 'underscore';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import OptionsList from '../../../components/OptionsList';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import * as Report from '../../../libs/actions/Report';
import * as Expensicons from '../../../components/Icon/Expensicons';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    ...withLocalizePropTypes,

    /** The report for which we are setting notification preferences */
    report: reportPropTypes.isRequired,
};
const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const NotificationPreferencePage = (props) => {
    const notificationPreferenceOptions = _.map(props.translate('notificationPreferencesPage.notificationPreferences'), (preference, key) => ({
        value: key,
        text: preference,
        keyForList: key,

        // Include the green checkmark icon to indicate the currently selected value
        customIcon: key === props.report.notificationPreference ? greenCheckmark : null,

        // This property will make the currently selected value have bold text
        boldStyle: key === props.report.notificationPreference,
    }));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('notificationPreferencesPage.header')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.getReportSettingsRoute(props.report.reportID))}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
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
        </ScreenWrapper>
    );
};

NotificationPreferencePage.displayName = 'NotificationPreferencePage';
NotificationPreferencePage.propTypes = propTypes;

export default compose(withLocalize, withReportOrNotFound)(NotificationPreferencePage);
