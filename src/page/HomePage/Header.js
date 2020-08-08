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

        this.updatePersonalDetails = this.updatePersonalDetails.bind(this);

        this.state = {
            personalDetails: null,
        };
    }

    componentDidMount() {
        Store.subscribe(STOREKEYS.MY_PERSONAL_DETAILS, this.updatePersonalDetails);

        // Get our personal details
        getPersonalDetails();
    }

    /**
     * When there are new personal details, update our state with them
     *
     * @param {Object} newPersonalDetails
     */
    updatePersonalDetails(newPersonalDetails) {
        this.setState({personalDetails: newPersonalDetails});
    }

    render() {
        return (
            <View style={styles.nav}>
                <Text style={styles.brand}>Expensify Chat</Text>
                <Text style={styles.flex1} />
                {this.state.personalDetails && (
                    <Text style={[styles.navText, styles.mr1]}>Welcome {this.state.personalDetails.displayName}!</Text>
                )}
                <Button onPress={signOut} title="Sign Out" />
            </View>
        );
    }
}
