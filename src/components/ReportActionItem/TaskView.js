import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import reportPropTypes from '../../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import participantPropTypes from '../participantPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import compose from '../../libs/compose';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    ...withLocalizePropTypes,
};

function TaskView(props) {
    return (
        <View>
            <MenuItemWithTopDescription
                label={props.translate('task.title')}
                title={props.report.reportName}
                // description={shareDestination.displayName ? shareDestination.subtitle : props.translate('newTaskPage.shareSomewhere')}
                // icon={shareDestination.icons}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID))}
                shouldShowRightIcon
            />
            <MenuItemWithTopDescription
                label={props.translate('task.description')}
                title={props.report.description}
                // description={shareDestination.displayName ? shareDestination.subtitle : props.translate('newTaskPage.shareSomewhere')}
                // icon={shareDestination.icons}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
                shouldShowRightIcon
            />
        </View>
    );
}

TaskView.propTypes = propTypes;
TaskView.displayName = 'TaskView';

export default compose(withWindowDimensions, withLocalize)(TaskView);