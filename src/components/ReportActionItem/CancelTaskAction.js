import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ROUTES from '../../ROUTES';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Text from '../Text';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';

const propTypes = {
    /** The ID of the associated taskReport */
    taskReportID: PropTypes.string.isRequired,

    /* Onyx Props */

    taskReport: PropTypes.shape({
        /** Title of the task */
        reportName: PropTypes.string,

        /** Email address of the manager in this iou report */
        managerEmail: PropTypes.string,

        /** Email address of the creator of this iou report */
        ownerEmail: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    taskReport: {},
};
const CancelTaskAction = (props) => {
    const taskReportID = props.taskReportID;
    const taskReportName = props.taskReport.reportName || '';

    return (
        <Pressable
            onPress={() => Navigation.navigate(ROUTES.getReportRoute(taskReportID))}
            style={[styles.flexRow, styles.justifyContentBetween]}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Text style={styles.chatItemMessageLink}>{props.translate('task.canceled')}</Text>
                <Text style={[styles.chatItemMessage]}>{` ${taskReportName}`}</Text>
            </View>
            <Icon src={Expensicons.ArrowRight} />
        </Pressable>
    );
};

CancelTaskAction.propTypes = propTypes;
CancelTaskAction.defaultProps = defaultProps;
CancelTaskAction.displayName = 'CancelTaskAction';

export default compose(
    withLocalize,
    withOnyx({
        taskReport: {
            key: ({taskReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
        },
    }),
)(CancelTaskAction);
