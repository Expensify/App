import React from 'react';
import {withRouter, Route} from '../../../lib/Router';
import ReportHistoryView from './ReportHistoryView';
import ReportHistoryCompose from './ReportHistoryCompose';
import {addHistoryItem} from '../../../lib/actions/ActionsReport';
import KeyboardSpacer from '../../../components/KeyboardSpacer';

const ReportView = () => (
    <>
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
    </>
);
ReportView.displayName = 'ReportView';

export default withRouter(ReportView);
