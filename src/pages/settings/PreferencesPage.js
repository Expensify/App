import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import NameValuePair from '../../libs/actions/NameValuePair';
import CONST from '../../CONST';
import {setExpensifyNewsStatus} from '../../libs/actions/User';
import ScreenWrapper from '../../components/ScreenWrapper';
import Switch from '../../components/Switch';
import Picker from '../../components/Picker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        expensifyNewsStatus: PropTypes.bool,
    }),

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    user: {},
    preferredLocale: CONST.DEFAULT_LOCALE,
};

const PreferencesPage = ({
    priorityMode, user, translate, preferredLocale,
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

    const localesToLanguages = {
        default: {
            value: 'en',
            label: translate('preferencesPage.languages.english'),
        },
        es: {
            value: 'es',
            label: translate('preferencesPage.languages.spanish'),
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
                                isOn={user.expensifyNewsStatus ?? true}
                                onToggle={setExpensifyNewsStatus}
                            />
                        </View>
                    </View>
                    <Text style={[styles.formLabel]} numberOfLines={1}>
                        {translate('preferencesPage.priorityMode')}
                    </Text>
                    <View style={[styles.mb2]}>
                        <Picker
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
                    <Text style={[styles.formLabel]} numberOfLines={1}>
                        {translate('preferencesPage.language')}
                    </Text>
                    <View style={[styles.mb2]}>
                        <Picker
                            onChange={(locale) => {
                                if (locale !== preferredLocale) {
                                    NameValuePair.set(CONST.NVP.PREFERRED_LOCALE, locale, ONYXKEYS.NVP_PREFERRED_LOCALE);
                                }
                            }}
                            items={Object.values(localesToLanguages)}
                            value={preferredLocale}
                        />
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

PreferencesPage.propTypes = propTypes;
PreferencesPage.defaultProps = defaultProps;
PreferencesPage.displayName = 'PreferencesPage';

export default compose(
    withLocalize,
    withOnyx({
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        user: {
            key: ONYXKEYS.USER,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(PreferencesPage);
