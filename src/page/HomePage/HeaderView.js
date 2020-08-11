import React from 'react';
import PropTypes from 'prop-types';
import {Button, View, Text} from 'react-native';
import {withRouter} from '../../lib/Router';
import {signOut} from '../../store/actions/SessionActions';
import {fetch as getPersonalDetails} from '../../store/actions/PersonalDetailsActions';
import styles from '../../style/StyleSheet';
import STOREKEYS from '../../store/STOREKEYS';
import WithStore from '../../components/WithStore';

const propTypes = {
    // These are from WithStore
    bind: PropTypes.func.isRequired,
    unbind: PropTypes.func.isRequired,

    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object,
};

const defaultProps = {
    match: null,
};

class HeaderView extends React.Component {
    componentDidMount() {
        this.bindToStore();
    }

    componentDidUpdate(prevProps) {
        // If the report changed, then we need to re-bind to the store
        if (prevProps.match.params.reportID !== this.props.match.params.reportID) {
            this.props.unbind();
            this.bindToStore();
        }
    }

    /**
     * Bind our state to our store. This can't be done with an HOC because props can't be accessed to make the key
     */
    bindToStore() {
        const key = `${STOREKEYS.REPORT}_${this.props.match.params.reportID}`;
        this.props.bind({
            report: {
                // Bind to only the data for the report (which is why there is a $ at the end)
                key: `${key}$`,

                // Prefill it with the key of the report exactly
                // (because prefilling doesn't work with the regex patterns)
                prefillWithKey: key,
            }
        }, this);
    }

    render() {
        return (
            <View style={[styles.nav, styles.flexRow, styles.flexWrap]}>
                <Text style={styles.brand}>Expensify Chat</Text>
                {this.state && this.state.report && (
                    <Text style={[styles.navText, styles.ml1]}>
                        {this.state.report.reportName}
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

HeaderView.propTypes = propTypes;
HeaderView.defaultProps = defaultProps;

export default withRouter(WithStore({
    // Map this.state.name to the personal details key in the store and bind it to the displayName property
    // and load it with data from getPersonalDetails()
    userDisplayName: {
        key: STOREKEYS.MY_PERSONAL_DETAILS,
        path: 'displayName',
        loader: getPersonalDetails,
        prefillWithKey: STOREKEYS.MY_PERSONAL_DETAILS,
    },
})(HeaderView));
