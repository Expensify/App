import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import * as ErrorUtils from '../../libs/ErrorUtils';
import Form from '../../components/Form';
import TextInput from '../../components/TextInput';
import Permissions from '../../libs/Permissions';
import * as ReportUtils from '../../libs/actions/Report';
import ROUTES from '../../ROUTES';
import TaskSelectorLink from '../../components/TaskSelectorLink';

// TO-DO: Call CreateTask with all the appropriate Data

const propTypes = {
    /** Task Creation Data */
    task: PropTypes.shape({
        assignee: PropTypes.string,
        shareDestination: PropTypes.string,
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

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    task: {},
    personalDetails: {},
};

// NOTE: This page is going to be updated in https://github.com/Expensify/App/issues/16855, this is just a placeholder for now
const NewTaskPage = (props) => {
    const [assignee, setAssignee] = React.useState({});
    const [shareDestination, setShareDestination] = React.useState({});

    useEffect(() => {
        if (props.task.assignee) {
            const details = lodashGet(props.personalDetails, props.task.assignee);
            setAssignee({avatar: details.avatar, displayName: details.displayName, login: details.login});

            // console.log(assignee);
        }
        if (props.task.shareDestination) {
            const details = lodashGet(props.personalDetails, props.task.shareDestination);
            setShareDestination({avatar: details.avatar, displayName: details.displayName, login: details.login});
        }
    }, [props.task, props.personalDetails]);

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    function validate(values) {
        const errors = {};

        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            ErrorUtils.addErrorMessage(errors, 'taskTitle', props.translate('newTaskPage.pleaseEnterTaskName'));
        }

        if (!values.taskAssignee) {
            // We error if the user doesn't enter a task assignee
            ErrorUtils.addErrorMessage(errors, 'taskAssignee', props.translate('newTaskPage.pleaseEnterTaskAssignee'));
        }

        return errors;
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    function onSubmit(values) {
        // eslint-disable-next-line no-console
        console.log('submitting new task', values);
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton title={props.translate('newTaskPage.assignTask')} onCloseButtonPress={() => Navigation.dismissModal()} />
            <Form
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('newTaskPage.assignTask')}
                style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                validate={values => validate(values)}
                onSubmit={values => onSubmit(values)}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TaskSelectorLink
                        avatarImage={assignee.avatar}
                        title={assignee.displayName}
                        description={assignee.login}
                        onPress={() => Navigation.navigate(ROUTES.NEW_TASK_ASSIGNEE)}
                        label="newTaskPage.assignTo"
                    />
                </View>
                <View style={styles.mb5}>
                    <TextInput autoFocus inputID="taskTitle" label={props.translate('newTaskPage.title')} />
                </View>
                <View style={styles.mb5}>
                    <TextInput inputID="taskDescription" label={props.translate('newTaskPage.description')} />
                </View>
                <View style={styles.mb5}>
                    <TaskSelectorLink onPress={() => Navigation.navigate(ROUTES.NEW_TASK_CHAT)} label="newTaskPage.shareIn" />
                </View>
            </Form>
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
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
    withLocalize,
)(NewTaskPage);
