import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import compose from '@libs/compose';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Current user session */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        accountID: 0,
    },
};

function TaskHeaderActionButton(props) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!Task.canModifyTask(props.report, props.session.accountID)}
                medium
                text={props.translate(ReportUtils.isCompletedTaskReport(props.report) ? 'task.markAsIncomplete' : 'task.markAsComplete')}
                onPress={Session.checkIfActionIsAllowed(() => (ReportUtils.isCompletedTaskReport(props.report) ? Task.reopenTask(props.report) : Task.completeTask(props.report)))}
                style={[styles.flex1]}
            />
        </View>
    );
}

TaskHeaderActionButton.propTypes = propTypes;
TaskHeaderActionButton.defaultProps = defaultProps;
TaskHeaderActionButton.displayName = 'TaskHeaderActionButton';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(TaskHeaderActionButton);
