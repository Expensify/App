import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import * as Task from '@userActions/Task';

const propTypes = {
    /** Name of the reportAction action */
    actionName: PropTypes.string.isRequired,

    /** The ID of the associated taskReport */
    // eslint-disable-next-line react/no-unused-prop-types -- This is used in the withOnyx HOC
    taskReportID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function TaskAction(props) {
    const styles = useThemeStyles();
    return (
        <>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Text style={[styles.chatItemMessage, styles.colorMuted]}>{Task.getTaskReportActionMessage(props.actionName, props.taskReportID, false)}</Text>
            </View>
        </>
    );
}

TaskAction.propTypes = propTypes;
TaskAction.displayName = 'TaskAction';

export default withLocalize(TaskAction);
