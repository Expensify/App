import React from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles, {getSafeAreaMargins} from '../../../style/StyleSheet';
import Text from '../../../components/Text';
import AppLinks from './AppLinks';
import {signOut} from '../../../lib/actions/Session';
import IONKEYS from '../../../IONKEYS';
import {fetch as getPersonalDetails} from '../../../lib/actions/PersonalDetails';
import WithIon from '../../../components/WithIon';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';

const propTypes = {
    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    /* Ion Props */

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Display name of the current user from their personal details
        userDisplayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatarURL: PropTypes.string,
    }),

    // Is this person offline?
    isOffline: PropTypes.bool,
};

const defaultProps = {
    myPersonalDetails: {},
    isOffline: false,
};

const SidebarBottom = ({myPersonalDetails, isOffline, insets}) => {
    const indicatorStyles = [
        styles.statusIndicator,
        isOffline ? styles.statusIndicatorOffline : styles.statusIndicatorOnline
    ];
    return (
        <View style={[styles.sidebarFooter, getSafeAreaMargins(insets)]}>
            <View style={[styles.sidebarFooterAvatar]}>
                <Image
                    source={{uri: myPersonalDetails.avatarURL}}
                    style={[styles.historyItemAvatar]}
                />
                <View style={indicatorStyles} />
            </View>
            <View style={[styles.flexColumn]}>
                {myPersonalDetails.userDisplayName && (
                    <Text style={[styles.sidebarFooterUsername]}>
                        {myPersonalDetails.userDisplayName}
                    </Text>
                )}
                <View style={[styles.flexRow]}>
                    <AppLinks />
                    <Text style={[styles.sidebarFooterLink]} onPress={signOut}>Sign Out</Text>
                </View>
            </View>
        </View>
    );
};

SidebarBottom.propTypes = propTypes;
SidebarBottom.defaultProps = defaultProps;
SidebarBottom.displayName = 'SidebarBottom';

export default WithIon({
    // Map this.props.userDisplayName to the personal details key in the store and bind it to the displayName property
    // and load it with data from getPersonalDetails()
    myPersonalDetails: {
        key: IONKEYS.MY_PERSONAL_DETAILS,
        loader: getPersonalDetails,
    },
    isOffline: {
        key: IONKEYS.NETWORK,
        path: 'isOffline',
        defaultValue: false,
    },
})(SidebarBottom);
