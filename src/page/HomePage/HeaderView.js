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
                <Text style={styles.flex1} />
                {this.state && this.state.activeReportName && (
                    <Text style={[styles.navText]}>
                        {this.state.activeReportName}
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
    activeReportName: {key: STOREKEYS.ACTIVE_REPORT, path: 'reportName'},
})(HeaderView);
