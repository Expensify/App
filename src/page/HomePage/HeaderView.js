import React from 'react';
import {Button, View, Text} from 'react-native';
import {signOut} from '../../store/actions/SessionActions';
import {fetch as getPersonalDetails} from '../../store/actions/PersonalDetailsActions';
import styles from '../../style/StyleSheet';
import STOREKEYS from '../../store/STOREKEYS';
import WithStore from '../../components/WithStore';
import {withRouter} from '../../lib/Router';

class HeaderView extends React.Component {
    render() {
        return (
            <View style={[styles.nav, styles.flexRow, styles.flexWrap]}>
                <Text style={styles.brand}>Expensify Chat</Text>
                {this.state && this.state.reportName && (
                    <Text style={[styles.navText, styles.ml1]}>
                        {this.state.reportName}
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

export default withRouter(WithStore({
    // Map this.state.userDisplayName to the personal details key in the store and bind it to the displayName property
    // and load it with data from getPersonalDetails()
    userDisplayName: {
        key: STOREKEYS.MY_PERSONAL_DETAILS,
        path: 'displayName',
        loader: getPersonalDetails,
        prefillWithKey: STOREKEYS.MY_PERSONAL_DETAILS,
    },

    // Map this.state.reportName to the data for a specific report in the store, and bind it to the reportName property
    // It uses the data returned from the props path (ie. the reportID) to replace %DATAFROMPROPS% in the key it
    // binds to
    reportName: {
        // Note the trailing $ so that this component only binds to the specific report and no other report keys
        // like report_history_1234
        key: `${STOREKEYS.REPORT}_%DATAFROMPROPS%$`,
        path: 'reportName',
        prefillWithKey: `${STOREKEYS.REPORT}_%DATAFROMPROPS%`,
        pathForProps: 'match.params.reportID',
    },
})(HeaderView));
