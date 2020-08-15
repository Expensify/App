import React from 'react';
import _ from 'underscore';
import ReportView from './Report/ReportView';
import WithIon from '../../components/WithIon';
import IONKEYS from '../../IONKEYS';

class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (!this.state || !this.state.reports || this.state.reports.length === 0) {
            return null;
        }

        return (
            <>
                {_.map(this.state.reports, report => (
                    <ReportView key={report.reportID} reportID={report.reportID} />
                ))}
            </>
        );
    }
}

export default WithIon({
    reports: {
        key: `${IONKEYS.REPORT}_[0-9]+$`,
        addAsCollection: true,
        collectionID: 'reportID',
    },
})(MainView);
