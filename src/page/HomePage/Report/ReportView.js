import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withRouter, Route} from '../../../lib/Router';
import styles from '../../../style/StyleSheet';
import ReportHistoryView from './ReportHistoryView';
import ReportHistoryCompose from './ReportHistoryCompose';
import {addHistoryItem} from '../../../store/actions/ReportActions';
import KeyboardSpacer from '../../../components/KeyboardSpacer';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,
};

const ReportView = props => (
    <View style={styles.flex1}>
        <Route path="/:reportID" exact>
            <ReportHistoryView reportID={props.match.params.reportID} />
            <ReportHistoryCompose onSubmit={text => addHistoryItem(props.match.params.reportID, text)} />
                    <KeyboardSpacer />
                </Route>
    </View>
);
ReportView.propTypes = propTypes;
ReportView.displayName = 'ReportView';

export default withRouter(ReportView);
