import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import * as TaskUtils from '../../libs/actions/Task';
import reportPropTypes from '../reportPropTypes';
import MenuItemWithTopDescription from '../../components/MenuItemWithTopDescription';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Text from '../../components/Text';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import themeColors from '../../styles/themes/default';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(
        PropTypes.shape({
            /** Display name of the person */
            displayName: PropTypes.string,

            /** Avatar URL of the person */
            avatar: PropTypes.string,

            /** Login of the person */
            login: PropTypes.string,
        }),
    ),

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
};

function TaskHeaderView(props) {
    console.log('TaskHeaderView', props.report);
    return (
        <>
            <View style={[styles.ph3, styles.peopleRow]}>
                {props.report.assignee ? (
                    <Text>{props.personalDetails[props.report.assignee] ? props.personalDetails[props.report.assignee].displayName : ''}</Text>
                ) : (
                    <MenuItemWithTopDescription
                        shouldShowHeaderTitle
                        title=""
                        description={props.translate('common.to')}
                        onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                    />
                )}
                {props.report.stateNum === 2 && props.report.statusNum === 3 ? (
                    <View style={[styles.flexRow]}>
                        <Icon
                            src={Expensicons.Checkmark}
                            fill={themeColors.iconSuccessFill}
                        />
                        <Text style={[styles.textSuccess, styles.ml1]}>{props.translate('task.messages.completed')}</Text>
                    </View>
                ) : (
                    <Button
                        success
                        style={[styles.p3]}
                        text="Mark as Done"
                        onPress={() => TaskUtils.completeTask(props.report.reportID, props.report.parentReportID, props.report.reportName)}
                    />
                )}
            </View>
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
TaskHeaderView.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(TaskHeaderView);
