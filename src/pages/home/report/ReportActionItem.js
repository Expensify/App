import _ from 'underscore';
import React, {useState, useEffect, useRef} from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import * as ReportUtils from '../../libs/ReportUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import * as TaskUtils from '../../libs/TaskUtils';
import RenderHTML from '../../components/RenderHTML';

const propTypes = {
    /** All the data of the action item */
    const [isTaskReport, setIsTaskReport] = useState(false);
    const [taskReport, setTaskReport] = useState({});
    const [taskAssignee, setTaskAssignee] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    useEffect(() => {
        if (ReportActionsUtils.isTaskAction(props.action)) {
            if (taskReportID) {
                setIsTaskReport(true);
                setTaskReport(ReportUtils.getReport(taskReportID) || {});
                setTaskDescription(TaskUtils.getTaskDescription(ReportUtils.getReport(taskReportID) || {}));
            }
        }
    }, [props.action]);
    useEffect(() => {
        if (isTaskReport && taskReport) {
            setTaskAssignee(TaskUtils.getTaskAssignee(taskReport));
            setTaskDescription(TaskUtils.getTaskDescription(taskReport));
        }
    }, [isTaskReport, taskReport]);

            return (
                <View style={[styles.p5, styles.borderRadiusNormal, styles.overflowHidden]}>
                    <Text style={[styles.textSupporting, styles.mb1]}>Task: {TaskUtils.getTaskReportName(taskReport)}</Text>
                    {taskDescription && (
                        <View style={[styles.mt2]}>
                            <RenderHTML html={`<div>${taskDescription.replace(/\n/g, '<br/>')}</div>`} />
                        </View>
                    )}
                    {taskAssignee && (
                        <Text style={[styles.textSupporting, styles.mt1]}>
                            Assignee: {taskAssignee}