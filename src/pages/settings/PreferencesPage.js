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
import ExpensifyText from '../../components/ExpensifyText';
import NameValuePair from '../../libs/actions/NameValuePair';
import CONST from '../../CONST';
import * as User from '../../libs/actions/User';
import ScreenWrapper from '../../components/ScreenWrapper';
import Switch from '../../components/Switch';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import ExpensiPicker from '../../components/ExpensiPicker';
import withEnvironment, {environmentPropTypes} from '../../components/withEnvironment';

const propTypes = {
    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        expensifyNewsStatus: PropTypes.bool,
        shouldUseSecureStaging: PropTypes.bool,
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
            <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                <View style={[styles.settingsPageBody, styles.mb6]}>
                    <ExpensifyText style={[styles.formLabel]} numberOfLines={1}>
                        {props.translate('common.notifications')}
                    </ExpensifyText>
                    <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween]}>
                        <View style={styles.flex4}>
                            <ExpensifyText>
                                {props.translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                            </ExpensifyText>
                        </View>
                        <View style={[styles.flex1, styles.alignItemsEnd]}>
                            <Switch
                                isOn={lodashGet(props.user, 'expensifyNewsStatus', true)}
                                onToggle={User.setExpensifyNewsStatus}
                            />
                        </View>
                    </View>
                    <View style={[styles.mb2, styles.w100]}>
                        <ExpensiPicker
                            label={props.translate('preferencesPage.priorityMode')}
                            onChange={
                                mode => NameValuePair.set(CONST.NVP.PRIORITY_MODE, mode, ONYXKEYS.NVP_PRIORITY_MODE)
                            }
                            items={_.values(priorityModes)}
                            value={props.priorityMode}
                        />
                    </View>
                    <ExpensifyText style={[styles.textLabel, styles.colorMuted, styles.mb6]}>
                        {priorityModes[props.priorityMode].description}
                    </ExpensifyText>
                    <View style={[styles.mb2]}>
                        <LocalePicker />
                    </View>

                    {/* If we are in the staging environment then we have the option to switch from using the staging secure endpoint or the production secure endpoint. This enables QA */}
                    {/* and internal testers to take advantage of sandbox environments for 3rd party services like Plaid and Onfido */}
                    {props.environment === CONST.ENVIRONMENT.STAGING && (
                        <>
                            <ExpensifyText style={[styles.formLabel]} numberOfLines={1}>
                                Test Preferences
                            </ExpensifyText>
                            <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween]}>
                                <View style={styles.flex4}>
                                    <ExpensifyText>
                                        Use Secure Staging Server
                                    </ExpensifyText>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        isOn={props.user.shouldUseSecureStaging || false}
                                        onToggle={User.setShouldUseSecureStaging}
                                    />
                                </View>
                            </View>
                        </>
                    )}
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
    withOnyx({
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(PreferencesPage);
