import React from 'react';
import {Text} from 'react-native-web';
import {Button, View} from 'react-native';
import * as Store from '../../store/Store';
import {signOut} from '../../store/actions/SessionActions';
import {fetch as getPersonalDetails} from '../../store/actions/PersonalDetailsActions';
import styles from '../../style/StyleSheet';
import STOREKEYS from '../../store/STOREKEYS';

export default class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            personalDetails: null,
        };
    }

    componentDidMount() {
        Store.subscribeToState(STOREKEYS.MY_PERSONAL_DETAILS, 'name', 'displayName', '', this);

        // Get our personal details
        getPersonalDetails();
    }

    componentWillUnmount() {
        Store.unsubscribeFromState(STOREKEYS.MY_PERSONAL_DETAILS, this);
    }

    render() {
        return (
            <View style={styles.nav}>
                <Text style={styles.brand}>Expensify Chat</Text>
                <Text style={styles.flex1} />
                {this.state.name && (
                    <Text style={[styles.navText, styles.mr1]}>
                        {`Welcome ${this.state.name}!`}
                    </Text>
                )}
                <Button onPress={signOut} title="Sign Out" />
            </View>
        );
    }
}
