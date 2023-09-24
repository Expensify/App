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
import * as Task from '../../libs/actions/Task';
import CONST from '../../CONST';
import * as Browser from '../../libs/Browser';

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

function NewTaskDetailsPage(props) {
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
            ErrorUtils.addErrorMessage(errors, 'taskTitle', 'newTaskPage.pleaseEnterTaskName');
        }

        return errors;
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    function onSubmit(values) {
        Task.setDetailsValue(values.taskTitle, values.taskDescription);
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
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={props.translate('newTaskPage.assignTask')}
                onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                shouldShowBackButton
                onBackButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
            />
            <Form
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('common.next')}
                style={[styles.mh5, styles.flexGrow1]}
                validate={(values) => validate(values)}
                onSubmit={(values) => onSubmit(values)}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TextInput
                        ref={(el) => (inputRef.current = el)}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        inputID="taskTitle"
                        label={props.translate('task.title')}
                        accessibilityLabel={props.translate('task.title')}
                        value={taskTitle}
                        onValueChange={(value) => setTaskTitle(value)}
                    />
                </View>
                <View style={styles.mb5}>
                    <TextInput
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        inputID="taskDescription"
                        label={props.translate('newTaskPage.descriptionOptional')}
                        accessibilityLabel={props.translate('newTaskPage.descriptionOptional')}
                        autoGrowHeight
                        submitOnEnter={!Browser.isMobile()}
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        textAlignVertical="top"
                        value={taskDescription}
                        onValueChange={(value) => setTaskDescription(value)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

NewTaskDetailsPage.displayName = 'NewTaskDetailsPage';
NewTaskDetailsPage.propTypes = propTypes;
NewTaskDetailsPage.defaultProps = defaultProps;

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
)(NewTaskDetailsPage);
