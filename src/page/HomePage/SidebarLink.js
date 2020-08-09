import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {Link} from '../../lib/Router';
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

        this.state = {
            isUnread: false,
        };
    }

    componentDidMount() {
        this.props.bind(`${STOREKEYS.REPORT}_${this.props.reportID}`, 'hasUnread', false, 'isUnread', this);
    }

    render() {
        return (
            <View>
                <Link to={`/${this.props.reportID}`} style={{padding: 10, textDecorationLine: 'none'}}>
                    <Text>{this.props.reportName}</Text>
                    {this.state.isUnread && (
                        <Text>- Unread</Text>
                    )}
                </Link>
            </View>
        );
    }
}
SidebarLink.propTypes = propTypes;

export default WithStoreSubscribeToState()(SidebarLink);
