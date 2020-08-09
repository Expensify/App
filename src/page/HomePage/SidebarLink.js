import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import _ from 'underscore';
import {Link} from '../../lib/Router';
import * as Store from '../../store/Store';
import STOREKEYS from '../../store/STOREKEYS';
import WithStoreSubscribeToState from '../../components/WithStoreSubscribeToState';

const propTypes = {
    // The ID of the report for this link
    reportID: PropTypes.number.isRequired,

    // The name of the report to use as the text for this link
    reportName: PropTypes.string.isRequired,
};

class SidebarLink extends React.Component {
    constructor(props) {
        super(props);

        this.subscriptionIDS = [];

        this.state = {
            hasUnread: false,
        };
    }

    componentDidMount() {
        this.subscriptionIDS.push(Store.bind(`${STOREKEYS.REPORT}_${this.props.reportID}`, 'hasUnread', 'hasUnread', false, this));
    }

    componentWillUnmount() {
        _.each(this.subscriptionIDS, Store.unsubscribeFromState);
    }

    render() {
        return (
            <View>
                <Link to={`/${this.props.reportID}`} style={{padding: 10, textDecorationLine: 'none'}}>
                    <Text>{this.props.reportName}</Text>
                    {this.state.hasUnread && (
                        <Text>- Unread</Text>
                    )}
                </Link>
            </View>
        );
    }
}
SidebarLink.propTypes = propTypes;

export default WithStoreSubscribeToState()(SidebarLink);
