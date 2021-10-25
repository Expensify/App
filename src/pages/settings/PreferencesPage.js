import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import LocalePicker from '../../components/LocalePicker';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import NameValuePair from '../../libs/actions/NameValuePair';
import CONST from '../../CONST';
import {setExpensifyNewsStatus, setShouldUseSecureStaging} from '../../libs/actions/User';
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

const PreferencesPage = ({
    priorityMode, user, translate, environment,
}) => {
    const priorityModes = {
        default: {
            value: CONST.PRIORITY_MODE.DEFAULT,
            label: translate('preferencesPage.mostRecent'),
            description: translate('preferencesPage.mostRecentModeDescription'),
        },
        gsd: {
            value: CONST.PRIORITY_MODE.GSD,
            label: translate('preferencesPage.focus'),
            description: translate('preferencesPage.focusModeDescription'),
        },
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('common.preferences')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <View style={styles.pageWrapper}>
                <View style={[styles.settingsPageBody, styles.mb6]}>
                    <Text style={[styles.formLabel]} numberOfLines={1}>
                        {translate('common.notifications')}
                    </Text>
                    <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween]}>
                        <View style={styles.flex4}>
                            <Text>
                                {translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                            </Text>
                        </View>
                        <View style={[styles.flex1, styles.alignItemsEnd]}>
                            <Switch
                                isOn={lodashGet(user, 'expensifyNewsStatus', true)}
                                onToggle={setExpensifyNewsStatus}
                            />
                        </View>
                    </View>
                    <View style={[styles.mb2, styles.w100]}>
                        <ExpensiPicker
                            label={translate('preferencesPage.priorityMode')}
                            onChange={
                                mode => NameValuePair.set(CONST.NVP.PRIORITY_MODE, mode, ONYXKEYS.NVP_PRIORITY_MODE)
                            }
                            items={Object.values(priorityModes)}
                            value={priorityMode}
                        />
                    </View>
                    <Text style={[styles.textLabel, styles.colorMuted, styles.mb6]}>
                        {priorityModes[priorityMode].description}
                    </Text>
                    <View style={[styles.mb2]}>
                        <LocalePicker />
                    </View>

                    {/* If we are in the staging environment then we have the option to switch from using the staging secure endpoint or the production secure endpoint. This enables QA */}
                    {/* and internal testers to take advantage of sandbox environments for 3rd party services like Plaid and Onfido */}
                    {environment === CONST.ENVIRONMENT.STAGING && (
                        <>
                            <Text style={[styles.formLabel]} numberOfLines={1}>
                                Test Preferences
                            </Text>
                            <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween]}>
                                <View style={styles.flex4}>
                                    <Text>
                                        Use Secure Staging Server
                                    </Text>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        isOn={user.shouldUseSecureStaging || false}
                                        onToggle={setShouldUseSecureStaging}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </View>
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
