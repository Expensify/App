import React from 'react';
import {Button, View, Text} from 'react-native';
import {signOut} from '../../store/actions/SessionActions';
import {fetch as getPersonalDetails} from '../../store/actions/PersonalDetailsActions';
import styles from '../../style/StyleSheet';
import STOREKEYS from '../../store/STOREKEYS';
import WithStoreSubscribeToState from '../../components/WithStoreSubscribeToState';

class HeaderView extends React.Component {
    render() {
        return (
            <View style={[styles.nav, styles.flexRow]}>
                <Text style={styles.brand}>Expensify Chat</Text>
                {this.state && this.state.currentReportName && (
                    <Text style={[styles.navText, styles.ml1]}>
                        {this.state.currentReportName}
                    </Text>
                )}
                <Text style={styles.flex1} />
                {this.state && this.state.userDisplayName && (
                    <Text style={[styles.navText, styles.mr1]}>
                        {`Welcome ${this.state.userDisplayName}!`}
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
    userDisplayName: {key: STOREKEYS.MY_PERSONAL_DETAILS, path: 'displayName', loader: getPersonalDetails},
    currentReportName: {key: STOREKEYS.CURRENT_REPORT, path: 'reportName'},
})(HeaderView);
