import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
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
import * as OptionsListUtils from '../../libs/OptionsListUtils';
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
    const [assignee, setAssignee] = useState({});
    const assigneeTooltipDetails = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs([props.task.assigneeAccountID], props.personalDetails), false);
    const [shareDestination, setShareDestination] = useState({});
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [parentReport, setParentReport] = useState({});

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

        // If we have a title, we want to set the title
        if (!_.isUndefined(props.task.title)) {
            setTitle(props.task.title);
        }

        // If we have a description, we want to set the description
        if (!_.isUndefined(props.task.description)) {
            setDescription(props.task.description);
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

        Task.createTaskAndNavigate(
            parentReport.reportID,
            props.task.title,
            props.task.description,
            props.task.assignee,
            props.task.assigneeAccountID,
            props.task.assigneeChatReport,
            parentReport.policyID,
        );
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={NewTaskPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={!isAllowedToCreateTask}
                onBackButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                shouldShowLink={false}
            >
                <HeaderWithBackButton
                    title={props.translate('newTaskPage.confirmTask')}
                    onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                    shouldShowBackButton
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.NEW_TASK_DETAILS);
                    }}
                />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <View style={[styles.flex1]}>
                        <View style={styles.mb5}>
                            <MenuItemWithTopDescription
                                description={props.translate('task.title')}
                                title={title}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_TITLE)}
                                shouldShowRightIcon
                            />
                            <MenuItemWithTopDescription
                                description={props.translate('task.description')}
                                title={description}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_DESCRIPTION)}
                                shouldShowRightIcon
                                shouldParseTitle
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
                                titleWithTooltips={assigneeTooltipDetails}
                            />
                            <MenuItem
                                label={shareDestination.displayName ? props.translate('newTaskPage.shareSomewhere') : ''}
                                title={shareDestination.displayName || ''}
                                description={shareDestination.displayName ? shareDestination.subtitle : props.translate('newTaskPage.shareSomewhere')}
                                icon={shareDestination.icons}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_SHARE_DESTINATION)}
                                interactive={!props.task.parentReportID}
                                shouldShowRightIcon={!props.task.parentReportID}
                                titleWithTooltips={!shareDestination.shouldUseFullTitleToDisplay && shareDestination.displayNamesWithTooltips}
                            />
                        </View>
                    </View>
                    <View style={[styles.flexShrink0]}>
                        <FormAlertWithSubmitButton
                            isAlertVisible={!_.isEmpty(errorMessage)}
                            message={errorMessage}
                            onSubmit={() => onSubmit()}
                            enabledWhenOffline
                            buttonText={props.translate('newTaskPage.confirmTask')}
                            containerStyles={[styles.mh0, styles.mt5, styles.flex1, styles.ph5]}
                        />
                    </View>
                </ScrollView>
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
