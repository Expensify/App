import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import * as Store from '../../../store/Store';
import {withRouter} from '../../../lib/Router';
import WithStore from '../../../components/WithStore';
import STOREKEYS from '../../../store/STOREKEYS';
import styles from '../../../style/StyleSheet';
import ReportHistoryView from './ReportHistoryView';

const propTypes = {
    // These are from WithStore
    bind: PropTypes.func.isRequired,
    unbind: PropTypes.func.isRequired,

    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,
};

class ReportView extends React.Component {
    componentDidMount() {
        this.props.bind(`${STOREKEYS.REPORT}_${this.props.match.params.reportID}`, null, null, 'report', this);
    }

    componentDidUpdate(prevProps) {
        // If the report changed, then we need to re-bind to the store
        if (prevProps.match.params.reportID !== this.props.match.params.reportID) {
            this.props.unbind();
            const key = `${STOREKEYS.REPORT}_${this.props.match.params.reportID}`;
            this.props.bind(key, null, null, 'report', this);
        }
    }

    render() {
        // Update the current report in the store so any other components can update
        if (this.state && this.state.report) {
            Store.set(STOREKEYS.CURRENT_REPORT, this.state.report);
        }

        return (
            <View>
                <View style={styles.flexGrow1}>
                    <ReportHistoryView reportID={this.props.match.params.reportID} />
                </View>
            </View>
        );
    }
}
ReportView.propTypes = propTypes;

export default withRouter(WithStore()(ReportView));
