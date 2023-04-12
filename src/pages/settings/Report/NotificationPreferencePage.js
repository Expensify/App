import React, {Component} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Form from '../../../components/Form';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import TextInput from '../../../components/TextInput';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import * as Report from '../../../libs/actions/Report';
import OptionsSelector from '../../../components/OptionsSelector';

const propTypes = {
    ...withLocalizePropTypes,

    /* Onyx Props */
    /** The active report */
    report: reportPropTypes.isRequired,
};

class NotificationPreferencePage extends Component {
    constructor(props) {
        super(props);
        this.updateNotificationPreference = this.updateNotificationPreference.bind(this);
        this.getNotificationPreferenceOptions = this.getNotificationPreferenceOptions.bind(this);
    }

    getNotificationPreferenceOptions() {
        return [
            this.props.translate('notificationPreferences.immediately'),
            this.props.translate('notificationPreferences.daily'),
            this.props.translate('notificationPreferences.mute'),
        ];
    }

    /**
     * Submit form to update room's name
     * @param {Object} values
     * @param {String} values.notificationPreference
     */
    updateNotificationPreference(values) {
        Report.updateNotificationPreference(
            this.props.report.reportID,
            this.props.report.notificationPreference,
            values.notificationPreference,
        );
        Navigation.drawerGoBack(ROUTES.getReportSettingsRoute(this.props.report.reportID));
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('notificationPreferences.header')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.drawerGoBack(ROUTES.getReportSettingsRoute(this.props.report.reportID))}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />

                    <View style={styles.mb4}>
                        <OptionsSelector
                            textInputLabel={this.props.translate('notificationPreferences.label')}
                            value={this.props.report.notificationPreference}
                            onSelectRow={this.updateNotificationPreference}
                            optionHoveredStyle={styles.hoveredComponentBG}
                            sections={[{data: this.getNotificationPreferenceOptions(), indexOffset: 0, isDisabled: false}]}
                            shouldHaveOptionSeparator
                        />
                    </View>
            </ScreenWrapper>
        );
    }
}

NotificationPreferencePage.propTypes = propTypes;

export default compose(
    withLocalize,
    withReportOrNotFound,
)(NotificationPreferencePage);
