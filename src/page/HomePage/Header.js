import React from 'react';
import {Text} from 'react-native-web';
import {Button, View} from 'react-native';
import {signOut} from '../../store/actions/SessionActions';
import styles from '../../style/StyleSheet';

export default class Header extends React.Component {
    render() {
        return (
            <View style={styles.nav}>
                <Text style={styles.brand}>Expensify Chat</Text>
                <Text style={styles.flex1} />
                <Button onPress={signOut} title="Sign Out" />
            </View>
        );
    }
}
