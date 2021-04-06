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

const propTypes = {
    // The chat priority mode
    priorityMode: PropTypes.string,

    // The details about the user that is signed in
    user: PropTypes.shape({
        // Whether or not the user is subscribed to news updates
        expensifyNewsStatus: PropTypes.bool,
    }),
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    user: {},
};

const priorityModes = {
    default: {
        value: CONST.PRIORITY_MODE.DEFAULT,
        label: 'Most Recent',
        description: 'This will display all chats by default, sorted by most recent, with pinned items at the top',
    },
    gsd: {
        value: CONST.PRIORITY_MODE.GSD,
        label: 'GSD',
        description: 'This will only display unread and pinned chats, all sorted alphabetically. Get Shit Done.',
    },
};


const PreferencesPage = ({priorityMode, user}) => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title="Preferences"
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={Navigation.dismissModal}
        />
        <View style={styles.pageWrapper}>
            <View style={[styles.settingsPageBody, styles.mb6]}>
                <Text style={[styles.formLabel]} numberOfLines={1}>Notifications</Text>
                <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween]}>
                    <View style={styles.flex4}>
                        <Text>
                            Receive relevant feature updates and Expensify news
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
                    Priority Mode
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

export default withOnyx({
    priorityMode: {
        key: ONYXKEYS.NVP_PRIORITY_MODE,
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(PreferencesPage);
