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
