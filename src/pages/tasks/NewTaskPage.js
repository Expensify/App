import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import Permissions from '../../libs/Permissions';
import ROUTES from '../../ROUTES';
import TaskSelectorLink from '../../components/TaskSelectorLink';
import reportPropTypes from '../reportPropTypes';
import * as TaskUtils from '../../libs/actions/Task';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';

const propTypes = {
    /** Task Creation Data */
    task: PropTypes.shape({
        assignee: PropTypes.string,
        shareDestination: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        parentReportID: PropTypes.string,
    }),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

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

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    task: {},
    personalDetails: {},
    reports: {},
    session: {},
};

const NewTaskPage = (props) => {
    const [assignee, setAssignee] = React.useState({});
    const [shareDestination, setShareDestination] = React.useState({});
    const [errorMessage, setErrorMessage] = React.useState('');
    const [parentReport, setParentReport] = React.useState({});

    useEffect(() => {
        setErrorMessage('');

        // If we have an assignee, we want to set the assignee data
        // If there's an issue with the assignee chosen, we want to notify the user
        if (props.task.assignee) {
            const assigneeDetails = lodashGet(OptionsListUtils.getPersonalDetailsForLogins([props.task.assignee], props.personalDetails), props.task.assignee);
            if (!assigneeDetails) {
                return setErrorMessage(props.translate('newTaskPage.assigneeError'));
            }
            const displayDetails = TaskUtils.getAssignee(assigneeDetails);
            setAssignee(displayDetails);
        }

        // We only set the parentReportID if we are creating a task from a report
        // this allows us to go ahead and set that report as the share destination
        // and disable the share destination selector
        if (props.task.parentReportID) {
            TaskUtils.setShareDestinationValue(props.task.parentReportID);
        }

        // If we have a share destination, we want to set the parent report and
        // the share destination data
        if (props.task.shareDestination) {
            setParentReport(lodashGet(props.reports, `report_${props.task.shareDestination}`, {}));
            const displayDetails = TaskUtils.getShareDestination(props.task.shareDestination, props.reports, props.personalDetails);
            setShareDestination(displayDetails);
        }
    }, [props]);

    // On submit, we want to call the createTask function and wait to validate
    // the response
    function onSubmit() {
        if (!props.task.title && !props.task.shareDestination) {
            setErrorMessage(props.translate('newTaskPage.confirmError'));
            return;
        }

        if (!props.task.title) {
            setErrorMessage(props.translate('newTaskPage.pleaseEnterTaskName'));
            return;
        }

        if (!props.task.shareDestination) {
            setErrorMessage(props.translate('newTaskPage.pleaseEnterTaskDestination'));
            return;
        }

        TaskUtils.createTaskAndNavigate(props.session.email, parentReport.reportID, props.task.title, props.task.description, props.task.assignee);
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={props.translate('newTaskPage.confirmTask')}
                onCloseButtonPress={() => TaskUtils.dismissModalAndClearOutTaskInfo()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK_DETAILS)}
            />
            <View style={[styles.mt5, styles.ph5, styles.containerWithSpaceBetween]}>
                <View>
                    <View style={styles.mb5}>
                        <TaskSelectorLink
                            text={props.task.title}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_TITLE)}
                            label="newTaskPage.title"
                        />
                    </View>
                    <View style={styles.mb5}>
                        <TaskSelectorLink
                            text={props.task.description}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_DESCRIPTION)}
                            label="newTaskPage.description"
                        />
                    </View>
                    <View style={styles.mb5}>
                        <TaskSelectorLink
                            icons={assignee.icons}
                            text={assignee.displayName}
                            alternateText={assignee.subtitle}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_ASSIGNEE)}
                            label="newTaskPage.assignee"
                        />
                    </View>
                    <View style={styles.mb5}>
                        <TaskSelectorLink
                            icons={shareDestination.icons}
                            text={shareDestination.displayName}
                            alternateText={shareDestination.subtitle}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_SHARE_DESTINATION)}
                            label="newTaskPage.shareSomewhere"
                            isShareDestination
                            disabled={Boolean(props.task.parentReportID)}
                        />
                    </View>
                </View>
                <FormAlertWithSubmitButton
                    isAlertVisible={!_.isEmpty(errorMessage)}
                    message={errorMessage}
                    onSubmit={() => onSubmit()}
                    enabledWhenOffline
                    buttonText={props.translate('newTaskPage.confirmTask')}
                    containerStyles={[styles.mh0, styles.mt5, styles.flex1]}
                />
            </View>
        </ScreenWrapper>
    );
};

NewTaskPage.displayName = 'NewTaskPage';
NewTaskPage.propTypes = propTypes;
NewTaskPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        task: {
            key: ONYXKEYS.TASK,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    withLocalize,
)(NewTaskPage);
