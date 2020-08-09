import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import {withRouter} from '../../../lib/Router';
import WithStoreSubscribeToState from '../../../components/WithStoreSubscribeToState';
import STOREKEYS from '../../../store/STOREKEYS';

const propTypes = {
    // These are from WithStoreSubscribeToState
    bind: PropTypes.func.isRequired,
    unbind: PropTypes.func.isRequired,

    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,
};

class ReportView extends React.Component {
    componentDidMount() {
        this.props.bind(`${STOREKEYS.REPORT}_${this.props.match.params.reportID}`, null, null, 'report', this, true);
    }

    componentDidUpdate(prevProps) {
        // If the report changed, then we need to re-bind to the store
        if (prevProps.match.params.reportID !== this.props.match.params.reportID) {
            this.props.unbind();
            const key = `${STOREKEYS.REPORT}_${this.props.match.params.reportID}`;
            this.props.bind(key, null, null, 'report', this, true);
        }
    }

    render() {
        return (
            <View>
                <Text>
                    {this.state && this.state.report && this.state.report.reportName}
                </Text>
            </View>
        );
    }
}
ReportView.propTypes = propTypes;

export default withRouter(WithStoreSubscribeToState()(ReportView));
