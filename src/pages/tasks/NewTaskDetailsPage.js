import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import * as ErrorUtils from '../../libs/ErrorUtils';
import Form from '../../components/Form';
import TextInput from '../../components/TextInput';
import Permissions from '../../libs/Permissions';
import ROUTES from '../../ROUTES';
import * as TaskUtils from '../../libs/actions/Task';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Task title and description data */
    task: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    task: {},
};

const NewTaskPage = (props) => {
    const inputRef = useRef();
    const [taskTitle, setTaskTitle] = useState(props.task.title);
    const [taskDescription, setTaskDescription] = useState(props.task.description || '');

    useEffect(() => {
        setTaskTitle(props.task.title);
        setTaskDescription(props.task.description || '');
    }, [props.task]);

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

        return errors;
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    function onSubmit(values) {
        TaskUtils.setDetailsValue(values.taskTitle, values.taskDescription);
        Navigation.navigate(ROUTES.NEW_TASK);
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }
    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => inputRef.current && inputRef.current.focus()}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={props.translate('newTaskPage.assignTask')}
                onCloseButtonPress={() => TaskUtils.dismissModalAndClearOutTaskInfo()}
                shouldShowBackButton
                onBackButtonPress={() => TaskUtils.dismissModalAndClearOutTaskInfo()}
            />
            <Form
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('common.next')}
                style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                validate={(values) => validate(values)}
                onSubmit={(values) => onSubmit(values)}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TextInput
                        ref={(el) => (inputRef.current = el)}
                        inputID="taskTitle"
                        label={props.translate('newTaskPage.title')}
                        value={taskTitle}
                        onValueChange={(value) => setTaskTitle(value)}
                    />
                </View>
                <View style={styles.mb5}>
                    <TextInput
                        inputID="taskDescription"
                        label={props.translate('newTaskPage.descriptionOptional')}
                        value={taskDescription}
                        onValueChange={(value) => setTaskDescription(value)}
                    />
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
    }),
    withLocalize,
)(NewTaskPage);
