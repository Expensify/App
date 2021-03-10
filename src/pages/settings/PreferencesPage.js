import React from 'react';
import {View} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import HeaderGap from '../../components/HeaderGap';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import NameValuePair from '../../libs/actions/NameValuePair';
import CONST from '../../CONST';
import {DownArrow} from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';

const propTypes = {
    // The chat priority mode
    priorityMode: PropTypes.string,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
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

const PreferencesPage = ({priorityMode}) => (
    <ScreenWrapper>
        {() => (
            <>
                <HeaderWithCloseButton
                    title="Preferences"
                    shouldShowBackButton
                    onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={styles.pageWrapper}>
                    <View style={[styles.settingsPageBody, styles.mb6]}>
                        <Text style={[styles.formLabel]} numberOfLines={1}>
                            Priority Mode
                        </Text>
                        <View style={[styles.mb2]}>
                            {/* empty object in placeholder below to prevent default */}
                            {/* placeholder from appearing as a selection option. */}
                            <RNPickerSelect
                                onValueChange={
                                    mode => NameValuePair.set(CONST.NVP.PRIORITY_MODE, mode, ONYXKEYS.PRIORITY_MODE)
                                }
                                items={Object.values(priorityModes)}
                                style={styles.picker}
                                useNativeAndroidPickerStyle={false}
                                placeholder={{}}
                                value={priorityMode}
                                Icon={() => <Icon src={DownArrow} />}
                            />
                        </View>
                        <Text style={[styles.textLabel, styles.colorMuted]}>
                            {priorityModes[priorityMode].description}
                        </Text>
                    </View>
                </View>
            </>
        )}
    </ScreenWrapper>
);

PreferencesPage.propTypes = propTypes;
PreferencesPage.defaultProps = defaultProps;
PreferencesPage.displayName = 'PreferencesPage';

export default withOnyx({
    priorityMode: {
        key: ONYXKEYS.PRIORITY_MODE,
    },
})(PreferencesPage);
