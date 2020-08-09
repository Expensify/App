import React from 'react';
import {Text} from 'react-native-web';
import {Button, View} from 'react-native';
import {signOut} from '../../store/actions/SessionActions';
import {fetch as getPersonalDetails} from '../../store/actions/PersonalDetailsActions';
import styles from '../../style/StyleSheet';
import STOREKEYS from '../../store/STOREKEYS';
import WithStoreSubscribeToState from '../../components/WithStoreSubscribeToState';

class Header extends React.Component {
    render() {
        return (
            <View style={styles.nav}>
                <Text style={styles.brand}>Expensify Chat</Text>
                <Text style={styles.flex1} />
                {this.state && this.state.name && (
                    <Text style={[styles.navText, styles.mr1]}>
                        {`Welcome ${this.state.name}!`}
                    </Text>
                )}
                <Button onPress={signOut} title="Sign Out" />
            </View>
        );
    }
}

export default WithStoreSubscribeToState({
    // Map this.state.name to the personal details key in the store and bind it to the displayName property
    // and load it with data from getPersonalDetails()
    name: {key: STOREKEYS.MY_PERSONAL_DETAILS, path: 'displayName', loader: getPersonalDetails},
})(Header);
