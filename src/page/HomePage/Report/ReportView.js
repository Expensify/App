import React from 'react';
import {withRouter, Route} from '../../../lib/Router';
import ReportHistoryView from './ReportHistoryView';
import ReportHistoryCompose from './ReportHistoryCompose';
import {addHistoryItem} from '../../../lib/actions/ActionsReport';
import KeyboardSpacer from '../../../components/KeyboardSpacer';

const ReportView = () => (
    <>
        <Route path="/:reportID" exact>
            <ReportHistoryView />
            <ReportHistoryCompose
                onSubmit={addHistoryItem}
            />
        </Route>
        <KeyboardSpacer />
    </>
);
ReportView.displayName = 'ReportView';

export default withRouter(ReportView);
