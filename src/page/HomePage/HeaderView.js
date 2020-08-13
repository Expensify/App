import React from 'react';
import {View, Button} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../style/StyleSheet';
import IONKEYS from '../../IONKEYS';
import WithIon from '../../components/WithIon';
import {withRouter} from '../../lib/Router';

const propTypes = {
    // Toggles the hamburger menu open and closed
    toggleHamburger: PropTypes.func.isRequired,
};

class HeaderView extends React.Component {
    render() {
        return (
            <View style={[styles.appContentHeader, styles.flexRow, styles.flexWrap]}>
                <Button
                    onPress={() => {
                        this.props.toggleHamburger();
                    }}
                    title="="
                />
                {this.state && this.state.reportName && (
                    <Text style={[styles.navText]}>
                        {this.state.reportName}
                    </Text>
                )}
            </View>
        );
    }
}

export default withRouter(WithIon({
    // Map this.state.reportName to the data for a specific report in the store, and bind it to the reportName property
    // It uses the data returned from the props path (ie. the reportID) to replace %DATAFROMPROPS% in the key it
    // binds to
    reportName: {
        // Note the trailing $ so that this component only binds to the specific report and no other report keys
        // like report_history_1234
        key: `${IONKEYS.REPORT}_%DATAFROMPROPS%$`,
        path: 'reportName',
        prefillWithKey: `${IONKEYS.REPORT}_%DATAFROMPROPS%`,
        pathForProps: 'match.params.reportID',
    },
})(HeaderView));

HeaderView.propTypes = propTypes;
