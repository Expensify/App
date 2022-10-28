import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import LocalePicker from '../../components/LocalePicker';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import CONST from '../../CONST';
import * as User from '../../libs/actions/User';
import ScreenWrapper from '../../components/ScreenWrapper';
import Switch from '../../components/Switch';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import Picker from '../../components/Picker';
import withEnvironment, {environmentPropTypes} from '../../components/withEnvironment';
import TestToolMenu from '../../components/TestToolMenu';
import withTheme from '../../components/withThemeColors';
import * as App from '../../libs/actions/App';

const propTypes = {
    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        isSubscribedToNewsletter: PropTypes.bool,
        shouldUseStagingServer: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
    ...environmentPropTypes,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    user: {},
};

const PreferencesPage = (props) => {
    const priorityModes = {
        default: {
            value: CONST.PRIORITY_MODE.DEFAULT,
            label: props.translate('preferencesPage.mostRecent'),
            description: props.translate('preferencesPage.mostRecentModeDescription'),
        },
        gsd: {
            value: CONST.PRIORITY_MODE.GSD,
            label: props.translate('preferencesPage.focus'),
            description: props.translate('preferencesPage.focusModeDescription'),
        },
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('common.preferences')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={props.flex1} contentContainerStyle={props.p5}>
                <View style={[props.settingsPageBody, props.mb6]}>
                    <Text style={[props.formLabel]} numberOfLines={1}>
                        {props.translate('common.notifications')}
                    </Text>
                    <View style={[props.flexRow, props.mb6, props.justifyContentBetween]}>
                        <View style={[props.flex4, props.text]}>
                            <Text>
                                {props.translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                            </Text>
                        </View>
                        <View style={[props.flex1, props.alignItemsEnd]}>
                            <Switch
                                isOn={lodashGet(props.user, 'isSubscribedToNewsletter', true)}
                                onToggle={User.updateNewsletterSubscription}
                            />
                        </View>
                    </View>
                    <View style={[props.mb2, props.w100]}>
                        <Picker
                            label={props.translate('preferencesPage.priorityMode')}
                            onInputChange={
                                mode => User.updateChatPriorityMode(mode)
                            }
                            items={_.values(priorityModes)}
                            value={props.priorityMode}
                        />
                    </View>
                    <Text style={[props.textLabel, props.colorMuted, props.mb6]}>
                        {priorityModes[props.priorityMode].description}
                    </Text>
                    <View style={[props.mb2]}>
                        <LocalePicker />
                    </View>

                    {/* If we are in the staging environment then we enable additional test features */}
                    {_.contains([CONST.ENVIRONMENT.STAGING, CONST.ENVIRONMENT.DEV], props.environment) && <TestToolMenu />}
                </View>
                <View style={[props.flexRow, props.justifyContentBetween]}>
                    <Text>DARK MODE:</Text>
                    <Switch
                        isOn={props.preferredTheme}
                        onToggle={App.setTheme}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

PreferencesPage.propTypes = propTypes;
PreferencesPage.defaultProps = defaultProps;
PreferencesPage.displayName = 'PreferencesPage';

export default compose(
    withEnvironment,
    withLocalize,
    withTheme,
    withOnyx({
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        user: {
            key: ONYXKEYS.USER,
        },
        preferredTheme: {
            key: ONYXKEYS.NVP_PREFERRED_THEME,
        },
    }),
)(PreferencesPage);
