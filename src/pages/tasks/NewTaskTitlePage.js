import React, {useRef} from 'react';
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

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Grab the Share title of the Task */
    task: PropTypes.shape({
        /** Title of the Task */
        title: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    task: {
        title: '',
    },
};

function NewTaskTitlePage(props) {
    const inputRef = useRef(null);

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
        Task.setTitleValue(values.taskTitle);
        Navigation.goBack(ROUTES.NEW_TASK);
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }
    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => {
                if (!inputRef.current) {
                    return;
                }

                inputRef.current.focus();
            }}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={props.translate('task.title')}
                onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
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
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={props.task.title}
                        ref={(el) => (inputRef.current = el)}
                        inputID="taskTitle"
                        label={props.translate('task.title')}
                        accessibilityLabel={props.translate('task.title')}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

NewTaskTitlePage.displayName = 'NewTaskTitlePage';
NewTaskTitlePage.propTypes = propTypes;
NewTaskTitlePage.defaultProps = defaultProps;

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
)(NewTaskTitlePage);
