import React from 'react';
import {Image, View, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import styles, {getSafeAreaMargins} from '../../../styles/styles';
import Text from '../../../components/Text';
import AppLinks from './AppLinks';
import {signOut} from '../../../libs/actions/Session';
import ONYXKEYS from '../../../ONYXKEYS';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';

const propTypes = {
    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    /* Onyx Props */

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatarURL: PropTypes.string,
    }),

    // Information about the network
    network: PropTypes.shape({
        // Is the network currently offline or not
        isOffline: PropTypes.bool,
    })
};

const defaultProps = {
    myPersonalDetails: {},
    network: null,
};

const SidebarBottom = ({myPersonalDetails, network, insets}) => {
    const indicatorStyles = [
        styles.statusIndicator,
        network && network.isOffline ? styles.statusIndicatorOffline : styles.statusIndicatorOnline
    ];

    // On the very first sign in or after clearing storage these
    // details will not be present on the first render so we'll just
    // return nothing for now.
    if (!myPersonalDetails || _.isEmpty(myPersonalDetails)) {
        return null;
    }

    return (
        <View style={[styles.sidebarFooter, getSafeAreaMargins(insets)]}>
            <View style={[styles.sidebarFooterAvatar]}>
                <Image
                    source={{uri: myPersonalDetails.avatarURL}}
                    style={[styles.actionAvatar]}
                />
                <View style={StyleSheet.flatten(indicatorStyles)} />
            </View>
            <View style={[styles.flexColumn]}>
                {myPersonalDetails.displayName && (
                    <Text style={[styles.sidebarFooterUsername]}>
                        {myPersonalDetails.displayName}
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

export default withOnyx({
    myPersonalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
    network: {key: ONYXKEYS.NETWORK},
})(SidebarBottom);
