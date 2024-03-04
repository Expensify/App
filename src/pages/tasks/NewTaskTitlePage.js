import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
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
    /** Grab the Share title of the Task */
    task: PropTypes.shape({
        /** Title of the Task */
        title: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    task: {
        title: '',
    },
};

function NewTaskTitlePage(props) {
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

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

        return errors;
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    function onSubmit(values) {
        Task.setTitleValue(values.taskTitle);
        Navigation.goBack(ROUTES.NEW_TASK);
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewTaskTitlePage.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('task.title')}
                onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
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
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={props.task.title}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.TASK_TITLE}
                        label={props.translate('task.title')}
                        accessibilityLabel={props.translate('task.title')}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewTaskTitlePage.displayName = 'NewTaskTitlePage';
NewTaskTitlePage.propTypes = propTypes;
NewTaskTitlePage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
    withLocalize,
)(NewTaskTitlePage);
