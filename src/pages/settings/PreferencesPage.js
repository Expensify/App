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
import Icon from '../../components/Icon';
import NameValuePair from '../../libs/actions/NameValuePair';
import CONST from '../../CONST';
import {DownArrow} from '../../components/Icon/Expensicons';
import {setExpensifyNewsStatus} from '../../libs/actions/User';
import ScreenWrapper from '../../components/ScreenWrapper';
import Switch from '../../components/Switch';
import Picker from '../../components/Picker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import {translate} from '../../libs/translate';

const propTypes = {
    // The chat priority mode
    priorityMode: PropTypes.string,

    // The details about the user that is signed in
    user: PropTypes.shape({
        // Whether or not the user is subscribed to news updates
        expensifyNewsStatus: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    user: {},
};

const priorityModes = {
    default: {
        value: CONST.PRIORITY_MODE.DEFAULT,
        label: translate(ONYXKEYS.PREFERRED_LOCALE, 'mostRecent'),
        description: translate(ONYXKEYS.PREFERRED_LOCALE, 'mostRecentModeDescription'),
    },
    gsd: {
        value: CONST.PRIORITY_MODE.GSD,
        label: translate(ONYXKEYS.PREFERRED_LOCALE, 'focus'),
        description: translate(ONYXKEYS.PREFERRED_LOCALE, 'focusModeDescription'),
    },
};


const PreferencesPage = ({priorityMode, user, translations}) => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={translations.translate('preferences')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
        <View style={styles.pageWrapper}>
            <View style={[styles.settingsPageBody, styles.mb6]}>
                <Text style={[styles.formLabel]} numberOfLines={1}>{translations.translate('notifications')}</Text>
                <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween]}>
                    <View style={styles.flex4}>
                        <Text>
                            {translations.translate('receiveRelevantFeatureUpdatesAndExpensifyNews')}
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
                    {translations.translate('priorityMode')}
                </Text>
                <View style={[styles.mb2]}>
                    <Picker
                        onChange={
                            mode => NameValuePair.set(CONST.NVP.PRIORITY_MODE, mode, ONYXKEYS.NVP_PRIORITY_MODE)
                        }
                        items={Object.values(priorityModes)}
                        value={priorityMode}
                        icon={() => <Icon src={DownArrow} />}
                    />
                </View>
                <Text style={[styles.textLabel, styles.colorMuted]}>
                    {priorityModes[priorityMode].description}
                </Text>
            </View>
        </View>
    </ScreenWrapper>
);

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
    }),
)(PreferencesPage);
