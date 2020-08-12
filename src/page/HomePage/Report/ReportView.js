import React from 'react';
import {View} from 'react-native';
import {withRouter, Route} from '../../../lib/Router';
import styles from '../../../style/StyleSheet';
import ReportHistoryView from './ReportHistoryView';
import ReportHistoryCompose from './ReportHistoryCompose';
import {addHistoryItem} from '../../../lib/actions/ActionsReport';
import KeyboardSpacer from '../../../components/KeyboardSpacer';

const ReportView = () => (
    <View style={styles.flex1}>
        <Route
            path="/:reportID"
            exact
            component={({match}) => (
                <ReportHistoryView reportID={match.params.reportID} />
            )}
        />
        <Route
            path="/:reportID"
            exact
            component={({match}) => (
                <ReportHistoryCompose
                    reportID={match.params.reportID}
                    onSubmit={text => addHistoryItem(match.params.reportID, text)}
                />
            )}
        />
        <KeyboardSpacer />
    </View>
);
ReportView.displayName = 'ReportView';

export default withRouter(ReportView);
