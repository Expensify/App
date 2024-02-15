import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NewTaskForm';

const propTypes = {
    /** Task title and description data */
    task: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    task: {},
};

const parser = new ExpensiMark();

function NewTaskDetailsPage(props) {
    const styles = useThemeStyles();
    const [taskTitle, setTaskTitle] = useState(props.task.title);
    const [taskDescription, setTaskDescription] = useState(props.task.description || '');

    const {inputCallbackRef} = useAutoFocusInput();

    useEffect(() => {
        setTaskTitle(props.task.title);
        setTaskDescription(parser.htmlToMarkdown(parser.replace(props.task.description || '')));
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
        } else if (values.taskTitle.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'taskTitle', ['common.error.characterLimitExceedCounter', {length: values.taskTitle.length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
        }
        if (values.taskDescription.length > CONST.DESCRIPTION_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'taskDescription', ['common.error.characterLimitExceedCounter', {length: values.taskDescription.length, limit: CONST.DESCRIPTION_LIMIT}]);
        }

        return errors;
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    function onSubmit(values) {
        Task.setDetailsValue(values.taskTitle, values.taskDescription);
        Navigation.navigate(ROUTES.NEW_TASK);
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewTaskDetailsPage.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('newTaskPage.assignTask')}
                onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                shouldShowBackButton
                onBackButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('common.next')}
                style={[styles.mh5, styles.flexGrow1]}
                validate={(values) => validate(values)}
                onSubmit={(values) => onSubmit(values)}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.TASK_TITLE}
                        label={props.translate('task.title')}
                        accessibilityLabel={props.translate('task.title')}
                        value={taskTitle}
                        onValueChange={(value) => setTaskTitle(value)}
                        autoCorrect={false}
                    />
                </View>
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.TASK_DESCRIPTION}
                        label={props.translate('newTaskPage.descriptionOptional')}
                        accessibilityLabel={props.translate('newTaskPage.descriptionOptional')}
                        autoGrowHeight
                        shouldSubmitForm
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        defaultValue={parser.htmlToMarkdown(parser.replace(taskDescription))}
                        value={taskDescription}
                        onValueChange={(value) => setTaskDescription(value)}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewTaskDetailsPage.displayName = 'NewTaskDetailsPage';
NewTaskDetailsPage.propTypes = propTypes;
NewTaskDetailsPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
    withLocalize,
)(NewTaskDetailsPage);
