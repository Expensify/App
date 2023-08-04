import React, {useEffect, useMemo} from 'react';
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
import MenuItemWithTopDescription from '../../components/MenuItemWithTopDescription';
import MenuItem from '../../components/MenuItem';
import reportPropTypes from '../reportPropTypes';
import * as Task from '../../libs/actions/Task';
import * as ReportUtils from '../../libs/ReportUtils';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import * as LocalePhoneNumber from '../../libs/LocalePhoneNumber';

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

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    task: {},
    personalDetails: {},
    reports: {},
};

function NewTaskPage(props) {
    const [assignee, setAssignee] = React.useState({});
    const [shareDestination, setShareDestination] = React.useState({});
    const [errorMessage, setErrorMessage] = React.useState('');
    const [parentReport, setParentReport] = React.useState({});
    const shouldClearOutTaskInfoOnUnmount = React.useRef(false);

    const isAllowedToCreateTask = useMemo(() => _.isEmpty(parentReport) || ReportUtils.isAllowedToComment(parentReport), [parentReport]);

    useEffect(() => {
        setErrorMessage('');

        // If we have an assignee, we want to set the assignee data
        // If there's an issue with the assignee chosen, we want to notify the user
        if (props.task.assignee) {
            const displayDetails = Task.getAssignee(props.task.assigneeAccountID, props.personalDetails);
            setAssignee(displayDetails);
        }

        // We only set the parentReportID if we are creating a task from a report
        // this allows us to go ahead and set that report as the share destination
        // and disable the share destination selector
        if (props.task.parentReportID) {
            Task.setShareDestinationValue(props.task.parentReportID);
        }

        // If we have a share destination, we want to set the parent report and
        // the share destination data
        if (props.task.shareDestination) {
            setParentReport(lodashGet(props.reports, `report_${props.task.shareDestination}`, {}));
            const displayDetails = Task.getShareDestination(props.task.shareDestination, props.reports, props.personalDetails);
            setShareDestination(displayDetails);
        }
    }, [props]);

    useEffect(
        () => () => {
            if (!shouldClearOutTaskInfoOnUnmount.current) {
                return;
            }
            Task.clearOutTaskInfo();
        },
        [],
    );

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

        shouldClearOutTaskInfoOnUnmount.current = true;
        Task.createTaskAndNavigate(parentReport.reportID, props.task.title, props.task.description, props.task.assignee, props.task.assigneeAccountID);
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }

    return (
        <ScreenWrapper>
            <FullPageNotFoundView
                shouldShow={!isAllowedToCreateTask}
                onBackButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
            >
                <HeaderWithBackButton
                    title={props.translate('newTaskPage.confirmTask')}
                    onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                    shouldShowBackButton
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.NEW_TASK_DETAILS);
                    }}
                />
                <View style={[styles.containerWithSpaceBetween]}>
                    <View style={styles.mb5}>
                        <MenuItemWithTopDescription
                            description={props.translate('task.title')}
                            title={props.task.title || ''}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_TITLE)}
                            shouldShowRightIcon
                        />
                        <MenuItemWithTopDescription
                            description={props.translate('task.description')}
                            title={props.task.description || ''}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_DESCRIPTION)}
                            shouldShowRightIcon
                            numberOfLinesTitle={2}
                            titleStyle={styles.flex1}
                        />
                        <MenuItem
                            label={assignee.displayName ? props.translate('task.assignee') : ''}
                            title={assignee.displayName || ''}
                            description={assignee.displayName ? LocalePhoneNumber.formatPhoneNumber(assignee.subtitle) : props.translate('task.assignee')}
                            icon={assignee.icons}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_ASSIGNEE)}
                            shouldShowRightIcon
                        />
                        <MenuItem
                            label={shareDestination.displayName ? props.translate('newTaskPage.shareSomewhere') : ''}
                            title={shareDestination.displayName || ''}
                            description={shareDestination.displayName ? shareDestination.subtitle : props.translate('newTaskPage.shareSomewhere')}
                            icon={shareDestination.icons}
                            onPress={() => Navigation.navigate(ROUTES.NEW_TASK_SHARE_DESTINATION)}
                            interactive={!props.task.parentReportID}
                            shouldShowRightIcon={!props.task.parentReportID}
                        />
                    </View>
                    <FormAlertWithSubmitButton
                        isAlertVisible={!_.isEmpty(errorMessage)}
                        message={errorMessage}
                        onSubmit={() => onSubmit()}
                        enabledWhenOffline
                        buttonText={props.translate('newTaskPage.confirmTask')}
                        containerStyles={[styles.mh0, styles.mt5, styles.flex1, styles.ph5]}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

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
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
    withLocalize,
)(NewTaskPage);
