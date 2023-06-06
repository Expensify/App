import React, {useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
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
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Button from './Button';
import * as TaskUtils from '../libs/actions/Task';
import * as UserUtils from '../libs/UserUtils';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    ...withLocalizePropTypes,
};

function TaskHeader(props) {
    const title = ReportUtils.getReportName(props.report);
    const assigneeName = ReportUtils.getDisplayNameForParticipant(props.report.managerEmail);
    const assigneeAvatar = UserUtils.getAvatar(lodashGet(props.personalDetails, [props.report.managerEmail, 'avatar']), props.report.managerEmail);
    const isOpen = props.report.stateNum === CONST.REPORT.STATE_NUM.OPEN && props.report.statusNum === CONST.REPORT.STATUS.OPEN;
    const isCompleted = props.report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum === CONST.REPORT.STATUS.APPROVED;
    const parentReportID = props.report.parentReportID;

    useEffect(() => {
        TaskUtils.setTaskReport(props.report);
    }, [props.report]);

    return (
        <View style={styles.borderBottom}>
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                    <PressableWithFeedback
                        onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                        disabled={!isOpen}
                        accessibilityRole="button"
                        accessibilityLabel={props.translate('newTaskPage.assignee')}
                        hoverDimmingValue={1}
                        pressDimmingValue={0.2}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                {!_.isEmpty(props.report.managerEmail) && (
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
                                        isDisabled={TaskUtils.isTaskCanceled(props.report)}
                                        medium
                                        text={props.translate('newTaskPage.markAsDone')}
                                        onPress={() => TaskUtils.completeTask(props.report.reportID, parentReportID, title)}
                                    />
                                )}
                            </View>
                        </View>
                    </PressableWithFeedback>
                </View>
            </View>
            <MenuItemWithTopDescription
                shouldShowHeaderTitle
                title={props.report.reportName}
                description={props.translate('newTaskPage.task')}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID))}
                disabled={!isOpen}
            />
            <MenuItemWithTopDescription
                title={lodashGet(props.report, 'description', '')}
                description={props.translate('newTaskPage.description')}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
                disabled={!isOpen}
            />
        </View>
    );
}

TaskHeader.propTypes = propTypes;
TaskHeader.displayName = 'TaskHeader';

export default compose(withWindowDimensions, withLocalize)(TaskHeader);
