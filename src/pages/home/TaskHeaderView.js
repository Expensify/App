import React from 'react';
import lodashGet from 'lodash/get';
import reportPropTypes from '../reportPropTypes';
import MenuItemWithTopDescription from '../../components/MenuItemWithTopDescription';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,
};

function TaskHeaderView(props) {
    return (
        <>
            <MenuItemWithTopDescription
                shouldShowHeaderTitle
                title={props.report.reportName}
                description="Task"
                onPress={() => Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID))}
            />
            <MenuItemWithTopDescription
                title={lodashGet(props.report, 'description', '')}
                description="Description"
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
            />
        </>
    );
}

TaskHeaderView.propTypes = propTypes;
TaskHeaderView.displayName = 'TaskHeaderView';

export default TaskHeaderView;
