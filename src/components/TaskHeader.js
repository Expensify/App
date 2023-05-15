import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import participantPropTypes from './participantPropTypes';
import Avatar from './Avatar';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import withWindowDimensions from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Icon from './Icon';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Button from './Button';
import * as TaskUtils from '../libs/actions/Task';
import TaskSelectorLink from './TaskSelectorLink';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The parent report of the currently looked at report */
    parentReport: reportPropTypes,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    parentReport: {},
};

function TaskHeader(props) {
    const [assignee, setAssignee] = useState({});
    const title = ReportUtils.getReportName(props.report);
    const assigneeName = ReportUtils.getDisplayNameForParticipant(props.report.managerEmail);
    const assigneeAvatar = ReportUtils.getAvatar(lodashGet(props.personalDetails, [props.report.managerEmail, 'avatar']), props.report.managerEmail);
    const isCompleted = props.report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum === CONST.REPORT.STATUS.APPROVED;
    const parentReportID = props.report.parentReportID;
    console.log('report prop', props.report);

    useEffect(() => {
        TaskUtils.clearOutTaskInfo();
        TaskUtils.setTaskReport(props.report);
        if (!props.report.assignee) {
            return;
        }
        const assigneeDetails = lodashGet(props.personalDetails, props.report.assignee);
        const displayDetails = TaskUtils.getAssignee(assigneeDetails);
        setAssignee(displayDetails);
    }, [props]);

    return (
        <View style={styles.borderBottom}>
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                    <TouchableOpacity onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                {props.report.managerEmail && (
                                    <>
                                        <Avatar
                                            source={assigneeAvatar}
                                            type={CONST.ICON_TYPE_AVATAR}
                                            name={assigneeName}
                                            size={CONST.AVATAR_SIZE.HEADER}
                                        />
                                        <View style={[styles.flexColumn, styles.ml3]}>
                                            <Text
                                                style={[styles.headerText, styles.pre]}
                                                numberOfLines={1}
                                            >
                                                {assigneeName}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                            <View style={[styles.flexRow]}>
                                {isCompleted ? (
                                    <>
                                        <Text>{props.translate('task.completed')}</Text>
                                        <View style={styles.moneyRequestHeaderCheckmark}>
                                            <Icon
                                                src={Expensicons.Checkmark}
                                                fill={themeColors.iconSuccessFill}
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <Button
                                        success
                                        medium
                                        text={props.translate('newTaskPage.markAsDone')}
                                        onPress={() => TaskUtils.completeTask(props.report.reportID, parentReportID, title)}
                                    />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
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
        </View>
    );
}

TaskHeader.propTypes = propTypes;
TaskHeader.displayName = 'TaskHeader';
TaskHeader.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
        },
    }),
)(TaskHeader);
